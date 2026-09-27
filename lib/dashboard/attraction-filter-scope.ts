import type { AttractionCheckinOption } from "@/lib/repositories/attraction-analytics.repository";
import type { AttractionAnalyticsFilters } from "@/lib/validation/attraction-analytics";

export function hasAttractionFilterScopeMismatch(
  filters: Pick<AttractionAnalyticsFilters, "campaignId" | "checkinCodeId">,
  checkinCodes: readonly AttractionCheckinOption[],
): boolean {
  const selectedCode = filters.checkinCodeId
    ? checkinCodes.find((code) => code.checkinCodeId === filters.checkinCodeId)
    : null;
  if (filters.checkinCodeId && !selectedCode) return true;
  if (filters.campaignId && !checkinCodes.some((code) => code.campaignId === filters.campaignId)) return true;
  return Boolean(selectedCode && filters.campaignId && selectedCode.campaignId !== filters.campaignId);
}
