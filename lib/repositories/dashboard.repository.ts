import "server-only";

import { DASHBOARD_ROW_LIMIT } from "@/constants/dashboard-metrics";
import { AGE_GROUP_OPTIONS } from "@/lib/validation/checkin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { DashboardFilters, DashboardReferenceOptions } from "@/types/dashboard";
import {
  type DashboardSummaryKpis
} from "@/lib/repositories/dashboard-summary.repository";
import type { TrendPoint, DistributionItem, RankedAttraction } from "@/types/dashboard";

export type DashboardVisitRow = Record<string, unknown>;
export type DashboardCertificateRow = Record<string, unknown>;
export type DashboardStampRow = Record<string, unknown>;
export type DashboardSurveyRow = Record<string, unknown>;
export type DashboardExpenseRow = Record<string, unknown>;
export type DashboardFunnelRow = Record<string, unknown>;

export type DashboardSummaryData = {
  kpis: DashboardSummaryKpis | null;
  trend: TrendPoint[];
  visitsByProvince: DistributionItem[];
  topAttractions: RankedAttraction[];
  funnelEventCounts: Map<string, number>;
  refreshTimestamp: string | null;
};

export type DashboardRepositoryPayload = {
  visits: DashboardVisitRow[];
  certificates: DashboardCertificateRow[];
  stamps: DashboardStampRow[];
  surveys: DashboardSurveyRow[];
  expenses: DashboardExpenseRow[];
  funnelEvents: DashboardFunnelRow[];
  referenceOptions: DashboardReferenceOptions;
  isTruncated: boolean;
  summary: DashboardSummaryData;
};

export type PublicDashboardProvinceScope = {
  provinceId: number;
  provinceName: string;
};

export async function getPublicDashboardProvinceScope(): Promise<PublicDashboardProvinceScope> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("provinces")
    .select("province_id, province_name_th, province_name_en")
    .eq("is_active", true)
    .limit(100);

  if (error) throw new Error("PUBLIC_DASHBOARD_SCOPE_QUERY_FAILED");

  const yala = (data ?? []).find((row) => {
    const thaiName = String(row.province_name_th ?? "").trim();
    const englishName = String(row.province_name_en ?? "").trim().toLowerCase();
    return thaiName === "ยะลา" || englishName === "yala";
  });

  const provinceId = Number(yala?.province_id ?? 0);
  if (!provinceId) throw new Error("PUBLIC_DASHBOARD_YALA_SCOPE_NOT_FOUND");

  return {
    provinceId,
    provinceName: String(yala?.province_name_th ?? yala?.province_name_en ?? "ยะลา"),
  };
}

function toOption(value: string | number | null | undefined, label: string | null | undefined) {
  return value === null || value === undefined || !label ? null : { value: String(value), label };
}

function mapOptions(
  rows: Record<string, unknown>[] | null,
  valueKey: string,
  primaryLabelKey: string,
  fallbackLabelKey?: string
) {
  return (rows ?? [])
    .map((row) => toOption(row[valueKey] as string | number | null, (row[primaryLabelKey] ?? row[fallbackLabelKey ?? primaryLabelKey]) as string | null))
    .filter((option): option is { value: string; label: string } => Boolean(option));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function relation(row: Record<string, unknown>, key: string) {
  const value = row[key];
  if (Array.isArray(value)) return isRecord(value[0]) ? value[0] : null;
  return isRecord(value) ? value : null;
}

function rowAttractionId(row: Record<string, unknown>) {
  const attraction = relation(row, "attractions");
  const nestedVisit = relation(row, "visits");
  const nestedAttraction = nestedVisit ? relation(nestedVisit, "attractions") : null;
  return Number(row.attraction_id ?? attraction?.attraction_id ?? nestedAttraction?.attraction_id ?? 0) || null;
}

function rowProvinceId(row: Record<string, unknown>) {
  const attraction = relation(row, "attractions");
  const nestedVisit = relation(row, "visits");
  const nestedAttraction = nestedVisit ? relation(nestedVisit, "attractions") : null;
  return Number(attraction?.province_id ?? nestedAttraction?.province_id ?? 0) || null;
}

function rowDistrictId(row: Record<string, unknown>) {
  const attraction = relation(row, "attractions");
  const nestedVisit = relation(row, "visits");
  const nestedAttraction = nestedVisit ? relation(nestedVisit, "attractions") : null;
  return Number(attraction?.district_id ?? nestedAttraction?.district_id ?? 0) || null;
}

function rowAttractionTypeId(row: Record<string, unknown>) {
  const attraction = relation(row, "attractions");
  const nestedVisit = relation(row, "visits");
  const nestedAttraction = nestedVisit ? relation(nestedVisit, "attractions") : null;
  return Number(attraction?.attraction_type_id ?? nestedAttraction?.attraction_type_id ?? 0) || null;
}

function funnelAttractionId(row: Record<string, unknown>) {
  const checkinCode = relation(row, "checkin_codes");
  const attractionId = Number(checkinCode?.attraction_id ?? 0) || null;
  if (attractionId) return attractionId;

  const metadata = relation(row, "metadata");
  return Number(metadata?.attraction_id ?? 0) || null;
}

function filterRowsByDestination<T extends Record<string, unknown>>(rows: T[], filters: DashboardFilters) {
  return rows.filter((row) => {
    if (filters.attractionId && rowAttractionId(row) !== filters.attractionId) return false;
    if (filters.provinceId && rowProvinceId(row) !== filters.provinceId) return false;
    if (filters.districtId && rowDistrictId(row) !== filters.districtId) return false;
    if (filters.attractionTypeId && rowAttractionTypeId(row) !== filters.attractionTypeId) return false;
    return true;
  });
}

function filterFunnelRows(rows: DashboardFunnelRow[], filters: DashboardFilters) {
  return rows.filter((row) => {
    if (filters.attractionId && funnelAttractionId(row) !== filters.attractionId) return false;
    if (!filters.provinceId && !filters.districtId && !filters.attractionTypeId) return true;
    const checkinCode = relation(row, "checkin_codes");
    const attraction = checkinCode ? relation(checkinCode, "attractions") : null;
    if (filters.provinceId && Number(attraction?.province_id ?? 0) !== filters.provinceId) return false;
    if (filters.districtId && Number(attraction?.district_id ?? 0) !== filters.districtId) return false;
    if (filters.attractionTypeId && Number(attraction?.attraction_type_id ?? 0) !== filters.attractionTypeId) return false;
    return true;
  });
}

export async function getDashboardReferenceOptions(): Promise<DashboardReferenceOptions> {
  const supabase = createSupabaseServiceRoleClient();
  const [provinces, districts, attractions, attractionTypes, countries, ageGroups, transportModes, travelPurposes] =
    await Promise.all([
      supabase.from("provinces").select("province_id, province_name_th, province_name_en").eq("is_active", true).order("province_name_en"),
      supabase.from("districts").select("district_id, district_name_th, district_name_en").eq("is_active", true).order("district_name_th"),
      supabase.from("attractions").select("attraction_id, name_th, name_en").order("name_th").limit(500),
      supabase.from("attraction_types").select("attraction_type_id, type_name_th, type_name_en").eq("is_active", true).order("display_order"),
      supabase.from("countries").select("country_id, country_name_th, country_name_en").eq("is_active", true).order("country_name_en"),
      supabase.from("age_groups").select("label").eq("is_active", true).order("display_order"),
      supabase.from("transport_modes").select("transport_mode_id, name_th, name_en").eq("is_active", true).order("display_order"),
      supabase.from("travel_purposes").select("travel_purpose_id, name_th, name_en").eq("is_active", true).order("display_order")
    ]);

  for (const result of [provinces, districts, attractions, attractionTypes, countries, ageGroups, transportModes, travelPurposes]) {
    if (result.error) {
      throw new Error("DASHBOARD_REFERENCE_OPTIONS_FAILED");
    }
  }

  const ageGroupOptionMap = new Map<string, string>();
  AGE_GROUP_OPTIONS.forEach((option) => ageGroupOptionMap.set(option.value, option.label));
  [
    ...(ageGroups.data ?? []).map((row: Record<string, unknown>) => String(row.label ?? "").trim()),
    "0-15",
    "16-24",
    "25-34",
    "35-44",
    "45-54",
    "55-64",
    "65+",
  ].filter(Boolean).forEach((value) => {
    if (!ageGroupOptionMap.has(value)) ageGroupOptionMap.set(value, `${value} (ข้อมูลเดิม)`);
  });

  return {
    provinces: mapOptions(provinces.data, "province_id", "province_name_th", "province_name_en"),
    districts: mapOptions(districts.data, "district_id", "district_name_th", "district_name_en"),
    attractions: mapOptions(attractions.data, "attraction_id", "name_th", "name_en"),
    attractionTypes: mapOptions(attractionTypes.data, "attraction_type_id", "type_name_th", "type_name_en"),
    originCountries: mapOptions(countries.data, "country_id", "country_name_th", "country_name_en"),
    originProvinces: mapOptions(provinces.data, "province_id", "province_name_th", "province_name_en"),
    ageGroups: Array.from(ageGroupOptionMap, ([value, label]) => ({ value, label })),
    transportModes: mapOptions(transportModes.data, "transport_mode_id", "name_th", "name_en"),
    travelPurposes: mapOptions(travelPurposes.data, "travel_purpose_id", "name_th", "name_en")
  };
}

export async function getDashboardRepositoryPayload(filters: DashboardFilters, activeTab: string = "executive"): Promise<DashboardRepositoryPayload> {
  const supabase = createSupabaseServiceRoleClient();

  let visitsQuery = supabase
    .from("visits")
    .select(
      `
        visit_id,
        tourist_id,
        visit_date,
        attraction_id,
        travel_companion_id,
        transport_mode_id,
        travel_purpose_id,
        group_size,
        overnight_status,
        nights,
        completion_status,
        tourists!inner (
          origin_country_id,
          origin_province_id,
          age_group,
          preferred_language,
          tourist_identities (provider),
          countries (country_name_th, country_name_en),
          provinces (province_name_th, province_name_en)
        ),
        attractions!inner (
          attraction_id,
          name_th,
          name_en,
          province_id,
          district_id,
          attraction_type_id,
          provinces (province_name_th, province_name_en),
          districts (district_name_th, district_name_en),
          attraction_types (type_name_th, type_name_en)
        ),
        travel_companions (name_th, name_en),
        transport_modes (name_th, name_en),
        travel_purposes (name_th, name_en)
      `
    )
    .gte("visit_date", filters.dateFrom)
    .lte("visit_date", filters.dateTo)
    .limit(DASHBOARD_ROW_LIMIT);

  if (filters.attractionId) visitsQuery = visitsQuery.eq("attraction_id", filters.attractionId);
  if (filters.provinceId) visitsQuery = visitsQuery.eq("attractions.province_id", filters.provinceId);
  if (filters.districtId) visitsQuery = visitsQuery.eq("attractions.district_id", filters.districtId);
  if (filters.attractionTypeId) visitsQuery = visitsQuery.eq("attractions.attraction_type_id", filters.attractionTypeId);
  if (filters.originCountryId) visitsQuery = visitsQuery.eq("tourists.origin_country_id", filters.originCountryId);
  if (filters.originProvinceId) visitsQuery = visitsQuery.eq("tourists.origin_province_id", filters.originProvinceId);
  if (filters.ageGroup) visitsQuery = visitsQuery.eq("tourists.age_group", filters.ageGroup);
  if (filters.transportModeId) visitsQuery = visitsQuery.eq("transport_mode_id", filters.transportModeId);
  if (filters.travelPurposeId) visitsQuery = visitsQuery.eq("travel_purpose_id", filters.travelPurposeId);

  let certificatesQuery = supabase
    .from("certificates")
    .select(
      `
        certificate_id,
        generated_at,
        visits!inner (
          visit_date,
          attraction_id,
          tourist_id,
          tourists!inner (origin_country_id, origin_province_id, age_group),
          attractions!inner (attraction_id, name_th, name_en, province_id, district_id, attraction_type_id)
        )
      `
    )
    .gte("visits.visit_date", filters.dateFrom)
    .lte("visits.visit_date", filters.dateTo)
    .limit(DASHBOARD_ROW_LIMIT);

  let stampsQuery = supabase
    .from("tourist_stamps")
    .select(
      `
        stamp_id,
        earned_at,
        status,
        attraction_id,
        visits!inner (
          visit_date,
          tourist_id,
          tourists!inner (origin_country_id, origin_province_id, age_group)
        ),
        attractions!inner (attraction_id, name_th, name_en, province_id, district_id, attraction_type_id)
      `
    )
    .gte("earned_at", `${filters.dateFrom}T00:00:00.000Z`)
    .lte("earned_at", `${filters.dateTo}T23:59:59.999Z`)
    .limit(DASHBOARD_ROW_LIMIT);

  let surveysQuery = supabase
    .from("satisfaction_surveys")
    .select(
      `
        survey_id,
        overall_score,
        facility_score,
        cleanliness_score,
        safety_score,
        accessibility_score,
        information_score,
        value_score,
        revisit_intention,
        recommend_intention,
        submitted_at,
        completed_at,
        visits!inner (
          visit_date,
          attraction_id,
          tourist_id,
          tourists!inner (origin_country_id, origin_province_id, age_group),
          attractions!inner (attraction_id, name_th, name_en, province_id, district_id, attraction_type_id, provinces (province_name_th, province_name_en))
        )
      `
    )
    .gte("visits.visit_date", filters.dateFrom)
    .lte("visits.visit_date", filters.dateTo)
    .limit(DASHBOARD_ROW_LIMIT);

  if (filters.satisfactionMin) surveysQuery = surveysQuery.gte("overall_score", filters.satisfactionMin);
  if (filters.satisfactionMax) surveysQuery = surveysQuery.lte("overall_score", filters.satisfactionMax);

  let expensesQuery = supabase
    .from("visit_expenses")
    .select(
      `
        expense_id,
        estimated_amount,
        spending_range_id,
        expense_category_id,
        spending_ranges (range_label_th, range_label_en, min_value, max_value),
        expense_categories (name_th, name_en),
        visits!inner (
          visit_date,
          attraction_id,
          tourist_id,
          tourists!inner (origin_country_id, origin_province_id, age_group),
          attractions!inner (attraction_id, name_th, name_en, province_id, district_id, attraction_type_id)
        )
      `
    )
    .gte("visits.visit_date", filters.dateFrom)
    .lte("visits.visit_date", filters.dateTo)
    .limit(DASHBOARD_ROW_LIMIT);

  const funnelQuery = supabase
    .from("funnel_events")
    .select(
      `
        event_id,
        event_type,
        event_time,
        checkin_code_id,
        metadata,
        checkin_codes (
          attraction_id,
          photo_spot_id,
          attractions (attraction_id, province_id, district_id, attraction_type_id)
        )
      `
    )
    .gte("event_time", `${filters.dateFrom}T00:00:00.000Z`)
    .lte("event_time", `${filters.dateTo}T23:59:59.999Z`)
    .limit(DASHBOARD_ROW_LIMIT);

  if (filters.attractionId) {
    certificatesQuery = certificatesQuery.eq("visits.attraction_id", filters.attractionId);
    stampsQuery = stampsQuery.eq("attraction_id", filters.attractionId);
    surveysQuery = surveysQuery.eq("visits.attraction_id", filters.attractionId);
    expensesQuery = expensesQuery.eq("visits.attraction_id", filters.attractionId);
  }

  for (const [key, value] of [
    ["province_id", filters.provinceId],
    ["district_id", filters.districtId],
    ["attraction_type_id", filters.attractionTypeId]
  ] as const) {
    if (!value) continue;
    certificatesQuery = certificatesQuery.eq(`visits.attractions.${key}`, value);
    stampsQuery = stampsQuery.eq(`attractions.${key}`, value);
    surveysQuery = surveysQuery.eq(`visits.attractions.${key}`, value);
    expensesQuery = expensesQuery.eq(`visits.attractions.${key}`, value);
  }

  for (const [key, value] of [
    ["origin_country_id", filters.originCountryId],
    ["origin_province_id", filters.originProvinceId],
    ["age_group", filters.ageGroup]
  ] as const) {
    if (!value) continue;
    certificatesQuery = certificatesQuery.eq(`visits.tourists.${key}`, value);
    stampsQuery = stampsQuery.eq(`visits.tourists.${key}`, value);
    surveysQuery = surveysQuery.eq(`visits.tourists.${key}`, value);
    expensesQuery = expensesQuery.eq(`visits.tourists.${key}`, value);
  }

  for (const [key, value] of [
    ["transport_mode_id", filters.transportModeId],
    ["travel_purpose_id", filters.travelPurposeId]
  ] as const) {
    if (!value) continue;
    certificatesQuery = certificatesQuery.eq(`visits.${key}`, value);
    stampsQuery = stampsQuery.eq(`visits.${key}`, value);
    surveysQuery = surveysQuery.eq(`visits.${key}`, value);
    expensesQuery = expensesQuery.eq(`visits.${key}`, value);
  }

  // Every populated section in one response is built from the same live source.
  // Summary tables remain available for refresh/inspection, but they do not yet
  // cover every demographic and behavior filter required by this view model.
  const needVisits = ["executive", "tourists", "visits", "attractions", "expenses", "satisfaction", "sustainability"].includes(activeTab);
  const needCertificates = ["executive", "attractions", "satisfaction", "sustainability"].includes(activeTab);
  const needStamps = ["executive", "sustainability"].includes(activeTab);
  const needSurveys = ["executive", "attractions", "satisfaction", "sustainability"].includes(activeTab);
  const needExpenses = ["executive", "expenses", "sustainability"].includes(activeTab);
  const needFunnel = ["executive", "funnel"].includes(activeTab);

  const [
    visits,
    certificates,
    stamps,
    surveys,
    expenses,
    funnelEvents,
    referenceOptions
  ] = await Promise.all([
    needVisits ? visitsQuery : Promise.resolve({ data: [], error: null }),
    needCertificates ? certificatesQuery : Promise.resolve({ data: [], error: null }),
    needStamps ? stampsQuery : Promise.resolve({ data: [], error: null }),
    needSurveys ? surveysQuery : Promise.resolve({ data: [], error: null }),
    needExpenses ? expensesQuery : Promise.resolve({ data: [], error: null }),
    needFunnel ? funnelQuery : Promise.resolve({ data: [], error: null }),
    getDashboardReferenceOptions()
  ]);

  for (const result of [visits, certificates, stamps, surveys, expenses, funnelEvents]) {
    if (result.error) {
      throw new Error("DASHBOARD_QUERY_FAILED");
    }
  }

  const visitRows = (visits.data ?? []) as DashboardVisitRow[];
  const certificateRows = filterRowsByDestination((certificates.data ?? []) as DashboardCertificateRow[], filters);
  const stampRows = filterRowsByDestination((stamps.data ?? []) as DashboardStampRow[], filters);
  const surveyRows = filterRowsByDestination((surveys.data ?? []) as DashboardSurveyRow[], filters);
  const expenseRows = filterRowsByDestination((expenses.data ?? []) as DashboardExpenseRow[], filters);
  const funnelRows = filterFunnelRows((funnelEvents.data ?? []) as DashboardFunnelRow[], filters);

  return {
    visits: visitRows,
    certificates: certificateRows,
    stamps: stampRows,
    surveys: surveyRows,
    expenses: expenseRows,
    funnelEvents: funnelRows,
    referenceOptions,
    isTruncated:
      (needVisits && visitRows.length >= DASHBOARD_ROW_LIMIT) ||
      (needCertificates && certificateRows.length >= DASHBOARD_ROW_LIMIT) ||
      (needStamps && stampRows.length >= DASHBOARD_ROW_LIMIT) ||
      (needSurveys && surveyRows.length >= DASHBOARD_ROW_LIMIT) ||
      (needExpenses && expenseRows.length >= DASHBOARD_ROW_LIMIT) ||
      (needFunnel && funnelRows.length >= DASHBOARD_ROW_LIMIT),
    summary: {
      kpis: null,
      trend: [],
      visitsByProvince: [],
      topAttractions: [],
      funnelEventCounts: new Map(),
      refreshTimestamp: null
    }
  };
}
