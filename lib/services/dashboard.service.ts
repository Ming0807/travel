import "server-only";

import {
  DASHBOARD_METRIC_DEFINITIONS,
  DASHBOARD_MIN_SAMPLE_SIZE,
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
import { buildDashboardAlerts } from "@/lib/services/dashboard-alert.service";
import { compareDashboardKpis, getPreviousDashboardPeriod } from "@/lib/services/dashboard-comparison";
import { buildTwoGroupMeanComparison } from "@/lib/dashboard/segment-comparison";
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

/* ─── helper: get data source description ─── */

function isRecord(value: unknown): value is Row {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function relation(row: Row, key: string) {
  const value = row[key];
  if (Array.isArray(value)) return isRecord(value[0]) ? value[0] : null;
  return isRecord(value) ? value : null;
}

function relations(row: Row, key: string): Row[] {
  const value = row[key];
  return Array.isArray(value) ? value.filter(isRecord) : [];
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

function incrementAnswered(map: Map<string, number>, label: string | null | undefined): boolean {
  if (!label || label.trim() === "") return false;
  map.set(label, (map.get(label) ?? 0) + 1);
  return true;
}

function preferredLanguageLabel(value: unknown): string {
  const normalized = stringValue(value)?.trim().toLowerCase();
  if (!normalized) return "ไม่ระบุภาษา";
  if (["th", "thai", "th-th"].includes(normalized)) return "th";
  if (["en", "english", "en-us", "en-gb"].includes(normalized)) return "en";
  if (["ms", "malay", "ms-my"].includes(normalized)) return "ms";
  return "ภาษาอื่น / ไม่ทราบ";
}

function identityProviderLabel(value: unknown): string {
  const normalized = stringValue(value)?.trim().toLowerCase();
  if (!normalized) return "ไม่ระบุช่องทาง";
  if (["anonymous_device", "line", "google", "email"].includes(normalized)) return normalized;
  return "ช่องทางอื่น / ไม่ทราบ";
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
  let originProvinceEligibleCount = 0;

  Array.from(uniqueByTourist.values()).forEach((visit) => {
    const touristRow = tourist(visit);
    const country = touristRow ? relation(touristRow, "countries") : null;
    const countryLabel = stringValue(country?.country_name_th) || stringValue(country?.country_name_en);
    const originProvince = touristRow ? relation(touristRow, "provinces") : null;
    increment(countryMap, countryLabel);
    if (countryLabel && /^(ไทย|ประเทศไทย|Thailand)$/i.test(countryLabel)) originProvinceEligibleCount += 1;
    increment(provinceMap, stringValue(originProvince?.province_name_th) || stringValue(originProvince?.province_name_en));
    increment(ageMap, stringValue(touristRow?.age_group));
    increment(languageMap, preferredLanguageLabel(touristRow?.preferred_language));

    const providers = touristRow
      ? new Set(relations(touristRow, "tourist_identities").map((identity) => identityProviderLabel(identity.provider)))
      : new Set<string>();
    if (providers.size === 0) {
      increment(identityMap, "ไม่ระบุช่องทาง");
    } else {
      providers.forEach((provider) => increment(identityMap, provider));
    }
  });

  return {
    recordCount: uniqueByTourist.size,
    originProvinceEligibleCount,
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
  const missing = {
    companion: 0,
    transport: 0,
    purpose: 0,
    overnight: 0
  };

  visits.forEach((visit) => {
    const companion = relation(visit, "travel_companions");
    const transport = relation(visit, "transport_modes");
    const purpose = relation(visit, "travel_purposes");
    if (!incrementAnswered(companionMap, stringValue(companion?.name_th) || stringValue(companion?.name_en))) missing.companion += 1;
    if (!incrementAnswered(transportMap, stringValue(transport?.name_th) || stringValue(transport?.name_en))) missing.transport += 1;
    if (!incrementAnswered(purposeMap, stringValue(purpose?.name_th) || stringValue(purpose?.name_en))) missing.purpose += 1;
    if (!incrementAnswered(overnightMap, stringValue(visit.overnight_status))) missing.overnight += 1;

    const groupSize = numberValue(visit.group_size);
    if (groupSize !== null) groupSizes.push(groupSize);
    const nightCount = numberValue(visit.nights);
    if (nightCount !== null) nights.push(nightCount);
  });

  return {
    section: {
      recordCount: visits.length,
      companionTypes: buildDistribution(companionMap),
      transportModes: buildDistribution(transportMap),
      travelPurposes: buildDistribution(purposeMap),
      overnightStatus: buildDistribution(overnightMap),
      averageGroupSize: averageNullable(groupSizes),
      averageNights: averageNullable(nights),
      answeredGroupSizeCount: groupSizes.length,
      answeredNightsCount: nights.length
    },
    missing
  };
}

function buildExpenseSection(expenses: Row[], eligibleSurveyCount = expenses.length) {
  const spendingMap = new Map<string, number>();
  const categoryMap = new Map<string, number>();
  let estimatedMin = 0;
  let estimatedMax = 0;
  let hasEstimate = false;
  let hasOpenEndedRange = false;
  let missingSpendingRangeCount = 0;
  let missingExpenseCategoryCount = 0;

  expenses.forEach((expense) => {
    const spendingRange = relation(expense, "spending_ranges");
    const expenseCategory = relation(expense, "expense_categories");
    if (!incrementAnswered(spendingMap, stringValue(spendingRange?.range_label_th) || stringValue(spendingRange?.range_label_en))) {
      missingSpendingRangeCount += 1;
    }
    if (!incrementAnswered(categoryMap, stringValue(expenseCategory?.name_th) || stringValue(expenseCategory?.name_en))) {
      missingExpenseCategoryCount += 1;
    }

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
    section: {
      eligibleSurveyCount,
      spendingRanges: buildDistribution(spendingMap),
      expenseCategories: buildDistribution(categoryMap),
      estimatedMin: hasEstimate ? estimatedMin : null,
      estimatedMax: hasEstimate && !hasOpenEndedRange ? estimatedMax : null,
      hasOpenEndedRange,
      responseCount: expenses.length,
      spendingRangeResponseCount: expenses.length - missingSpendingRangeCount,
      expenseCategoryResponseCount: expenses.length - missingExpenseCategoryCount,
      methodologyNote:
        "ค่าประมาณจากช่วงค่าใช้จ่ายในแบบสำรวจภาคสมัครใจที่ผู้ตอบแบบสำรวจรายงานด้วยตนเอง ไม่ใช่รายได้หรือผลกระทบทางเศรษฐกิจที่ผ่านการตรวจสอบอย่างเป็นทางการ"
    },
    missing: {
      spendingRange: missingSpendingRangeCount,
      expenseCategory: missingExpenseCategoryCount
    }
  };
}

function yesMetric(rows: Row[], key: string) {
  const answered = rows.filter((row) => stringValue(row[key]) !== null);
  const yesCount = answered.filter((row) => stringValue(row[key]) === "yes").length;
  return {
    rate: safeRate(yesCount, answered.length),
    answeredCount: answered.length
  };
}

function buildSatisfactionSection(surveys: Row[], topAttractions: RankedAttraction[]) {
  const overallScores = surveys.map((survey) => numberValue(survey.overall_score));
  const safetyScores = surveys.map((survey) => numberValue(survey.safety_score));
  const cleanlinessScores = surveys.map((survey) => numberValue(survey.cleanliness_score));
  const accessibilityScores = surveys.map((survey) => numberValue(survey.accessibility_score));
  const informationScores = surveys.map((survey) => numberValue(survey.information_score));
  const valueScores = surveys.map((survey) => numberValue(survey.value_score));
  const facilityScores = surveys.map((survey) => numberValue(survey.facility_score));
  const revisit = yesMetric(surveys, "revisit_intention");
  const recommend = yesMetric(surveys, "recommend_intention");
  const ageGroupComparison = buildTwoGroupMeanComparison(surveys.map((survey) => {
    const visit = relation(survey, "visits");
    const touristRow = visit ? relation(visit, "tourists") : null;
    return {
      segment: stringValue(touristRow?.age_group),
      value: numberValue(survey.overall_score),
    };
  }));
  const scoreMap = new Map<string, number>();
  overallScores.forEach((score) => {
    if (score !== null) increment(scoreMap, `${score} / 5`);
  });

  return {
    surveyRecordCount: surveys.length,
    averageOverall: averageNullable(overallScores),
    responseCount: overallScores.filter((score): score is number => score !== null).length,
    distribution: buildDistribution(scoreMap, overallScores.filter((score) => score !== null).length),
    byAttraction: topAttractions.filter((attraction) => attraction.surveyResponseCount > 0),
    safetyAverage: averageNullable(safetyScores),
    safetyResponseCount: safetyScores.filter((score) => score !== null).length,
    cleanlinessAverage: averageNullable(cleanlinessScores),
    cleanlinessResponseCount: cleanlinessScores.filter((score) => score !== null).length,
    accessibilityAverage: averageNullable(accessibilityScores),
    accessibilityResponseCount: accessibilityScores.filter((score) => score !== null).length,
    informationAverage: averageNullable(informationScores),
    informationResponseCount: informationScores.filter((score) => score !== null).length,
    valueAverage: averageNullable(valueScores),
    valueResponseCount: valueScores.filter((score) => score !== null).length,
    facilityAverage: averageNullable(facilityScores),
    facilityResponseCount: facilityScores.filter((score) => score !== null).length,
    revisitIntentionRate: revisit.rate,
    revisitAnsweredCount: revisit.answeredCount,
    recommendIntentionRate: recommend.rate,
    recommendAnsweredCount: recommend.answeredCount,
    ageGroupComparison
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
  const visitCounts = topAttractions.map((row) => row.visitCount).sort((a, b) => a - b);
  const medianVisitCount = visitCounts.length > 0
    ? visitCounts[Math.floor(visitCounts.length / 2)]
    : null;
  const lowSatisfactionHighVisit = topAttractions.find(
    (row) =>
      medianVisitCount !== null &&
      row.visitCount >= medianVisitCount &&
      row.surveyResponseCount >= DASHBOARD_MIN_SAMPLE_SIZE &&
      row.averageSatisfaction !== null &&
      row.averageSatisfaction < 3.5
  );
  const highSatisfactionLowVisit = [...topAttractions]
    .reverse()
    .find(
      (row) =>
        medianVisitCount !== null &&
        row.visitCount < medianVisitCount &&
        row.surveyResponseCount >= DASHBOARD_MIN_SAMPLE_SIZE &&
        row.averageSatisfaction !== null &&
        row.averageSatisfaction >= 4
    );
  const topProvince = visitsByProvince[0];
  const topAttraction = topAttractions[0];

  if (lowSatisfactionHighVisit) {
    insights.push({
      title: "Improvement priority",
      category: "improvement",
      description: `${lowSatisfactionHighVisit.attractionName} has meaningful visit activity but lower satisfaction.`,
      evidence: `${lowSatisfactionHighVisit.visitCount} visits, ${lowSatisfactionHighVisit.averageSatisfaction?.toFixed(1)} / 5 satisfaction`,
      suggestedAction: "Review access, cleanliness, safety, information, and visitor flow before heavier promotion.",
      confidence: lowSatisfactionHighVisit.surveyResponseCount >= DASHBOARD_MIN_SAMPLE_SIZE * 2 ? "high" : "medium"
    });
  }

  if (highSatisfactionLowVisit) {
    insights.push({
      title: "Promotion opportunity",
      category: "promotion",
      description: `${highSatisfactionLowVisit.attractionName} has high satisfaction with low recorded visits.`,
      evidence: `${highSatisfactionLowVisit.visitCount} visits, ${highSatisfactionLowVisit.averageSatisfaction?.toFixed(1)} / 5 satisfaction`,
      suggestedAction: "Consider featuring it in suggested routes or QR certificate campaign content.",
      confidence: highSatisfactionLowVisit.surveyResponseCount >= DASHBOARD_MIN_SAMPLE_SIZE * 2 ? "high" : "medium"
    });
  }

  if (topProvince && visits.length >= DASHBOARD_MIN_SAMPLE_SIZE) {
    insights.push({
      title: "Province concentration",
      category: "concentration",
      description: `${topProvince.label} currently holds the largest share of recorded visits.`,
      evidence: `${topProvince.value} of ${visits.length} visits (${topProvince.percent === null ? "No data" : `${Math.round(topProvince.percent * 100)}%`})`,
      suggestedAction: "Compare QR placement and promotion coverage across provinces before interpreting this as actual demand.",
      confidence: visits.length >= DASHBOARD_MIN_SAMPLE_SIZE * 2 ? "high" : "medium"
    });
  }

  if (topAttraction && topAttraction.visitCount >= DASHBOARD_MIN_SAMPLE_SIZE) {
    insights.push({
      title: "Top attraction signal",
      category: "opportunity",
      description: `${topAttraction.attractionName} leads the selected period by recorded visits.`,
      evidence: `${topAttraction.visitCount} visits and ${topAttraction.certificateCount} certificates`,
      suggestedAction: "Use as a benchmark for QR placement, certificate appeal, and suggested route design.",
      confidence: topAttraction.visitCount >= DASHBOARD_MIN_SAMPLE_SIZE * 2 ? "high" : "medium"
    });
  }

  if (
    satisfactionResponseCount < DASHBOARD_MIN_SAMPLE_SIZE ||
    surveyCompletionRate === null ||
    surveyCompletionRate < 0.2
  ) {
    insights.push({
      title: "Survey sample limitation",
      category: "data_quality",
      description: "Satisfaction and spending insights are based only on optional survey responses.",
      evidence:
        surveyCompletionRate === null
          ? "No certificate denominator for survey completion."
          : `${Math.round(surveyCompletionRate * 100)}% survey completion rate from ${satisfactionResponseCount} responses`,
      suggestedAction: "Keep the survey short and continue offering it after certificate download.",
      confidence: "low"
    });
  }

  return insights.slice(0, 5);
}

function hasFunnelIncompatibleFilters(filters: DashboardFilters) {
  return Boolean(
    filters.originCountryId ||
    filters.originProvinceId ||
    filters.ageGroup ||
    filters.transportModeId ||
    filters.travelPurposeId ||
    filters.satisfactionMin ||
    filters.satisfactionMax
  );
}

function buildKpis(params: {
  touristProfileCount: number;
  visitCount: number;
  qrScanCount: number;
  landingViewCount: number;
  certificateCount: number;
  stampCount: number;
  surveyResponseCount: number;
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
      definition: DASHBOARD_METRIC_DEFINITIONS.touristProfiles,
      evidence: { level: "system_record", sampleSize: params.touristProfileCount, denominator: null, unit: "โปรไฟล์" }
    },
    {
      key: "total_visits",
      label: "Total Visits",
      value: formatCount(params.visitCount),
      rawValue: params.visitCount,
      valueType: "count",
      definition: DASHBOARD_METRIC_DEFINITIONS.totalVisits,
      evidence: { level: "system_record", sampleSize: params.visitCount, denominator: null, unit: "รายการ" }
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
      definition: DASHBOARD_METRIC_DEFINITIONS.certificatesGenerated,
      evidence: { level: "system_record", sampleSize: params.certificateCount, denominator: null, unit: "ใบ" }
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
      definition: DASHBOARD_METRIC_DEFINITIONS.surveyCompletionRate,
      evidence: {
        level: params.surveyCompletionRate === null ? "unavailable" : params.surveyResponseCount < DASHBOARD_MIN_SAMPLE_SIZE ? "limited" : "decision_ready",
        sampleSize: params.surveyResponseCount,
        denominator: params.certificateCount,
        unit: "คำตอบ"
      }
    },
    {
      key: "average_satisfaction",
      label: "Average Satisfaction",
      value: formatRating(params.averageSatisfaction),
      rawValue: params.averageSatisfaction,
      valueType: "rating",
      definition: DASHBOARD_METRIC_DEFINITIONS.averageSatisfaction,
      evidence: {
        level: params.averageSatisfaction === null ? "unavailable" : params.surveyResponseCount < DASHBOARD_MIN_SAMPLE_SIZE ? "limited" : "decision_ready",
        sampleSize: params.surveyResponseCount,
        denominator: null,
        unit: "คำตอบ"
      }
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

export async function getDashboardAnalytics(searchParams: RawSearchParams, activeTab: string = "executive"): Promise<DashboardViewModel> {
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

  return buildDashboardResponse(parsed.data as DashboardFilters, activeTab, {
    displayName: guard.displayName,
    email: guard.email,
    permissions: guard.permissions
  });
}

export async function getPublicDashboardAnalytics(searchParams: RawSearchParams, activeTab: string = "executive"): Promise<DashboardViewModel> {
  const parsed = parseDashboardFilters(searchParams);
  if (!parsed.success) {
    throw new DashboardServiceError(
      "VALIDATION_ERROR",
      "Dashboard filters are invalid. Please check date range and selected filters.",
      parsed.error.flatten().fieldErrors
    );
  }

  return buildDashboardResponse({ ...parsed.data as DashboardFilters, comparisonMode: undefined }, activeTab, {
    displayName: "Public Viewer",
    email: "",
    permissions: []
  });
}

async function buildDashboardResponse(filters: DashboardFilters, activeTab: string, viewer: DashboardViewModel['viewer']): Promise<DashboardViewModel> {
  let comparisonPayload: DashboardRepositoryPayload | null = null;
  let comparisonQueryFailed = false;
  const comparisonPeriod = filters.comparisonMode === "previous_period" && activeTab === "executive"
    ? getPreviousDashboardPeriod(filters.dateFrom, filters.dateTo)
    : null;

  const [currentResult, comparisonResult] = await Promise.allSettled([
    getDashboardRepositoryPayload(filters, activeTab),
    comparisonPeriod
      ? getDashboardRepositoryPayload({
          ...filters,
          dateFrom: comparisonPeriod.dateFrom,
          dateTo: comparisonPeriod.dateTo,
          comparisonMode: undefined,
        }, activeTab)
      : Promise.resolve(null),
  ]);

  if (currentResult.status === "rejected") {
    throw new DashboardServiceError("QUERY_FAILED", "Could not load dashboard data. Please try again.");
  }
  const payload = currentResult.value;
  if (comparisonResult.status === "fulfilled") comparisonPayload = comparisonResult.value;
  else comparisonQueryFailed = true;

  const visits = getVisitRows(payload);
  const topAttractions = buildTopAttractions(visits, payload.certificates, payload.surveys);
  const visitsByProvince = buildVisitsByProvince(visits);
  const travelBehaviorResult = buildTravelBehaviorSection(visits);
  const expenseResult = buildExpenseSection(payload.expenses, payload.surveys.length);
  const expenseSection = expenseResult.section;
  const satisfactionSection = buildSatisfactionSection(payload.surveys, topAttractions);

  // Funnel events before visit creation cannot be segmented by tourist profile or
  // survey fields. Returning unfiltered counts would violate global filter semantics.
  const funnelFiltersUnsupported = hasFunnelIncompatibleFilters(filters);
  const eventCounts = new Map<string, number>();
  if (!funnelFiltersUnsupported) {
    payload.funnelEvents.forEach((event) => increment(eventCounts, stringValue(event.event_type)));
  }
  const funnelStages = buildFunnelStages(eventCounts);
  const largestDropOffStage =
    [...funnelStages]
      .filter((stage) => stage.dropOffFromPrevious !== null)
      .sort((a, b) => (b.dropOffFromPrevious ?? 0) - (a.dropOffFromPrevious ?? 0))[0] ?? null;

  const surveyCompletionRate = safeRate(payload.surveys.length, payload.certificates.length);

  const uniqueTouristKeys = new Set(visits.map((visit) => stringValue(visit.tourist_id)).filter(Boolean));
  const kpis = buildKpis({
    touristProfileCount: uniqueTouristKeys.size,
    visitCount: visits.length,
    qrScanCount: eventCounts.get("qr_scanned") ?? 0,
    landingViewCount: eventCounts.get("landing_viewed") ?? 0,
    certificateCount: payload.certificates.length,
    stampCount: payload.stamps.length,
    surveyResponseCount: payload.surveys.length,
    surveyCompletionRate,
    averageSatisfaction: satisfactionSection.averageOverall,
    estimatedMin: expenseSection.estimatedMin,
    estimatedMax: expenseSection.estimatedMax,
    hasOpenEndedRange: expenseSection.hasOpenEndedRange,
    topAttraction: topAttractions[0] ?? null
  });

  const visitTrend = buildVisitTrend(visits);

  const comparison = comparisonPeriod ? (() => {
    const comparisonIsTruncated = payload.isTruncated || Boolean(comparisonPayload?.isTruncated);
    const previousVisits = comparisonPayload ? getVisitRows(comparisonPayload) : [];
    const previousTourists = new Set(previousVisits.map((visit) => stringValue(visit.tourist_id)).filter(Boolean));
    const previousMetrics = comparisonPayload && !comparisonIsTruncated ? [
      { key: "tourist_profiles", rawValue: previousTourists.size },
      { key: "total_visits", rawValue: previousVisits.length },
      { key: "certificates_generated", rawValue: comparisonPayload.certificates.length },
      { key: "survey_completion_rate", rawValue: safeRate(comparisonPayload.surveys.length, comparisonPayload.certificates.length) },
      { key: "average_satisfaction", rawValue: buildSatisfactionSection(comparisonPayload.surveys, []).averageOverall },
    ] : [];
    const status = comparisonPayload && !comparisonIsTruncated ? "ready" as const : "unavailable" as const;

    return {
      mode: "previous_period" as const,
      dateFrom: comparisonPeriod.dateFrom,
      dateTo: comparisonPeriod.dateTo,
      status,
      unavailableReason: comparisonQueryFailed
        ? "ไม่สามารถโหลดข้อมูลช่วงก่อนหน้าได้"
        : comparisonIsTruncated
          ? "ข้อมูลช่วงใดช่วงหนึ่งเกินขีดจำกัด จึงไม่แสดงผลต่าง"
          : null,
      metrics: compareDashboardKpis(kpis, previousMetrics),
    };
  })() : null;

  const dataQualityWarnings: string[] = [];
  if (payload.isTruncated) {
    dataQualityWarnings.push(`ข้อมูลถึงขีดจำกัด ${DASHBOARD_ROW_LIMIT.toLocaleString("th-TH")} รายการ กรุณาเลือกช่วงเวลาหรือตัวกรองให้แคบลงเพื่อให้ผลแม่นยำขึ้น`);
  }
  if (comparison?.status === "unavailable" && comparison.unavailableReason) {
    dataQualityWarnings.push(`การเปรียบเทียบช่วงก่อนหน้าไม่พร้อมใช้งาน: ${comparison.unavailableReason}`);
  }
  if (funnelFiltersUnsupported) {
    dataQualityWarnings.push(
      "ไม่สามารถแสดงเส้นทางผู้ใช้ร่วมกับตัวกรองโปรไฟล์ พฤติกรรม หรือความพึงพอใจได้ เนื่องจากเหตุการณ์ก่อนสร้างรายการเข้าชมยังเชื่อมโยงกับนักท่องเที่ยวอย่างปลอดภัยไม่ได้"
    );
  }
  if (satisfactionSection.responseCount === 0) {
    dataQualityWarnings.push("ยังไม่มีคำตอบด้านความพึงพอใจสำหรับตัวกรองนี้ จึงแสดงว่าไม่มีข้อมูลแทนการแสดงคะแนน 0");
  }
  if (expenseSection.responseCount === 0) {
    dataQualityWarnings.push("ยังไม่มีคำตอบด้านค่าใช้จ่ายสำหรับตัวกรองนี้ จึงยังไม่สามารถประมาณค่าใช้จ่ายได้");
  }
  if (Object.values(travelBehaviorResult.missing).some((count) => count > 0)) {
    dataQualityWarnings.push(
      `ข้อมูลพฤติกรรมการเดินทางมีคำตอบเว้นว่าง: ผู้ร่วมเดินทาง ${travelBehaviorResult.missing.companion.toLocaleString("th-TH")} รายการ, การเดินทาง ${travelBehaviorResult.missing.transport.toLocaleString("th-TH")} รายการ, วัตถุประสงค์ ${travelBehaviorResult.missing.purpose.toLocaleString("th-TH")} รายการ และการค้างคืน ${travelBehaviorResult.missing.overnight.toLocaleString("th-TH")} รายการ โดยสัดส่วนคำนวณจากคำตอบที่ระบุเท่านั้น`
    );
  }
  if (expenseResult.missing.spendingRange > 0 || expenseResult.missing.expenseCategory > 0) {
    dataQualityWarnings.push(
      `ข้อมูลค่าใช้จ่ายมีคำตอบเว้นว่าง: ช่วงค่าใช้จ่าย ${expenseResult.missing.spendingRange.toLocaleString("th-TH")} รายการ และหมวดค่าใช้จ่าย ${expenseResult.missing.expenseCategory.toLocaleString("th-TH")} รายการ โดยสัดส่วนคำนวณจากคำตอบที่ระบุเท่านั้น`
    );
  }

  const viewModel: Omit<DashboardViewModel, 'dashboardAlerts'> = {
    filters,
    comparison,
    generatedAt: new Date().toISOString(),
    dataSource: "live_database",
    summaryRefreshTimestamp: null,
    viewer,
    referenceOptions: payload.referenceOptions,
    kpis,
    executive: {
      visitTrend,
      visitsByProvince,
      topAttractions
    },
    touristProfile: buildTouristProfileSection(visits),
    travelBehavior: travelBehaviorResult.section,
    expense: expenseSection,
    satisfaction: satisfactionSection,
    funnel: {
      stages: funnelStages,
      largestDropOffStage
    },
    insights: buildInsights(visits, topAttractions, satisfactionSection.responseCount, surveyCompletionRate, visitsByProvince),
    dataQualityWarnings
  };

  // Build alerts from the assembled ViewModel
  const dashboardAlerts = buildDashboardAlerts(viewModel as DashboardViewModel);

  return { ...viewModel, dashboardAlerts };
}
