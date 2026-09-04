import type { DashboardViewModel } from "@/types/dashboard";

export function buildDashboardSummaryExportRows(data: Pick<DashboardViewModel, "kpis" | "executive">): Array<Record<string, unknown>> {
  // Keep every section's columns present so CSV and spreadsheet writers agree.
  const columns = {
    Rank: "", Attraction: "", Province: "", Visits: "", Certificates: "", Surveys: "",
    "Average Satisfaction": "", Section: "", Metric: "", Label: "", Date: "",
    Value: "", "Display Value": "", "Value Type": "", "Sample Size": "",
    Denominator: "", Unit: "", Definition: "", Note: "",
  };

  return [
    ...data.kpis.map((kpi) => ({
      ...columns,
      Section: "KPI",
      Metric: kpi.key,
      Label: kpi.label,
      Value: kpi.rawValue ?? "",
      "Display Value": kpi.value,
      "Value Type": kpi.valueType,
      "Sample Size": kpi.evidence?.sampleSize ?? "",
      Denominator: kpi.evidence?.denominator ?? "",
      Unit: kpi.evidence?.unit ?? "",
      Definition: kpi.definition,
      Note: kpi.note ?? "",
    })),
    ...data.executive.visitTrend.map((point) => ({
      ...columns,
      Section: "Visit Trend",
      Metric: "visits",
      Date: point.label,
      Value: point.value,
      "Value Type": "count",
      Unit: "visit records",
      Definition: "Recorded visits by visit date, not public page views or QR scan events",
    })),
    ...data.executive.topAttractions.map((attraction) => ({
      ...columns,
      Section: "Attraction Ranking",
      Rank: attraction.rank,
      Attraction: attraction.attractionName,
      Province: attraction.provinceName,
      Visits: attraction.visitCount,
      Certificates: attraction.certificateCount,
      Surveys: attraction.surveyResponseCount,
      "Average Satisfaction": attraction.averageSatisfaction ?? "",
      Note: "Dashboard summary export uses aggregated planning metrics only",
    })),
  ];
}
