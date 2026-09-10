import type { DashboardFiltersInput } from "@/lib/validation/dashboard-filters";

const postEntryFilterKeys = [
  "originCountryId", "originProvinceId", "ageGroup", "transportModeId",
  "travelPurposeId", "satisfactionMin", "satisfactionMax",
] as const satisfies readonly (keyof DashboardFiltersInput)[];

export type PostEntryFilterKey = (typeof postEntryFilterKeys)[number];

// These attributes are absent for abandoned entries; filtering on them biases
// the denominator toward visitors who progressed far enough to provide data.
export function getEntryCohortFilterSupport(filters: Partial<DashboardFiltersInput>) {
  const unsupportedFilters = postEntryFilterKeys.filter(key => filters[key] !== undefined);
  return { supported: unsupportedFilters.length === 0, unsupportedFilters };
}
