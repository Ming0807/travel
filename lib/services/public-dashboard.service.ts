import "server-only";

import { buildPublicDashboardEvidence } from "@/lib/dashboard/public-evidence";
import { getPublicDashboardProvinceScope } from "@/lib/repositories/dashboard.repository";
import { getPublicDashboardAnalytics } from "@/lib/services/dashboard.service";
import type { PublicDashboardEvidence } from "@/types/public-dashboard";

type RawSearchParams = Record<string, string | string[] | undefined>;

export async function getPublicDashboardEvidence(
  searchParams: RawSearchParams = {},
): Promise<PublicDashboardEvidence> {
  const scope = await getPublicDashboardProvinceScope();
  const analytics = await getPublicDashboardAnalytics({
    ...searchParams,
    province_id: String(scope.provinceId),
    provinceId: String(scope.provinceId),
  });

  return buildPublicDashboardEvidence(analytics, scope.provinceName);
}
