export type PublicEvidenceStatus = "available" | "no_data" | "suppressed" | "small_sample";

export type PublicEvidenceKpi = {
  key: "tourist_profiles" | "total_visits" | "certificates_generated" | "average_satisfaction";
  label: string;
  displayValue: string;
  status: PublicEvidenceStatus;
  sampleSize: number | null;
  definition: string;
  source: string;
  limitation: string;
};

export type PublicEvidenceTrendPoint = {
  isoDate: string;
  label: string;
  value: number | null;
  displayValue: string;
  status: Exclude<PublicEvidenceStatus, "small_sample">;
};

export type PublicEvidenceDistributionItem = {
  label: string;
  value: number | null;
  displayValue: string;
  percent: number | null;
  status: Exclude<PublicEvidenceStatus, "small_sample">;
};

export type PublicEvidenceDistributionGroup = {
  key: string;
  label: string;
  definition: string;
  source: string;
  items: PublicEvidenceDistributionItem[];
};

export type PublicEvidenceAttraction = {
  label: string;
  visitValue: number;
  visitDisplayValue: string;
  certificateDisplayValue: string;
  satisfactionDisplayValue: string;
  satisfactionSampleSize: number | null;
};

export type PublicEvidenceSatisfaction = {
  key: string;
  label: string;
  displayValue: string;
  value: number | null;
  status: "available" | "no_data" | "small_sample";
  sampleSize: number | null;
};

export type PublicEvidenceOpportunity = {
  kind: "improvement" | "promotion";
  title: string;
  finding: string;
  evidence: string;
  suggestedAction: string;
  confidenceLabel: string;
};

export type PublicDashboardEvidence = {
  scope: {
    provinceName: string;
    dateFrom: string;
    dateTo: string;
    dataAsOf: string;
    sourceLabel: string;
  };
  thresholds: {
    publicCellMinimum: number;
    interpretationMinimum: number;
  };
  kpis: PublicEvidenceKpi[];
  trend: PublicEvidenceTrendPoint[];
  visitorProfile: PublicEvidenceDistributionGroup[];
  travelBehavior: PublicEvidenceDistributionGroup[];
  topAttractions: PublicEvidenceAttraction[];
  satisfaction: PublicEvidenceSatisfaction[];
  opportunities: PublicEvidenceOpportunity[];
  limitations: string[];
};
