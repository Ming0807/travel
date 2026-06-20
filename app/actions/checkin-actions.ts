"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrCreateGuestIdentity } from "@/lib/auth/guest";
import { resolveAndValidateCheckinCode, trackCheckinFunnelEvent } from "@/lib/services/checkin.service";
import { initiateVisit } from "@/lib/services/visit.service";
import { awardXP } from "@/lib/services/xp.service";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { resolveCountryId, resolveProvinceId } from "@/lib/repositories/geography.repository";
import { createConsentRecord } from "@/lib/repositories/consent.repository";

import { minimalFormSchema } from "@/lib/validation/checkin";

const CHECKIN_CONSENT_VERSION = "1.0";
const CHECKIN_CONSENT_PURPOSE_KEY = "checkin_profile_creation";

export type MinimalFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

async function cleanupNewTourist(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  touristId: string
) {
  await supabase
    .from("tourist_identities")
    .delete()
    .eq("tourist_id", touristId)
    .eq("provider", "anonymous_device");

  await supabase
    .from("consent_records")
    .delete()
    .eq("tourist_id", touristId)
    .eq("purpose_key", CHECKIN_CONSENT_PURPOSE_KEY);

  await supabase.from("tourists").delete().eq("tourist_id", touristId);
}

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

    // Lookup geography
    let originCountryId: number | null = null;
    let originProvinceId: number | null = null;
    try {
      originCountryId = await resolveCountryId(parsed.data.originCountry);
    } catch {
      return { errors: { _form: ["เกิดข้อผิดพลาดในฐานข้อมูลประเทศ กรุณาลองใหม่"] } };
    }

    if (parsed.data.originCountry?.toLowerCase() === "thailand" || parsed.data.originCountry === "ไทย") {
      try {
        originProvinceId = await resolveProvinceId(parsed.data.originProvince ?? null);
      } catch {
        return { errors: { _form: ["เกิดข้อผิดพลาดในฐานข้อมูลจังหวัด กรุณาลองใหม่"] } };
      }
    }

    // Check if guest already has a tourist profile
    const { data: existingIdentity, error: identityLookupError } = await supabase
      .from("tourist_identities")
      .select("tourist_id, tourists!inner(origin_country_id, origin_province_id, age_group)")
      .eq("provider", "anonymous_device")
      .eq("provider_user_id", guestToken)
      .maybeSingle();

    if (identityLookupError) {
      return { errors: { _form: ["เกิดข้อผิดพลาดในการตรวจสอบบัญชีผู้เดินทาง กรุณาลองใหม่"] } };
    }

    let touristId: string;
    let isNewTourist = false;

    if (existingIdentity) {
      touristId = existingIdentity.tourist_id;
      // Update last_seen
      void supabase
        .from("tourist_identities")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("provider", "anonymous_device")
        .eq("provider_user_id", guestToken);

      // Backfill missing fields
      const t = Array.isArray(existingIdentity.tourists) ? existingIdentity.tourists[0] : existingIdentity.tourists;
      if (t) {
        const updates: Partial<{ origin_country_id: number; origin_province_id: number; age_group: string }> = {};
        if (!t.origin_country_id && originCountryId) updates.origin_country_id = originCountryId;
        if (!t.origin_province_id && originProvinceId) updates.origin_province_id = originProvinceId;
        if (!t.age_group && parsed.data.ageGroup) updates.age_group = parsed.data.ageGroup;

        if (Object.keys(updates).length > 0) {
          const { error: updateError } = await supabase.from("tourists").update(updates).eq("tourist_id", touristId);
          if (updateError) {
            return { errors: { _form: ["เกิดข้อผิดพลาดในการปรับปรุงข้อมูล กรุณาลองใหม่"] } };
          }
        }
      }
    } else {
      isNewTourist = true;
      // Create new tourist
      const { data: newTourist, error: touristError } = await supabase
        .from("tourists")
        .insert({
          display_name: parsed.data.displayName,
          age_group: parsed.data.ageGroup || null,
          origin_country_id: originCountryId,
          origin_province_id: originProvinceId,
          profile_completed_at: new Date().toISOString(),
        })
        .select("tourist_id")
        .single();

      if (touristError || !newTourist) {
        return { errors: { _form: ["ไม่สามารถสร้างโปรไฟล์นักท่องเที่ยวได้ กรุณาลองใหม่"] } };
      }

      touristId = newTourist.tourist_id;
    }

    // Link identity before consent so cleanup can remove dependent rows in a
    // predictable order if a later required step fails.
    if (isNewTourist) {
      const { error: identityError } = await supabase.from("tourist_identities").insert({
        tourist_id: touristId,
        provider: "anonymous_device",
        provider_user_id: guestToken,
        is_primary: true,
        linked_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      });

      if (identityError) {
        await cleanupNewTourist(supabase, touristId);
        return { errors: { _form: ["เกิดข้อผิดพลาดในการเชื่อมโยงบัญชี กรุณาลองใหม่"] } };
      }
    }

    // Handle Consent - create if they checked it and we don't already have one
    if (parsed.data.hasConsented) {
      const { data: existingConsent, error: checkConsentError } = await supabase
        .from("consent_records")
        .select("consent_id")
        .eq("tourist_id", touristId)
        .eq("consent_version", CHECKIN_CONSENT_VERSION)
        .eq("purpose_key", CHECKIN_CONSENT_PURPOSE_KEY)
        .maybeSingle();

      if (checkConsentError) {
        if (isNewTourist) await cleanupNewTourist(supabase, touristId);
        return { errors: { _form: ["เกิดข้อผิดพลาดในการตรวจสอบความยินยอม กรุณาลองใหม่"] } };
      }

      if (!existingConsent) {
        try {
          await createConsentRecord({
            touristId,
            consentVersion: CHECKIN_CONSENT_VERSION,
            purpose: "Tourist data collection for sustainable tourism planning",
            consentType: "mandatory",
            purposeKey: CHECKIN_CONSENT_PURPOSE_KEY,
            hasConsented: true,
            source: "checkin_form",
            language: "th"
          });
        } catch {
          if (isNewTourist) await cleanupNewTourist(supabase, touristId);
          return { errors: { _form: ["ไม่สามารถบันทึกความยินยอมได้ กรุณาลองใหม่"] } };
        }
      }
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
