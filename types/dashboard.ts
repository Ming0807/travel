export type DashboardFilters = {
  dateFrom: string;
  dateTo: string;
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
  generatedAt: string;
  dataSource: "live_database" | "pre_aggregated";
  summaryRefreshTimestamp: string | null;
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
    originCountries: DistributionItem[];
    originProvinces: DistributionItem[];
    ageGroups: DistributionItem[];
    preferredLanguages: DistributionItem[];
    identityProviders: DistributionItem[];
  };
  travelBehavior: {
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
    spendingRanges: DistributionItem[];
    expenseCategories: DistributionItem[];
    estimatedMin: number | null;
    estimatedMax: number | null;
    hasOpenEndedRange: boolean;
    responseCount: number;
    methodologyNote: string;
  };
  satisfaction: {
    averageOverall: number | null;
    responseCount: number;
    distribution: DistributionItem[];
    byAttraction: RankedAttraction[];
    safetyAverage: number | null;
    cleanlinessAverage: number | null;
    facilityAverage: number | null;
    revisitIntentionRate: number | null;
    recommendIntentionRate: number | null;
  };
  funnel: {
    stages: FunnelStage[];
    largestDropOffStage: FunnelStage | null;
  };
  insights: InsightCardData[];
  dashboardAlerts: DashboardAlert[];
  dataQualityWarnings: string[];
};
