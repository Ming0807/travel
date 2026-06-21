import "server-only";

import { DASHBOARD_TOP_ATTRACTION_LIMIT } from "@/constants/dashboard-metrics";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { DashboardFilters, TrendPoint, DistributionItem, RankedAttraction } from "@/types/dashboard";

/* ─── types ─── */

export type DashboardSummaryKpis = {
  totalVisits: number;
  uniqueTourists: number;
  certificateCount: number;
  stampCount: number;
  surveyCount: number;
  avgSatisfaction: number | null;
  avgSafetyScore: number | null;
  avgCleanlinessScore: number | null;
  avgFacilityScore: number | null;
  revisitYesCount: number;
  recommendYesCount: number;
  revisitAnsweredCount: number;
  recommendAnsweredCount: number;
  expenseResponseCount: number;
  totalExpenseMin: number;
  totalExpenseMax: number;
  hasOpenEndedRange: boolean;
  qrScanCount: number;
  landingViewCount: number;
  certificateStartedCount: number;
  minimalFormCompletedCount: number;
  photoUploadedCount: number;
  certificateGeneratedCount: number;
  surveyStartedCount: number;
  surveyCompletedCount: number;
};

type SummaryRow = {
  summary_date: string;
  attraction_id: number;
  total_visits: number;
  unique_tourists: number;
  certificate_count: number;
  stamp_count: number;
  survey_count: number;
  avg_satisfaction: number | null;
  avg_safety_score: number | null;
  avg_cleanliness_score: number | null;
  avg_facility_score: number | null;
  revisit_yes_count: number;
  recommend_yes_count: number;
  revisit_answered_count: number;
  recommend_answered_count: number;
  expense_response_count: number;
  total_expense_min: number;
  total_expense_max: number;
  has_open_ended_range: boolean;
  qr_scan_count: number;
  landing_view_count: number;
  certificate_started_count: number;
  minimal_form_completed_count: number;
  photo_uploaded_count: number;
  certificate_generated_count: number;
  survey_started_count: number;
  survey_completed_count: number;
};

type SummaryAttractionRow = SummaryRow & {
  attractions: {
    attraction_id: number;
    name_th: string;
    name_en: string | null;
    province_id: number;
    provinces: { province_name_th: string; province_name_en: string | null } | null;
  } | null;
};

/* ─── query builder ─── */

function buildSummaryQuery(
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>,
  filters: DashboardFilters,
  extraSelect?: string
) {
  let query = supabase
    .from("dashboard_daily_summary")
    .select(extraSelect ?? "*")
    .gte("summary_date", filters.dateFrom)
    .lte("summary_date", filters.dateTo);

  if (filters.attractionId) {
    query = query.eq("attraction_id", filters.attractionId);
  }

  return query;
}

/* ─── post-filter by attraction dimensions ─── */

function getAttractionDimensionIds(filters: DashboardFilters): {
  provinceId?: number;
  districtId?: number;
  attractionTypeId?: number;
} {
  return {
    provinceId: filters.provinceId,
    districtId: filters.districtId,
    attractionTypeId: filters.attractionTypeId
  };
}

async function filterRowsByAttractionDimensions<T extends { attraction_id: number }>(
  rows: T[],
  filters: DashboardFilters
): Promise<T[]> {
  const { provinceId, districtId, attractionTypeId } = getAttractionDimensionIds(filters);
  if (!provinceId && !districtId && !attractionTypeId) return rows;

  // Fetch matching attraction IDs from the attractions table
  const supabase = createSupabaseServiceRoleClient();
  let attrQuery = supabase.from("attractions").select("attraction_id");

  if (provinceId) attrQuery = attrQuery.eq("province_id", provinceId);
  if (districtId) attrQuery = attrQuery.eq("district_id", districtId);
  if (attractionTypeId) attrQuery = attrQuery.eq("attraction_type_id", attractionTypeId);

  const { data: matchingAttractions, error } = await attrQuery;
  if (error || !matchingAttractions) return [];

  const validIds = new Set(matchingAttractions.map((a) => a.attraction_id));
  return rows.filter((row) => validIds.has(row.attraction_id));
}

/* ─── public API ─── */

/**
 * Get aggregated KPI values from the daily summary table.
 * Returns null (not an all-zero placeholder) when the summary hasn't been refreshed,
 * so the service layer can fall back to live query computation.
 */
export async function getDashboardSummaryKpis(filters: DashboardFilters): Promise<DashboardSummaryKpis | null> {
  const supabase = createSupabaseServiceRoleClient();

  const query = buildSummaryQuery(supabase, filters);

  const { data, error } = await query;
  if (error || !data || data.length === 0) {
    return null;
  }

  const rows = data as unknown as SummaryRow[];
  const filtered = await filterRowsByAttractionDimensions(rows, filters);
  if (filtered.length === 0) {
    return null;
  }

  return aggregateRows(filtered);
}

function emptyKpis(): DashboardSummaryKpis {
  return {
    totalVisits: 0,
    uniqueTourists: 0,
    certificateCount: 0,
    stampCount: 0,
    surveyCount: 0,
    avgSatisfaction: null,
    avgSafetyScore: null,
    avgCleanlinessScore: null,
    avgFacilityScore: null,
    revisitYesCount: 0,
    recommendYesCount: 0,
    revisitAnsweredCount: 0,
    recommendAnsweredCount: 0,
    expenseResponseCount: 0,
    totalExpenseMin: 0,
    totalExpenseMax: 0,
    hasOpenEndedRange: false,
    qrScanCount: 0,
    landingViewCount: 0,
    certificateStartedCount: 0,
    minimalFormCompletedCount: 0,
    photoUploadedCount: 0,
    certificateGeneratedCount: 0,
    surveyStartedCount: 0,
    surveyCompletedCount: 0
  };
}

function aggregateRows(rows: SummaryRow[]): DashboardSummaryKpis {
  if (rows.length === 0) return emptyKpis();

  let sumVisits = 0;
  let sumUnique = 0;
  let sumCerts = 0;
  let sumStamps = 0;
  let sumSurveys = 0;
  let sumSatisfactionScore = 0;
  let countSatisfaction = 0;
  let sumSafetyScore = 0;
  let countSafety = 0;
  let sumCleanlinessScore = 0;
  let countCleanliness = 0;
  let sumFacilityScore = 0;
  let countFacility = 0;
  let sumRevisitYes = 0;
  let sumRecommendYes = 0;
  let sumRevisitAnswered = 0;
  let sumRecommendAnswered = 0;
  let sumExpenseResponse = 0;
  let sumExpenseMin = 0;
  let sumExpenseMax = 0;
  let hasOpenEnded = false;
  let sumQr = 0;
  let sumLanding = 0;
  let sumCertStarted = 0;
  let sumFormCompleted = 0;
  let sumPhoto = 0;
  let sumCertGenerated = 0;
  let sumSurveyStarted = 0;
  let sumSurveyCompleted = 0;

  for (const row of rows) {
    sumVisits += row.total_visits;
    sumUnique += row.unique_tourists;
    sumCerts += row.certificate_count;
    sumStamps += row.stamp_count;
    sumSurveys += row.survey_count;

    if (row.avg_satisfaction !== null) {
      sumSatisfactionScore += row.avg_satisfaction;
      countSatisfaction++;
    }
    if (row.avg_safety_score !== null) {
      sumSafetyScore += row.avg_safety_score;
      countSafety++;
    }
    if (row.avg_cleanliness_score !== null) {
      sumCleanlinessScore += row.avg_cleanliness_score;
      countCleanliness++;
    }
    if (row.avg_facility_score !== null) {
      sumFacilityScore += row.avg_facility_score;
      countFacility++;
    }

    sumRevisitYes += row.revisit_yes_count;
    sumRecommendYes += row.recommend_yes_count;
    sumRevisitAnswered += row.revisit_answered_count;
    sumRecommendAnswered += row.recommend_answered_count;

    sumExpenseResponse += row.expense_response_count;
    sumExpenseMin += row.total_expense_min;
    sumExpenseMax += row.total_expense_max;
    if (row.has_open_ended_range) hasOpenEnded = true;

    sumQr += row.qr_scan_count;
    sumLanding += row.landing_view_count;
    sumCertStarted += row.certificate_started_count;
    sumFormCompleted += row.minimal_form_completed_count;
    sumPhoto += row.photo_uploaded_count;
    sumCertGenerated += row.certificate_generated_count;
    sumSurveyStarted += row.survey_started_count;
    sumSurveyCompleted += row.survey_completed_count;
  }

  return {
    totalVisits: sumVisits,
    uniqueTourists: sumUnique,
    certificateCount: sumCerts,
    stampCount: sumStamps,
    surveyCount: sumSurveys,
    avgSatisfaction: countSatisfaction > 0 ? parseFloat((sumSatisfactionScore / countSatisfaction).toFixed(2)) : null,
    avgSafetyScore: countSafety > 0 ? parseFloat((sumSafetyScore / countSafety).toFixed(2)) : null,
    avgCleanlinessScore: countCleanliness > 0 ? parseFloat((sumCleanlinessScore / countCleanliness).toFixed(2)) : null,
    avgFacilityScore: countFacility > 0 ? parseFloat((sumFacilityScore / countFacility).toFixed(2)) : null,
    revisitYesCount: sumRevisitYes,
    recommendYesCount: sumRecommendYes,
    revisitAnsweredCount: sumRevisitAnswered,
    recommendAnsweredCount: sumRecommendAnswered,
    expenseResponseCount: sumExpenseResponse,
    totalExpenseMin: sumExpenseMin,
    totalExpenseMax: sumExpenseMax,
    hasOpenEndedRange: hasOpenEnded,
    qrScanCount: sumQr,
    landingViewCount: sumLanding,
    certificateStartedCount: sumCertStarted,
    minimalFormCompletedCount: sumFormCompleted,
    photoUploadedCount: sumPhoto,
    certificateGeneratedCount: sumCertGenerated,
    surveyStartedCount: sumSurveyStarted,
    surveyCompletedCount: sumSurveyCompleted
  };
}

/**
 * Get daily visit trend from summary table.
 */
export async function getDashboardSummaryTrend(filters: DashboardFilters): Promise<TrendPoint[]> {
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await buildSummaryQuery(supabase, filters);
  if (error || !data) return [];

  const rows = data as unknown as SummaryRow[];
  const filtered = await filterRowsByAttractionDimensions(rows, filters);

  const byDate = new Map<string, number>();
  for (const row of filtered) {
    const key = row.summary_date;
    byDate.set(key, (byDate.get(key) ?? 0) + row.total_visits);
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));
}

/**
 * Get visit distribution by province from summary + attractions join.
 */
export async function getDashboardSummaryByProvince(filters: DashboardFilters): Promise<DistributionItem[]> {
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await buildSummaryQuery(supabase, filters, `
    summary_date,
    attraction_id,
    total_visits,
    attractions!inner (
      attraction_id,
      name_th,
      name_en,
      province_id,
      provinces!inner (province_name_th, province_name_en)
    )
  `);
  if (error || !data) return [];

  const rows = data as unknown as SummaryAttractionRow[];
  const filtered = await filterRowsByAttractionDimensions(rows, filters);

  const byProvince = new Map<string, number>();
  let total = 0;

  for (const row of filtered) {
    const provinceName =
      row.attractions?.provinces?.province_name_th ??
      row.attractions?.provinces?.province_name_en ??
      "No data";
    byProvince.set(provinceName, (byProvince.get(provinceName) ?? 0) + row.total_visits);
    total += row.total_visits;
  }

  return Array.from(byProvince.entries())
    .map(([label, value]) => ({
      label,
      value,
      percent: total > 0 ? value / total : null
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

/**
 * Get top attractions ranked by visit count from summary + attractions join.
 */
export async function getDashboardSummaryTopAttractions(filters: DashboardFilters): Promise<RankedAttraction[]> {
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await buildSummaryQuery(supabase, filters, `
    attraction_id,
    total_visits,
    unique_tourists,
    certificate_count,
    survey_count,
    avg_satisfaction,
    revisit_yes_count,
    recommend_yes_count,
    attractions!inner (
      attraction_id,
      name_th,
      name_en,
      province_id,
      provinces!inner (province_name_th, province_name_en)
    )
  `).order("total_visits", { ascending: false });
  if (error || !data) return [];

  const rows = data as unknown as SummaryAttractionRow[];
  const filtered = await filterRowsByAttractionDimensions(rows, filters);

  // Group by attraction (multiple days → one entry)
  const attractionMap = new Map<
    number,
    {
      name_th: string;
      provinceName: string;
      totalVisits: number;
      totalCerts: number;
      surveyCount: number;
      sumSatisfaction: number;
    }
  >();

  for (const row of filtered) {
    const id = row.attraction_id;
    const existing = attractionMap.get(id);
    const name =
      row.attractions?.name_th ??
      row.attractions?.name_en ??
      "Unnamed attraction";
    const provinceName =
      row.attractions?.provinces?.province_name_th ??
      row.attractions?.provinces?.province_name_en ??
      "No data";

    if (existing) {
      existing.totalVisits += row.total_visits;
      existing.totalCerts += row.certificate_count;
      existing.surveyCount += row.survey_count;
      if (row.avg_satisfaction !== null) {
        existing.sumSatisfaction += row.avg_satisfaction;
      }
    } else {
      attractionMap.set(id, {
        name_th: name,
        provinceName,
        totalVisits: row.total_visits,
        totalCerts: row.certificate_count,
        surveyCount: row.survey_count,
        sumSatisfaction: row.avg_satisfaction ?? 0
      });
    }
  }

  return Array.from(attractionMap.entries())
    .map(([key, entry]) => ({
      rank: 0, // assigned below
      attractionName: entry.name_th,
      provinceName: entry.provinceName,
      visitCount: entry.totalVisits,
      certificateCount: entry.totalCerts,
      averageSatisfaction:
        entry.surveyCount > 0
          ? parseFloat((entry.sumSatisfaction / entry.surveyCount).toFixed(2))
          : null,
      surveyResponseCount: entry.surveyCount
    }))
    .sort((a, b) => b.visitCount - a.visitCount || a.attractionName.localeCompare(b.attractionName))
    .slice(0, DASHBOARD_TOP_ATTRACTION_LIMIT)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

/**
 * Get funnel stage counts from summary table.
 */
export async function getDashboardSummaryFunnelCounts(filters: DashboardFilters): Promise<Map<string, number>> {
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await buildSummaryQuery(supabase, filters);
  if (error || !data) return new Map();

  const rows = data as unknown as SummaryRow[];
  const filtered = await filterRowsByAttractionDimensions(rows, filters);

  const counts = new Map<string, number>();
  for (const row of filtered) {
    counts.set("qr_scanned", (counts.get("qr_scanned") ?? 0) + row.qr_scan_count);
    counts.set("landing_viewed", (counts.get("landing_viewed") ?? 0) + row.landing_view_count);
    counts.set("certificate_started", (counts.get("certificate_started") ?? 0) + row.certificate_started_count);
    counts.set("minimal_form_completed", (counts.get("minimal_form_completed") ?? 0) + row.minimal_form_completed_count);
    counts.set("photo_uploaded", (counts.get("photo_uploaded") ?? 0) + row.photo_uploaded_count);
    counts.set("certificate_generated", (counts.get("certificate_generated") ?? 0) + row.certificate_generated_count);
    counts.set("survey_started", (counts.get("survey_started") ?? 0) + row.survey_started_count);
    counts.set("survey_completed", (counts.get("survey_completed") ?? 0) + row.survey_completed_count);
  }

  return counts;
}

/* ─── refresh ─── */

/**
 * Call the SQL refresh_dashboard_summary() function to recompute all daily aggregates.
 */
export async function refreshDashboardSummary(): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.rpc("refresh_dashboard_summary");
  if (error) {
    throw new Error(`Failed to refresh dashboard summary: ${error.message}`);
  }
}

/**
 * Get the last refresh timestamp from the summary table.
 */
export async function getDashboardSummaryRefreshTime(): Promise<string | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("get_dashboard_summary_refresh_time");
  if (error || !data) return null;
  return String(data);
}
