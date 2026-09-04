import type { DashboardFilters } from "@/types/dashboard";
import { normalizeAgeGroup } from "@/lib/validation/checkin";

export const DASHBOARD_SAVED_VIEWS_STORAGE_KEY = "dashboard.saved-views.v1";
export const DASHBOARD_SAVED_VIEW_LIMIT = 12;

export type DashboardSavedView = {
  id: string;
  name: string;
  pathname: string;
  query: string;
  createdAt: string;
};

type QueryInput = URLSearchParams | Record<string, string | string[] | undefined>;

const QUERY_CONTRACT = [
  { canonical: "date_from", aliases: ["date_from", "dateFrom"], validate: isCalendarDate },
  { canonical: "date_to", aliases: ["date_to", "dateTo"], validate: isCalendarDate },
  { canonical: "compare", aliases: ["compare", "comparisonMode"], validate: (value: string) => value === "previous_period" },
  { canonical: "evidence_scope", aliases: ["evidence_scope", "evidenceScope"], validate: (value: string) => ["field_claim", "all_records", "pilot_only", "simulated_only"].includes(value) },
  { canonical: "province_id", aliases: ["province_id", "provinceId"], validate: isPositiveId },
  { canonical: "district_id", aliases: ["district_id", "districtId"], validate: isPositiveId },
  { canonical: "attraction_id", aliases: ["attraction_id", "attractionId"], validate: isPositiveId },
  { canonical: "attraction_type_id", aliases: ["attraction_type_id", "attractionTypeId"], validate: isPositiveId },
  { canonical: "origin_country_id", aliases: ["origin_country_id", "originCountryId"], validate: isPositiveId },
  { canonical: "origin_province_id", aliases: ["origin_province_id", "originProvinceId"], validate: isPositiveId },
  { canonical: "age_group", aliases: ["age_group", "ageGroup"], validate: (value: string) => typeof normalizeAgeGroup(value) === "string" },
  { canonical: "transport_mode_id", aliases: ["transport_mode_id", "transportModeId"], validate: isPositiveId },
  { canonical: "travel_purpose_id", aliases: ["travel_purpose_id", "travelPurposeId"], validate: isPositiveId },
  { canonical: "satisfaction_min", aliases: ["satisfaction_min", "satisfactionMin"], validate: isScore },
  { canonical: "satisfaction_max", aliases: ["satisfaction_max", "satisfactionMax"], validate: isScore },
] as const;

function isPositiveId(value: string) {
  return /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
}

function isScore(value: string) {
  return /^\d+(?:\.\d+)?$/.test(value) && Number(value) >= 1 && Number(value) <= 5;
}

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function getValue(input: QueryInput, aliases: readonly string[]): string | undefined {
  for (const alias of aliases) {
    const raw = input instanceof URLSearchParams ? input.get(alias) ?? undefined : input[alias];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (value !== undefined) return value;
  }
  return undefined;
}

export function sanitizeDashboardQuery(input: QueryInput): Record<string, string> {
  const safe: Record<string, string> = {};
  QUERY_CONTRACT.forEach(({ canonical, aliases, validate }) => {
    const value = getValue(input, aliases)?.trim();
    if (value && validate(value)) safe[canonical] = value;
  });
  return safe;
}

export function dashboardFiltersToSafeQuery(filters: DashboardFilters): Record<string, string> {
  const raw: Record<string, string> = {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  };
  if (filters.comparisonMode) raw.comparisonMode = filters.comparisonMode;
  if (filters.evidenceScope) raw.evidenceScope = filters.evidenceScope;
  if (filters.provinceId) raw.provinceId = String(filters.provinceId);
  if (filters.districtId) raw.districtId = String(filters.districtId);
  if (filters.attractionId) raw.attractionId = String(filters.attractionId);
  if (filters.attractionTypeId) raw.attractionTypeId = String(filters.attractionTypeId);
  if (filters.originCountryId) raw.originCountryId = String(filters.originCountryId);
  if (filters.originProvinceId) raw.originProvinceId = String(filters.originProvinceId);
  if (filters.ageGroup) raw.ageGroup = filters.ageGroup;
  if (filters.transportModeId) raw.transportModeId = String(filters.transportModeId);
  if (filters.travelPurposeId) raw.travelPurposeId = String(filters.travelPurposeId);
  if (filters.satisfactionMin) raw.satisfactionMin = String(filters.satisfactionMin);
  if (filters.satisfactionMax) raw.satisfactionMax = String(filters.satisfactionMax);
  return sanitizeDashboardQuery(raw);
}

export function dashboardQueryString(query: Record<string, string>): string {
  return new URLSearchParams(query).toString();
}

function isDashboardPath(pathname: string) {
  return /^\/admin\/dashboard(?:\/[a-z0-9_-]+)*$/.test(pathname);
}

export function createDashboardSavedView(input: {
  id: string;
  name: string;
  pathname: string;
  searchParams: QueryInput;
  createdAt: string;
}): DashboardSavedView {
  const id = input.id.trim();
  const name = input.name.trim().replace(/\s+/g, " ");
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(id)) throw new Error("Invalid saved view id");
  if (!name || name.length > 60) throw new Error("Invalid saved view name");
  if (!isDashboardPath(input.pathname)) throw new Error("Invalid dashboard path");
  if (Number.isNaN(Date.parse(input.createdAt))) throw new Error("Invalid saved view date");

  return {
    id,
    name,
    pathname: input.pathname,
    query: dashboardQueryString(sanitizeDashboardQuery(input.searchParams)),
    createdAt: input.createdAt,
  };
}

export function parseDashboardSavedViews(raw: string | null): DashboardSavedView[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    const views: DashboardSavedView[] = [];
    for (const candidate of data.slice(0, DASHBOARD_SAVED_VIEW_LIMIT)) {
      if (!candidate || typeof candidate !== "object") continue;
      const value = candidate as Partial<DashboardSavedView>;
      if (![value.id, value.name, value.pathname, value.query, value.createdAt].every((item) => typeof item === "string")) continue;
      const originalParams = new URLSearchParams(value.query);
      const originalKeys = Array.from(originalParams.keys());
      const allowedAliases = new Set<string>(QUERY_CONTRACT.flatMap((item) => [...item.aliases]));
      if (originalKeys.some((key) => !allowedAliases.has(key))) continue;
      try {
        const safeQuery = sanitizeDashboardQuery(originalParams);
        if (originalKeys.length !== Object.keys(safeQuery).length) continue;
        const view = createDashboardSavedView({
          id: value.id as string,
          name: value.name as string,
          pathname: value.pathname as string,
          searchParams: originalParams,
          createdAt: value.createdAt as string,
        });
        if (!views.some((existing) => existing.id === view.id)) views.push(view);
      } catch {
        // One damaged entry must not hide other saved views.
        continue;
      }
    }
    return views;
  } catch {
    return [];
  }
}
