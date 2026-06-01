"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrCreateGuestIdentity } from "@/lib/auth/guest";
import { resolveAndValidateCheckinCode, trackCheckinFunnelEvent } from "@/lib/services/checkin.service";
import { initiateVisit } from "@/lib/services/visit.service";
import { awardXP } from "@/lib/services/xp.service";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

const minimalFormSchema = z.object({
  displayName: z.string().min(1, "กรุณากรอกชื่อของคุณ").max(100),
  originCountry: z.string().min(1).max(100).default("Thailand"),
  originProvince: z.string().max(100).nullable().optional(),
  ageGroup: z.enum(["0-15", "16-24", "25-34", "35-44", "45-54", "55-64", "65+"]).nullable().optional(),
  hasConsented: z.boolean().refine((v) => v === true, { message: "กรุณายอมรับข้อตกลง" }),
});

export type MinimalFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

/**
 * Server Action: initiateCheckin
 * 
 * Called after identity selection on the /checkin/[code]/start page.
 * Sets up tourist identity from guest cookie, creates visit record,
 * then redirects to the certificate preview.
 */
export async function initiateCheckin(
  checkinCode: string,
  prevState: MinimalFormState,
  formData: FormData
): Promise<MinimalFormState> {
  // visitId needs to be accessible after the try/catch for the redirect
  let visitId: string;

  try {
    // 1. Validate checkin code
    const context = await resolveAndValidateCheckinCode(checkinCode);
    if (context.status !== "valid" || !context.details?.attraction) {
      return { errors: { _form: ["QR Code นี้ไม่สามารถใช้งานได้"] } };
    }

    // 2. Get guest identity
    const guestToken = await getOrCreateGuestIdentity();

    // 3. Validate form
    const raw = {
      displayName: formData.get("displayName"),
      originCountry: formData.get("originCountry") || "Thailand",
      originProvince: formData.get("originProvince") || null,
      ageGroup: formData.get("ageGroup") || null,
      hasConsented: formData.get("hasConsented") === "true",
    };

    const parsed = minimalFormSchema.safeParse(raw);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      return { errors, message: "กรุณาตรวจสอบข้อมูลให้ถูกต้อง" };
    }

    const supabase = createSupabaseServiceRoleClient();

    // 4. Find or create tourist
    let touristId: string;

    // Check if guest already has a tourist profile
    // Attempt to find existing tourist
    const { data: existingIdentity } = await supabase
      .from("tourist_identities")
      .select("tourist_id")
      .eq("provider", "anonymous_device")
      .eq("provider_user_id", guestToken)
      .maybeSingle();

    if (existingIdentity) {
      touristId = existingIdentity.tourist_id;
      // Update last_seen (fire-and-forget, non-critical)
      void supabase
        .from("tourist_identities")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("provider", "anonymous_device")
        .eq("provider_user_id", guestToken);
    } else {
      // Create new tourist
      // Note: origin_country_id/origin_province_id require FK lookups from the
      // reference tables. For now, store display_name and age_group only.
      const { data: newTourist, error: touristError } = await supabase
        .from("tourists")
        .insert({
          display_name: parsed.data.displayName,
          age_group: parsed.data.ageGroup || null,
          profile_completed_at: new Date().toISOString(),
        })
        .select("tourist_id")
        .single();

      if (touristError || !newTourist) {
        return { errors: { _form: ["ไม่สามารถสร้างโปรไฟล์นักท่องเที่ยวได้ กรุณาลองใหม่"] } };
      }

      touristId = newTourist.tourist_id;

      // Create consent record
      await supabase.from("consent_records").insert({
        tourist_id: touristId,
        consent_version: "1.0",
        purpose: "Tourist data collection for sustainable tourism planning",
        has_consented: true,
        source: "checkin_form",
      });

      // Link identity
      await supabase.from("tourist_identities").insert({
        tourist_id: touristId,
        provider: "anonymous_device",
        provider_user_id: guestToken,
        is_primary: true,
        linked_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      });
    }

    // 5. Track funnel events
    await trackCheckinFunnelEvent("certificate_started", context.details, { touristId });

    // 6. Create visit record
    visitId = await initiateVisit({
      touristId,
      attractionId: context.details.attraction.attraction_id,
      photoSpotId: context.details.photo_spot?.photo_spot_id || null,
      checkinCodeId: context.details.checkin_code_id,
    });

    // 7. Track minimal form completed funnel event
    try {
      await trackCheckinFunnelEvent("minimal_form_completed", context.details, { touristId, visitId });
    } catch {
      // Funnel tracking is non-critical
    }

    // 8. Award XP for checkin
    try {
      await awardXP(touristId, "qr_checkin", { attraction_id: context.details.attraction.attraction_id }, visitId);
    } catch {
      // XP award is non-critical
    }
  } catch {
    return { errors: { _form: ["เกิดข้อผิดพลาด กรุณาลองใหม่"] } };
  }

  // Revalidate + Redirect — MUST be OUTSIDE the try/catch block
  // because Next.js redirect() throws a special RedirectError that the
  // server action runtime needs to catch and convert to a redirect response.
  // If caught inside our try/catch, the redirect is silently swallowed.
  revalidatePath(`/checkin/${checkinCode}`);
  redirect(`/visit/${visitId}/photo`);
}

/**
 * Wrapper for useActionState compatibility.
 * Extracts checkinCode from hidden form field and delegates to initiateCheckin.
 */
export async function submitMinimalProfile(
  prevState: MinimalFormState | null,
  formData: FormData
): Promise<MinimalFormState> {
  const checkinCode = formData.get("checkinCode") as string;
  if (!checkinCode) {
    return { errors: { _form: ["Missing check-in code"] } };
  }
  return initiateCheckin(checkinCode, prevState ?? { message: "" }, formData);
}
