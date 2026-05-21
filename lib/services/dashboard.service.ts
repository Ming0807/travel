import "server-only";

import {
  DASHBOARD_METRIC_DEFINITIONS,
  DASHBOARD_ROW_LIMIT,
  DASHBOARD_TOP_ATTRACTION_LIMIT
} from "@/constants/dashboard-metrics";
import { requirePermission, type AdminAuthError } from "@/lib/auth/guards";
import {
  getDashboardRepositoryPayload,
  type DashboardRepositoryPayload
} from "@/lib/repositories/dashboard.repository";
import {
  averageNullable,
  buildDistribution,
  buildFunnelStages,
  formatCount,
  formatEstimatedSpending,
  formatPercentage,
  formatRating,
  safeRate
} from "@/lib/services/dashboard-math";
import { parseDashboardFilters } from "@/lib/validation/dashboard-filters";
import type {
  DashboardFilters,
  DashboardKpi,
  DashboardViewModel,
  DistributionItem,
  InsightCardData,
  RankedAttraction,
  TrendPoint
} from "@/types/dashboard";

type RawSearchParams = Record<string, string | string[] | undefined>;
type Row = Record<string, unknown>;

export type DashboardErrorCode = "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "QUERY_FAILED";

export class DashboardServiceError extends Error {
  constructor(
    public readonly code: DashboardErrorCode,
    message: string,
    public readonly fieldErrors?: Record<string, string[] | undefined>
  ) {
    super(message);
    this.name = "DashboardServiceError";
  }
}

function isRecord(value: unknown): value is Row {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function relation(row: Row, key: string) {
  const value = row[key];
  if (Array.isArray(value)) return isRecord(value[0]) ? value[0] : null;
  return isRecord(value) ? value : null;
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }
  return null;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function increment(map: Map<string, number>, label: string | null | undefined) {
  const safeLabel = label && label.trim() !== "" ? label : "No data";
  map.set(safeLabel, (map.get(safeLabel) ?? 0) + 1);
}

function tourist(row: Row) {
  return relation(row, "tourists");
}

function attraction(row: Row) {
  const nestedVisit = relation(row, "visits");
  if (nestedVisit) return relation(nestedVisit, "attractions");
  return relation(row, "attractions");
}

function nestedVisit(row: Row) {
  return relation(row, "visits");
}

function attractionName(row: Row) {
  const attractionRow = attraction(row);
  return (
    stringValue(attractionRow?.name_th) ||
    stringValue(attractionRow?.name_en) ||
    "Unnamed attraction"
  );
}

function provinceName(row: Row) {
  const attractionRow = attraction(row);
  const province = attractionRow ? relation(attractionRow, "provinces") : null;
  return stringValue(province?.province_name_th) || stringValue(province?.province_name_en) || "No data";
}

function visitAttractionKey(row: Row) {
  const attractionRow = attraction(row);
  return String(numberValue(attractionRow?.attraction_id ?? row.attraction_id) ?? attractionName(row));
}

function dateLabel(value: unknown) {
  const date = stringValue(value);
  return date ? date.slice(0, 10) : "No date";
}

function getVisitRows(payload: DashboardRepositoryPayload) {
  return payload.visits;
}

function buildVisitTrend(visits: Row[]): TrendPoint[] {
  const byDate = new Map<string, number>();
  visits.forEach((visit) => increment(byDate, dateLabel(visit.visit_date)));

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));
}

function buildVisitsByProvince(visits: Row[]): DistributionItem[] {
  const byProvince = new Map<string, number>();
  visits.forEach((visit) => increment(byProvince, provinceName(visit)));
  return buildDistribution(byProvince, visits.length);
}

function buildTopAttractions(visits: Row[], certificates: Row[], surveys: Row[]): RankedAttraction[] {
  const visitCounts = new Map<string, { name: string; province: string; visits: number }>();
  const certificateCounts = new Map<string, number>();
  const surveyScores = new Map<string, number[]>();

  visits.forEach((visit) => {
    const key = visitAttractionKey(visit);
    const current = visitCounts.get(key) ?? { name: attractionName(visit), province: provinceName(visit), visits: 0 };
    current.visits += 1;
    visitCounts.set(key, current);
  });

  certificates.forEach((certificate) => {
    const visit = nestedVisit(certificate);
    if (!visit) return;
    const key = visitAttractionKey(visit);
    certificateCounts.set(key, (certificateCounts.get(key) ?? 0) + 1);
  });

  surveys.forEach((survey) => {
    const visit = nestedVisit(survey);
    if (!visit) return;
    const score = numberValue(survey.overall_score);
    if (score === null) return;
    const key = visitAttractionKey(visit);
    surveyScores.set(key, [...(surveyScores.get(key) ?? []), score]);
  });

  return Array.from(visitCounts.entries())
    .map(([key, entry]) => ({
      key,
      attractionName: entry.name,
      provinceName: entry.province,
      visitCount: entry.visits,
      certificateCount: certificateCounts.get(key) ?? 0,
      averageSatisfaction: averageNullable(surveyScores.get(key) ?? []),
      surveyResponseCount: surveyScores.get(key)?.length ?? 0
    }))
    .sort((a, b) => b.visitCount - a.visitCount || a.attractionName.localeCompare(b.attractionName))
    .slice(0, DASHBOARD_TOP_ATTRACTION_LIMIT)
    .map((row, index) => ({
      rank: index + 1,
      attractionName: row.attractionName,
      provinceName: row.provinceName,
      visitCount: row.visitCount,
      certificateCount: row.certificateCount,
      averageSatisfaction: row.averageSatisfaction,
      surveyResponseCount: row.surveyResponseCount
    }));
}

function buildTouristProfileSection(visits: Row[]) {
  const uniqueByTourist = new Map<string, Row>();
  visits.forEach((visit) => {
    const touristKey = stringValue(visit.tourist_id) ?? `${uniqueByTourist.size}`;
    if (!uniqueByTourist.has(touristKey)) uniqueByTourist.set(touristKey, visit);
  });

  const countryMap = new Map<string, number>();
  const provinceMap = new Map<string, number>();
  const ageMap = new Map<string, number>();
  const languageMap = new Map<string, number>();
  const identityMap = new Map<string, number>();

  Array.from(uniqueByTourist.values()).forEach((visit) => {
    const touristRow = tourist(visit);
    const country = touristRow ? relation(touristRow, "countries") : null;
    const originProvince = touristRow ? relation(touristRow, "provinces") : null;
    increment(countryMap, stringValue(country?.country_name_th) || stringValue(country?.country_name_en));
    increment(provinceMap, stringValue(originProvince?.province_name_th) || stringValue(originProvince?.province_name_en));
    increment(ageMap, stringValue(touristRow?.age_group));
    increment(languageMap, stringValue(touristRow?.preferred_language) || "th");
    increment(identityMap, "Guest/anonymous profile");
  });

  return {
    originCountries: buildDistribution(countryMap, uniqueByTourist.size),
    originProvinces: buildDistribution(provinceMap, uniqueByTourist.size),
    ageGroups: buildDistribution(ageMap, uniqueByTourist.size),
    preferredLanguages: buildDistribution(languageMap, uniqueByTourist.size),
    identityProviders: buildDistribution(identityMap, uniqueByTourist.size)
  };
}

function buildTravelBehaviorSection(visits: Row[]) {
  const companionMap = new Map<string, number>();
  const transportMap = new Map<string, number>();
  const purposeMap = new Map<string, number>();
  const overnightMap = new Map<string, number>();
  const groupSizes: number[] = [];
  const nights: number[] = [];

  visits.forEach((visit) => {
    const companion = relation(visit, "travel_companions");
    const transport = relation(visit, "transport_modes");
    const purpose = relation(visit, "travel_purposes");
    increment(companionMap, stringValue(companion?.name_th) || stringValue(companion?.name_en));
    increment(transportMap, stringValue(transport?.name_th) || stringValue(transport?.name_en));
    increment(purposeMap, stringValue(purpose?.name_th) || stringValue(purpose?.name_en));
    increment(overnightMap, stringValue(visit.overnight_status));

    const groupSize = numberValue(visit.group_size);
    if (groupSize !== null) groupSizes.push(groupSize);
    const nightCount = numberValue(visit.nights);
    if (nightCount !== null) nights.push(nightCount);
  });

  return {
    companionTypes: buildDistribution(companionMap, visits.length),
    transportModes: buildDistribution(transportMap, visits.length),
    travelPurposes: buildDistribution(purposeMap, visits.length),
    overnightStatus: buildDistribution(overnightMap, visits.length),
    averageGroupSize: averageNullable(groupSizes),
    averageNights: averageNullable(nights),
    answeredGroupSizeCount: groupSizes.length,
    answeredNightsCount: nights.length
  };
}

function buildExpenseSection(expenses: Row[]) {
  const spendingMap = new Map<string, number>();
  const categoryMap = new Map<string, number>();
  let estimatedMin = 0;
  let estimatedMax = 0;
  let hasEstimate = false;
  let hasOpenEndedRange = false;

  expenses.forEach((expense) => {
    const spendingRange = relation(expense, "spending_ranges");
    const expenseCategory = relation(expense, "expense_categories");
    increment(spendingMap, stringValue(spendingRange?.range_label_th) || stringValue(spendingRange?.range_label_en));
    increment(categoryMap, stringValue(expenseCategory?.name_th) || stringValue(expenseCategory?.name_en));

    const min = numberValue(spendingRange?.min_value);
    const max = numberValue(spendingRange?.max_value);
    if (min !== null) {
      estimatedMin += min;
      hasEstimate = true;
    }
    if (max !== null) {
      estimatedMax += max;
    } else if (min !== null) {
      hasOpenEndedRange = true;
    }
  });

  return {
    spendingRanges: buildDistribution(spendingMap, expenses.length),
    expenseCategories: buildDistribution(categoryMap, expenses.length),
    estimatedMin: hasEstimate ? estimatedMin : null,
    estimatedMax: hasEstimate && !hasOpenEndedRange ? estimatedMax : null,
    hasOpenEndedRange,
    responseCount: expenses.length,
    methodologyNote:
      "Range-based self-reported estimate from optional survey responses. This is not revenue or official economic impact."
  };
}

function yesRate(rows: Row[], key: string) {
  const answered = rows.filter((row) => stringValue(row[key]) !== null);
  const yesCount = answered.filter((row) => stringValue(row[key]) === "yes").length;
  return safeRate(yesCount, answered.length);
}

function buildSatisfactionSection(surveys: Row[], topAttractions: RankedAttraction[]) {
  const overallScores = surveys.map((survey) => numberValue(survey.overall_score));
  const scoreMap = new Map<string, number>();
  overallScores.forEach((score) => {
    if (score !== null) increment(scoreMap, `${score} / 5`);
  });

  return {
    averageOverall: averageNullable(overallScores),
    responseCount: overallScores.filter((score): score is number => score !== null).length,
    distribution: buildDistribution(scoreMap, overallScores.filter((score) => score !== null).length),
    byAttraction: topAttractions.filter((attraction) => attraction.surveyResponseCount > 0),
    safetyAverage: averageNullable(surveys.map((survey) => numberValue(survey.safety_score))),
    cleanlinessAverage: averageNullable(surveys.map((survey) => numberValue(survey.cleanliness_score))),
    facilityAverage: averageNullable(surveys.map((survey) => numberValue(survey.facility_score))),
    revisitIntentionRate: yesRate(surveys, "revisit_intention"),
    recommendIntentionRate: yesRate(surveys, "recommend_intention")
  };
}

function buildInsights(
  visits: Row[],
  topAttractions: RankedAttraction[],
  satisfactionResponseCount: number,
  surveyCompletionRate: number | null,
  visitsByProvince: DistributionItem[]
): InsightCardData[] {
  const insights: InsightCardData[] = [];
  const lowSatisfactionHighVisit = topAttractions.find(
    (row) => row.visitCount >= 3 && row.surveyResponseCount >= 2 && row.averageSatisfaction !== null && row.averageSatisfaction < 3.5
  );
  const highSatisfactionLowVisit = [...topAttractions]
    .reverse()
    .find((row) => row.visitCount <= 3 && row.surveyResponseCount >= 2 && row.averageSatisfaction !== null && row.averageSatisfaction >= 4);
  const topProvince = visitsByProvince[0];
  const topAttraction = topAttractions[0];

  if (lowSatisfactionHighVisit) {
    insights.push({
      title: "Improvement priority",
      category: "improvement",
      description: `${lowSatisfactionHighVisit.attractionName} has meaningful visit activity but lower satisfaction.`,
      evidence: `${lowSatisfactionHighVisit.visitCount} visits, ${lowSatisfactionHighVisit.averageSatisfaction?.toFixed(1)} / 5 satisfaction`,
      suggestedAction: "Review access, cleanliness, safety, information, and visitor flow before heavier promotion.",
      confidence: lowSatisfactionHighVisit.surveyResponseCount >= 10 ? "high" : "medium"
    });
  }

  if (highSatisfactionLowVisit) {
    insights.push({
      title: "Promotion opportunity",
      category: "promotion",
      description: `${highSatisfactionLowVisit.attractionName} has high satisfaction with low recorded visits.`,
      evidence: `${highSatisfactionLowVisit.visitCount} visits, ${highSatisfactionLowVisit.averageSatisfaction?.toFixed(1)} / 5 satisfaction`,
      suggestedAction: "Consider featuring it in suggested routes or QR certificate campaign content.",
      confidence: highSatisfactionLowVisit.surveyResponseCount >= 10 ? "high" : "medium"
    });
  }

  if (topProvince && visits.length > 0) {
    insights.push({
      title: "Province concentration",
      category: "concentration",
      description: `${topProvince.label} currently holds the largest share of recorded visits.`,
      evidence: `${topProvince.value} of ${visits.length} visits (${topProvince.percent === null ? "No data" : `${Math.round(topProvince.percent * 100)}%`})`,
      suggestedAction: "Compare QR placement and promotion coverage across provinces before interpreting this as actual demand.",
      confidence: visits.length >= 30 ? "medium" : "low"
    });
  }

  if (topAttraction) {
    insights.push({
      title: "Top attraction signal",
      category: "opportunity",
      description: `${topAttraction.attractionName} leads the selected period by recorded visits.`,
      evidence: `${topAttraction.visitCount} visits and ${topAttraction.certificateCount} certificates`,
      suggestedAction: "Use as a benchmark for QR placement, certificate appeal, and suggested route design.",
      confidence: topAttraction.visitCount >= 30 ? "high" : "medium"
    });
  }

  if (satisfactionResponseCount === 0 || surveyCompletionRate === null || surveyCompletionRate < 0.2) {
    insights.push({
      title: "Survey sample limitation",
      category: "data_quality",
      description: "Satisfaction and spending insights are based only on optional survey responses.",
      evidence:
        surveyCompletionRate === null
          ? "No certificate denominator for survey completion."
          : `${Math.round(surveyCompletionRate * 100)}% survey completion rate`,
      suggestedAction: "Keep the survey short and continue offering it after certificate download.",
      confidence: "low"
    });
  }

  return insights.slice(0, 5);
}

function buildKpis(params: {
  touristProfileCount: number;
  visitCount: number;
  qrScanCount: number;
  landingViewCount: number;
  certificateCount: number;
  stampCount: number;
  surveyCompletionRate: number | null;
  averageSatisfaction: number | null;
  estimatedMin: number | null;
  estimatedMax: number | null;
  hasOpenEndedRange: boolean;
  topAttraction: RankedAttraction | null;
}): DashboardKpi[] {
  return [
    {
      key: "tourist_profiles",
      label: "Tourist Profiles",
      value: formatCount(params.touristProfileCount),
      rawValue: params.touristProfileCount,
      valueType: "count",
      definition: DASHBOARD_METRIC_DEFINITIONS.touristProfiles
    },
    {
      key: "total_visits",
      label: "Total Visits",
      value: formatCount(params.visitCount),
      rawValue: params.visitCount,
      valueType: "count",
      definition: DASHBOARD_METRIC_DEFINITIONS.totalVisits
    },
    {
      key: "qr_scans",
      label: "QR Scans",
      value: formatCount(params.qrScanCount),
      rawValue: params.qrScanCount,
      valueType: "count",
      definition: DASHBOARD_METRIC_DEFINITIONS.qrScans
    },
    {
      key: "landing_views",
      label: "Landing Views",
      value: formatCount(params.landingViewCount),
      rawValue: params.landingViewCount,
      valueType: "count",
      definition: DASHBOARD_METRIC_DEFINITIONS.landingViews
    },
    {
      key: "certificates_generated",
      label: "Certificates Generated",
      value: formatCount(params.certificateCount),
      rawValue: params.certificateCount,
      valueType: "count",
      definition: DASHBOARD_METRIC_DEFINITIONS.certificatesGenerated
    },
    {
      key: "stamps_earned",
      label: "Stamps Earned",
      value: formatCount(params.stampCount),
      rawValue: params.stampCount,
      valueType: "count",
      definition: DASHBOARD_METRIC_DEFINITIONS.stampsEarned
    },
    {
      key: "survey_completion_rate",
      label: "Survey Completion Rate",
      value: formatPercentage(params.surveyCompletionRate),
      rawValue: params.surveyCompletionRate,
      valueType: "percentage",
      definition: DASHBOARD_METRIC_DEFINITIONS.surveyCompletionRate
    },
    {
      key: "average_satisfaction",
      label: "Average Satisfaction",
      value: formatRating(params.averageSatisfaction),
      rawValue: params.averageSatisfaction,
      valueType: "rating",
      definition: DASHBOARD_METRIC_DEFINITIONS.averageSatisfaction
    },
    {
      key: "estimated_spending",
      label: "Estimated Spending",
      value: formatEstimatedSpending(params.estimatedMin, params.estimatedMax, params.hasOpenEndedRange),
      rawValue: params.estimatedMin,
      valueType: "currency_range",
      definition: DASHBOARD_METRIC_DEFINITIONS.estimatedSpending,
      note: "Not revenue"
    },
    {
      key: "top_attraction",
      label: "Top Attraction",
      value: params.topAttraction?.attractionName ?? "No data",
      rawValue: params.topAttraction?.visitCount ?? null,
      valueType: "text",
      definition: DASHBOARD_METRIC_DEFINITIONS.topAttraction,
      note: params.topAttraction ? `${params.topAttraction.visitCount} visits` : undefined
    }
  ];
}

function mapAdminError(error: AdminAuthError): DashboardServiceError {
  if (error.code === "UNAUTHORIZED") {
    return new DashboardServiceError("UNAUTHORIZED", "Please sign in to view this dashboard.");
  }
  return new DashboardServiceError("FORBIDDEN", "You do not have permission to view this dashboard.");
}

export async function getDashboardAnalytics(searchParams: RawSearchParams): Promise<DashboardViewModel> {
  const parsed = parseDashboardFilters(searchParams);
  if (!parsed.success) {
    throw new DashboardServiceError(
      "VALIDATION_ERROR",
      "Dashboard filters are invalid. Please check date range and selected filters.",
      parsed.error.flatten().fieldErrors
    );
  }

  let guard;
  try {
    guard = await requirePermission("dashboard.read");
  } catch (error) {
    throw mapAdminError(error as AdminAuthError);
  }

  let payload: DashboardRepositoryPayload;
  try {
    payload = await getDashboardRepositoryPayload(parsed.data as DashboardFilters);
  } catch {
    throw new DashboardServiceError("QUERY_FAILED", "Could not load dashboard data. Please try again.");
  }

  const visits = getVisitRows(payload);
  const uniqueTouristKeys = new Set(visits.map((visit) => stringValue(visit.tourist_id)).filter(Boolean));
  const topAttractions = buildTopAttractions(visits, payload.certificates, payload.surveys);
  const visitsByProvince = buildVisitsByProvince(visits);
  const expenseSection = buildExpenseSection(payload.expenses);
  const satisfactionSection = buildSatisfactionSection(payload.surveys, topAttractions);
  const eventCounts = new Map<string, number>();
  payload.funnelEvents.forEach((event) => increment(eventCounts, stringValue(event.event_type)));
  const funnelStages = buildFunnelStages(eventCounts);
  const largestDropOffStage =
    [...funnelStages]
      .filter((stage) => stage.dropOffFromPrevious !== null)
      .sort((a, b) => (b.dropOffFromPrevious ?? 0) - (a.dropOffFromPrevious ?? 0))[0] ?? null;
  const surveyCompletionRate = safeRate(payload.surveys.length, payload.certificates.length);

  const kpis = buildKpis({
    touristProfileCount: uniqueTouristKeys.size,
    visitCount: visits.length,
    qrScanCount: eventCounts.get("qr_scanned") ?? 0,
    landingViewCount: eventCounts.get("landing_viewed") ?? 0,
    certificateCount: payload.certificates.length,
    stampCount: payload.stamps.length,
    surveyCompletionRate,
    averageSatisfaction: satisfactionSection.averageOverall,
    estimatedMin: expenseSection.estimatedMin,
    estimatedMax: expenseSection.estimatedMax,
    hasOpenEndedRange: expenseSection.hasOpenEndedRange,
    topAttraction: topAttractions[0] ?? null
  });

  const dataQualityWarnings: string[] = [];
  if (payload.isTruncated) {
    dataQualityWarnings.push(`Dashboard query reached the ${DASHBOARD_ROW_LIMIT.toLocaleString("th-TH")} row MVP limit. Narrow filters for more precise live results.`);
  }
  if (satisfactionSection.responseCount === 0) {
    dataQualityWarnings.push("No satisfaction responses for the selected filters. Average satisfaction is No data, not 0.");
  }
  if (expenseSection.responseCount === 0) {
    dataQualityWarnings.push("No expense survey responses for the selected filters. Estimated spending is No data.");
  }

  return {
    filters: parsed.data as DashboardFilters,
    generatedAt: new Date().toISOString(),
    dataSource: "live_database",
    viewer: {
      displayName: guard.displayName,
      email: guard.email,
      permissions: guard.permissions
    },
    referenceOptions: payload.referenceOptions,
    kpis,
    executive: {
      visitTrend: buildVisitTrend(visits),
      visitsByProvince,
      topAttractions
    },
    touristProfile: buildTouristProfileSection(visits),
    travelBehavior: buildTravelBehaviorSection(visits),
    expense: expenseSection,
    satisfaction: satisfactionSection,
    funnel: {
      stages: funnelStages,
      largestDropOffStage
    },
    insights: buildInsights(visits, topAttractions, satisfactionSection.responseCount, surveyCompletionRate, visitsByProvince),
    dataQualityWarnings
  };
}
