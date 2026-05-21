import "server-only";
import { resolveCurrentTouristId } from "@/lib/auth/guards";
import { recordFunnelEvent } from "@/lib/repositories/funnel.repository";
import { listPassportStamps, listPublishedAttractionStampTargets } from "@/lib/repositories/passport.repository";
import { getTouristById, listTouristIdentityProviders } from "@/lib/repositories/tourist.repository";
import { TARGET_PROVINCES } from "@/constants/product";

export type SafePassportStamp = {
  stampName: string;
  attractionName: string;
  attractionSlug: string | null;
  provinceName: string;
  earnedAt: string;
  stampImagePath: string | null;
};

export type PassportProvinceProgress = {
  provinceName: string;
  earnedCount: number;
  totalCount: number;
};

export type PassportViewModel = {
  displayName: string;
  isGuest: boolean;
  linkedProviders: string[];
  totalStampsEarned: number;
  totalStampTargets: number;
  provinceProgress: PassportProvinceProgress[];
  stampsByProvince: Array<{
    provinceName: string;
    stamps: SafePassportStamp[];
  }>;
};

function getNestedSingle<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function safeProvinceName(province: unknown): string {
  const p = getNestedSingle(province as { province_name_th?: string; province_name_en?: string } | null);
  return p?.province_name_th || p?.province_name_en || "Southern Border";
}

function targetProvinceFallback(): PassportProvinceProgress[] {
  return TARGET_PROVINCES.slice(0, 3).map((province) => ({
    provinceName: province.labelTh,
    earnedCount: 0,
    totalCount: 0
  }));
}

export async function getCurrentTouristPassport(): Promise<PassportViewModel> {
  const touristId = await resolveCurrentTouristId();
  const [tourist, identities, rawStamps, rawTargets] = await Promise.all([
    getTouristById(touristId),
    listTouristIdentityProviders(touristId),
    listPassportStamps(touristId),
    listPublishedAttractionStampTargets()
  ]);

  await recordFunnelEvent({
    eventName: "passport_viewed",
    touristId
  });

  const stamps: SafePassportStamp[] = rawStamps.map((stamp) => {
    const attraction = getNestedSingle(stamp.attractions);
    const stampDefinition = getNestedSingle(stamp.stamp_definitions);
    const provinceName = safeProvinceName(attraction?.provinces);

    return {
      stampName:
        stampDefinition?.stamp_name_th ||
        stampDefinition?.stamp_name_en ||
        attraction?.name_th ||
        attraction?.name_en ||
        "ตราประทับการท่องเที่ยว",
      attractionName: attraction?.name_th || attraction?.name_en || "สถานที่ท่องเที่ยว",
      attractionSlug: attraction?.slug || null,
      provinceName,
      earnedAt: stamp.earned_at,
      stampImagePath: stampDefinition?.stamp_image_path || null
    };
  });

  const totalsByProvince = new Map<string, number>();
  for (const target of rawTargets) {
    const attraction = target;
    const provinceName = safeProvinceName(attraction.provinces);
    totalsByProvince.set(provinceName, (totalsByProvince.get(provinceName) || 0) + 1);
  }

  const earnedByProvince = new Map<string, SafePassportStamp[]>();
  for (const stamp of stamps) {
    const current = earnedByProvince.get(stamp.provinceName) || [];
    current.push(stamp);
    earnedByProvince.set(stamp.provinceName, current);
  }

  const provinceNames = new Set([...totalsByProvince.keys(), ...earnedByProvince.keys()]);
  const provinceProgress =
    provinceNames.size > 0
      ? Array.from(provinceNames).map((provinceName) => ({
          provinceName,
          earnedCount: earnedByProvince.get(provinceName)?.length || 0,
          totalCount: totalsByProvince.get(provinceName) || 0
        }))
      : targetProvinceFallback();

  const linkedProviders = identities
    .map((identity) => identity.provider)
    .filter((provider) => provider !== "anonymous_device");

  return {
    displayName: tourist?.display_name || "นักเดินทาง",
    isGuest: linkedProviders.length === 0,
    linkedProviders,
    totalStampsEarned: stamps.length,
    totalStampTargets: Array.from(totalsByProvince.values()).reduce((total, count) => total + count, 0),
    provinceProgress,
    stampsByProvince: provinceProgress.map((progress) => ({
      provinceName: progress.provinceName,
      stamps: earnedByProvince.get(progress.provinceName) || []
    }))
  };
}
