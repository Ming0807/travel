import "server-only";
import { resolveCurrentTouristId } from "@/lib/auth/guards";
import { listCertificatesForTourist } from "@/lib/repositories/certificate.repository";
import { getTouristById, listTouristIdentityProviders } from "@/lib/repositories/tourist.repository";
import { getCurrentTouristPassport } from "@/lib/services/passport.service";

export async function getCurrentTouristProfileSummary() {
  const touristId = await resolveCurrentTouristId();
  const [tourist, identities, certificates, passport] = await Promise.all([
    getTouristById(touristId),
    listTouristIdentityProviders(touristId),
    listCertificatesForTourist(touristId),
    getCurrentTouristPassport()
  ]);

  const linkedProviders = identities
    .map((identity) => identity.provider)
    .filter((provider) => provider !== "anonymous_device");

  const touristProvince = Array.isArray(tourist?.provinces) ? tourist?.provinces[0] : tourist?.provinces;
  const touristCountry = Array.isArray(tourist?.countries) ? tourist?.countries[0] : tourist?.countries;

  return {
    displayName: tourist?.display_name || "นักเดินทาง",
    origin:
      touristProvince?.province_name_th ||
      touristCountry?.country_name_th ||
      touristProvince?.province_name_en ||
      touristCountry?.country_name_en ||
      "ไม่ระบุ",
    ageGroup: tourist?.age_group || "prefer_not_to_answer",
    preferredLanguage: tourist?.preferred_language || "th",
    isGuest: linkedProviders.length === 0,
    linkedProviders,
    passportSummary: {
      totalStampsEarned: passport.totalStampsEarned,
      provinceProgress: passport.provinceProgress
    },
    certificateHistory: certificates.map((certificate) => {
      const visit = Array.isArray(certificate.visits) ? certificate.visits[0] : certificate.visits;
      const attraction = Array.isArray(visit?.attractions) ? visit?.attractions[0] : visit?.attractions;
      const province = Array.isArray(attraction?.provinces) ? attraction?.provinces[0] : attraction?.provinces;

      return {
        generatedAt: certificate.generated_at,
        visitDate: visit?.visit_date || null,
        attractionName: attraction?.name_th || attraction?.name_en || "สถานที่ท่องเที่ยว",
        provinceName: province?.province_name_th || province?.province_name_en || "Southern Border",
        attractionSlug: attraction?.slug || null
      };
    })
  };
}
