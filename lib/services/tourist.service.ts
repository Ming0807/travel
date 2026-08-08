import "server-only";
import { findTouristByIdentity, createTouristProfile, createTouristIdentity } from "@/lib/repositories/tourist.repository";
import { createConsentRecord } from "@/lib/repositories/consent.repository";

export async function setupGuestTouristProfile(params: {
  guestToken: string;
  displayName: string;
  ageGroup: string;
  originCountryId?: number | null;
  originProvinceId?: number | null;
  hasConsented: boolean;
  preferredLanguage?: import("@/lib/validation/language").PreferredLanguage;
  preferredLanguageSource?: import("@/lib/validation/language").PreferredLanguageSource;
}): Promise<string> {
  // 1. Check if the tourist already exists for this guest token
  let touristId = await findTouristByIdentity("anonymous_device", params.guestToken);

  if (!touristId) {
    // 2. Create the tourist profile if they don't exist
    touristId = await createTouristProfile({
      displayName: params.displayName,
      ageGroup: params.ageGroup,
      originCountryId: params.originCountryId,
      originProvinceId: params.originProvinceId,
      preferredLanguage: params.preferredLanguage,
      preferredLanguageSource: params.preferredLanguageSource,
    });

    // 3. Link the anonymous device identity to the new profile
    await createTouristIdentity(touristId, "anonymous_device", params.guestToken);
  } else {
    // For MVP, if returning guest, we just reuse the profile. 
    // In future phases, we could update the profile here.
  }

  // 4. Record consent unconditionally for this flow attempt
  if (params.hasConsented) {
    await createConsentRecord({
      touristId,
      consentVersion: "v1.0",
      purpose: "certificate_generation, tourism_planning_analytics",
      hasConsented: true,
    });
  }

  return touristId;
}
