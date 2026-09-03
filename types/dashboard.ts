export type DashboardFilters = {
  dateFrom: string;
  dateTo: string;
  comparisonMode?: "previous_period";
  evidenceScope?: DashboardEvidenceScope;
  provinceId?: number;
  districtId?: number;
  attractionId?: number;
  attractionTypeId?: number;
  originCountryId?: number;
  originProvinceId?: number;
  ageGroup?: string;
  transportModeId?: number;
  travelPurposeId?: number;
  satisfactionMin?: number;
  satisfactionMax?: number;
};

export type DashboardEvidenceScope = "field_claim" | "all_records" | "pilot_only" | "simulated_only";
export type DashboardQualityPage = "executive" | "tourists" | "visits" | "expenses" | "satisfaction" | "funnel" | "sustainability";

export type DashboardQuality = {
  status: "ready" | "caution" | "blocked";
  evidenceGrade: "unavailable" | "insufficient" | "limited" | "usable" | "strong";
  scope: { code: DashboardEvidenceScope; label: string };
  sampleSize: number;
  coverage: {
    answeredCount: number;
    denominatorCount: number;
    rate: number | null;
    missingCount: number;
    missingRate: number | null;
  } | null;
  freshness: { state: "fresh" | "aging" | "stale"; label: string };
  suppressedCellCount: number;
  truncated: boolean;
  claimsAllowed: boolean;
  exportAllowed: boolean;
  blockers: string[];
  warnings: string[];
  operationalTasks: Array<{
    key: string;
    severity: "critical" | "warning" | "info";
    title: string;
    detail: string;
  }>;
  metadata: {
    sourceTables: string[];
    metricVersion: string;
    dateField: string;
    refreshedAt: string;
    exclusions: string[];
  };
};

export type DashboardMetricComparison = {
  currentValue: number | null;
  previousValue: number | null;
  absoluteChange: number | null;
  percentChange: number | null;
  direction: "up" | "down" | "flat" | "unavailable";
};

export type DashboardComparison = {
  mode: "previous_period";
  dateFrom: string;
  dateTo: string;
  status: "ready" | "unavailable";
  unavailableReason: string | null;
  metrics: Record<string, DashboardMetricComparison>;
};

export type DashboardReferenceOption = {
  value: string;
  label: string;
};

export type DashboardReferenceOptions = {
  provinces: DashboardReferenceOption[];
  districts: DashboardReferenceOption[];
  attractions: DashboardReferenceOption[];
  attractionTypes: DashboardReferenceOption[];
  originCountries: DashboardReferenceOption[];
  originProvinces: DashboardReferenceOption[];
  ageGroups: DashboardReferenceOption[];
  transportModes: DashboardReferenceOption[];
  travelPurposes: DashboardReferenceOption[];
};

export type KpiValueType = "count" | "percentage" | "rating" | "currency_range" | "text";

export type DashboardKpi = {
  key: string;
  label: string;
  value: string;
  rawValue: number | null;
  valueType: KpiValueType;
  definition: string;
  note?: string;
  evidence?: {
    level: "system_record" | "limited" | "decision_ready" | "unavailable";
    sampleSize: number;
    denominator: number | null;
    unit: string;
  };
};

export type DistributionItem = {
  label: string;
  value: number;
  percent: number | null;
  note?: string;
};

export type TrendPoint = {
  label: string;
  value: number;
};

export type RankedAttraction = {
  rank: number;
  attractionName: string;
  provinceName: string;
  visitCount: number;
  certificateCount: number;
  averageSatisfaction: number | null;
  surveyResponseCount: number;
};

export type FunnelStage = {
  key: string;
  label: string;
  count: number;
  conversionFromPrevious: number | null;
  dropOffFromPrevious: number | null;
  definition: string;
};

export type DashboardAlertSeverity = "critical" | "warning" | "info";

export type DashboardAlert = {
  id: string;
  severity: DashboardAlertSeverity;
  title: string;
  message: string;
  source: "satisfaction" | "funnel" | "survey" | "expense" | "data_quality" | "general";
  actionable?: boolean;
  actionLabel?: string;
  actionHref?: string;
};

export type InsightCardData = {
  title: string;
  category: "improvement" | "promotion" | "concentration" | "data_quality" | "opportunity";
  description: string;
  evidence: string;
  suggestedAction: string;
  confidence: "low" | "medium" | "high";
};

export type DashboardViewModel = {
  filters: DashboardFilters;
  comparison?: DashboardComparison | null;
  generatedAt: string;
  dataSource: "live_database" | "pre_aggregated";
  summaryRefreshTimestamp: string | null;
  quality?: DashboardQuality;
  viewer: {
    displayName: string | null;
    email: string;
    permissions: string[];
  };
  referenceOptions: DashboardReferenceOptions;
  kpis: DashboardKpi[];
  executive: {
    visitTrend: TrendPoint[];
    visitsByProvince: DistributionItem[];
    topAttractions: RankedAttraction[];
  };
  touristProfile: {
    recordCount?: number;
    originProvinceEligibleCount?: number;
    originCountries: DistributionItem[];
    originProvinces: DistributionItem[];
    ageGroups: DistributionItem[];
    preferredLanguages: DistributionItem[];
    identityProviders: DistributionItem[];
  };
  travelBehavior: {
    recordCount?: number;
    companionTypes: DistributionItem[];
    transportModes: DistributionItem[];
    travelPurposes: DistributionItem[];
    overnightStatus: DistributionItem[];
    averageGroupSize: number | null;
    averageNights: number | null;
    answeredGroupSizeCount: number;
    answeredNightsCount: number;
  };
  expense: {
    eligibleSurveyCount?: number;
    spendingRanges: DistributionItem[];
    expenseCategories: DistributionItem[];
    estimatedMin: number | null;
    estimatedMax: number | null;
    hasOpenEndedRange: boolean;
    responseCount: number;
    spendingRangeResponseCount: number;
    expenseCategoryResponseCount: number;
    methodologyNote: string;
  };
  satisfaction: {
    surveyRecordCount?: number;
    averageOverall: number | null;
    responseCount: number;
    distribution: DistributionItem[];
    byAttraction: RankedAttraction[];
    safetyAverage: number | null;
    safetyResponseCount: number;
    cleanlinessAverage: number | null;
    cleanlinessResponseCount: number;
    accessibilityAverage: number | null;
    accessibilityResponseCount: number;
    informationAverage: number | null;
    informationResponseCount: number;
    valueAverage: number | null;
    valueResponseCount: number;
    /**
     * Legacy score from the first schema. Kept so old survey rows remain readable,
     * but new survey UX writes accessibility/information/value instead.
     */
    facilityAverage: number | null;
    facilityResponseCount: number;
    revisitIntentionRate: number | null;
    revisitAnsweredCount: number;
    recommendIntentionRate: number | null;
    recommendAnsweredCount: number;
    ageGroupComparison?: {
      status: "ready" | "insufficient" | "unavailable";
      groups: Array<{ label: string; sampleSize: number; mean: number | null; suppressed: boolean }>;
    };
  };
  funnel: {
    stages: FunnelStage[];
    largestDropOffStage: FunnelStage | null;
  };
  insights: InsightCardData[];
  dashboardAlerts: DashboardAlert[];
  dataQualityWarnings: string[];
};
