"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrCreateGuestIdentity } from "@/lib/auth/guest";
import { resolveAndValidateCheckinCode, trackCheckinFunnelEvent } from "@/lib/services/checkin.service";
import { initiateVisit } from "@/lib/services/visit.service";
import { awardXP } from "@/lib/services/xp.service";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { getCheckinOriginSelection } from "@/lib/repositories/geography.repository";
import { createConsentRecord } from "@/lib/repositories/consent.repository";
import { CHECKIN_CONSENT_PURPOSE_KEY, CHECKIN_CONSENT_VERSION } from "@/lib/config/checkin";
import { linkCurrentResearchSessionVisitIfPresent } from "@/lib/services/research.service";

import { minimalFormSchema } from "@/lib/validation/checkin";

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
      originCountryId: formData.get("originCountryId"),
      originProvinceId: formData.get("originProvinceId"),
      ageGroup: formData.get("ageGroup"),
      hasConsented: formData.get("hasConsented") === "true",
      preferredLanguage: formData.get("preferredLanguage"),
      preferredLanguageSource: formData.get("preferredLanguageSource"),
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

    // Validate controlled geography IDs against active master data.
    let originSelection;
    try {
      originSelection = await getCheckinOriginSelection(
        parsed.data.originCountryId,
        parsed.data.originProvinceId,
      );
    } catch {
      return { errors: { _form: ["ไม่สามารถตรวจสอบประเทศและจังหวัดได้ กรุณาลองใหม่"] } };
    }

    if (!originSelection) {
      return {
        errors: {
          originProvinceId: ["กรุณาเลือกประเทศและจังหวัดจากรายการที่ระบบกำหนด"],
        },
        message: "กรุณาตรวจสอบข้อมูลต้นทาง",
      };
    }

    // Check if guest already has a tourist profile
    const { data: existingIdentity, error: identityLookupError } = await supabase
      .from("tourist_identities")
      .select("tourist_id, tourists!inner(display_name, origin_country_id, origin_province_id, age_group, preferred_language, preferred_language_source)")
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
      await supabase
        .from("tourist_identities")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("provider", "anonymous_device")
        .eq("provider_user_id", guestToken);

      // Keep the reusable tourist profile current while visits remain immutable history.
      const t = Array.isArray(existingIdentity.tourists) ? existingIdentity.tourists[0] : existingIdentity.tourists;
      if (t) {
        const updates: Partial<{
          display_name: string;
          origin_country_id: number;
          origin_province_id: number | null;
          age_group: string;
          preferred_language: string | null;
          preferred_language_source: string | null;
          updated_at: string;
        }> = {};
        if (t.display_name !== parsed.data.displayName) updates.display_name = parsed.data.displayName;
        if (Number(t.origin_country_id) !== originSelection.countryId) {
          updates.origin_country_id = originSelection.countryId;
        }
        const currentProvinceId = t.origin_province_id ? Number(t.origin_province_id) : null;
        if (currentProvinceId !== originSelection.provinceId) {
          updates.origin_province_id = originSelection.provinceId;
        }
        if (t.age_group !== parsed.data.ageGroup) updates.age_group = parsed.data.ageGroup;
        if (parsed.data.preferredLanguage !== null && t.preferred_language !== parsed.data.preferredLanguage) {
          updates.preferred_language = parsed.data.preferredLanguage;
          updates.preferred_language_source = parsed.data.preferredLanguageSource;
        }

        if (Object.keys(updates).length > 0) {
          updates.updated_at = new Date().toISOString();
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
          age_group: parsed.data.ageGroup,
          origin_country_id: originSelection.countryId,
          origin_province_id: originSelection.provinceId,
          preferred_language: parsed.data.preferredLanguage,
          preferred_language_source: parsed.data.preferredLanguageSource,
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
            language: parsed.data.preferredLanguage
          });
        } catch {
          if (isNewTourist) await cleanupNewTourist(supabase, touristId);
          return { errors: { _form: ["ไม่สามารถบันทึกความยินยอมได้ กรุณาลองใหม่"] } };
        }
      }
    }

    // 5. Create visit record
    visitId = await initiateVisit({
      touristId,
      attractionId: context.details.attraction.attraction_id,
      photoSpotId: context.details.photo_spot?.photo_spot_id || null,
      checkinCodeId: context.details.checkin_code_id,
    });

    try {
      await linkCurrentResearchSessionVisitIfPresent({ visitId });
    } catch {
      // Research is voluntary and must never block the certificate flow.
    }

    try {
      await trackCheckinFunnelEvent("minimal_form_completed", context.details, {
        touristId,
        visitId,
      });
    } catch {
      // Analytics must never block the tourist reward flow.
    }

    // 6. Award XP for checkin
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
