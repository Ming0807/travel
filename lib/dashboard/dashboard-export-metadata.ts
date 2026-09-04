import { DASHBOARD_METRIC_VERSION } from "@/lib/dashboard/dashboard-quality";
import {
  dashboardFiltersToSafeQuery,
  dashboardQueryString,
} from "@/lib/dashboard/dashboard-saved-views";
import type { DashboardFilters, DashboardQuality } from "@/types/dashboard";

export type DashboardExportMetadata = {
  reportTitle: string;
  selectedScope: string;
  evidenceScope: string;
  generatedAt: string;
  denominator: number;
  exclusions: string;
  suppressionNote: string;
  metricVersion: string;
};

export function buildDashboardExportMetadata(input: {
  title: string;
  generatedAt: string;
  filters: DashboardFilters;
  quality?: Pick<DashboardQuality, "scope" | "sampleSize" | "coverage" | "suppressedCellCount" | "metadata">;
  denominator?: number;
  exclusions?: string[];
}): DashboardExportMetadata {
  const quality = input.quality;
  const denominator = input.denominator ?? quality?.coverage?.denominatorCount ?? quality?.sampleSize ?? 0;
  const exclusions = input.exclusions ?? quality?.metadata.exclusions ?? [];
  const suppressedCellCount = quality?.suppressedCellCount ?? 0;
  return {
    reportTitle: input.title,
    selectedScope: dashboardQueryString(dashboardFiltersToSafeQuery(input.filters)),
    evidenceScope: quality?.scope.label ?? input.filters.evidenceScope ?? "field_claim",
    generatedAt: input.generatedAt,
    denominator,
    exclusions: exclusions.join("; ") || "ไม่มีข้อยกเว้นเพิ่มเติม",
    suppressionNote: !quality
      ? "ส่งออกแบบไม่ระบุตัวบุคคลตามสิทธิ์และเกณฑ์จำนวนรายการขั้นต่ำ ไม่ใช่การรับรองว่าไม่มีความเสี่ยงระบุตัวบุคคลซ้ำ"
      : suppressedCellCount > 0
      ? `ปกปิด ${suppressedCellCount.toLocaleString("th-TH")} เซลล์ตามเกณฑ์ความเป็นส่วนตัว`
      : "ไม่พบเซลล์ที่ต้องปกปิดในผลส่งออกนี้",
    metricVersion: quality?.metadata.metricVersion ?? DASHBOARD_METRIC_VERSION,
  };
}

export function attachDashboardExportMetadata(
  rows: Array<Record<string, unknown>>,
  metadata: DashboardExportMetadata,
): Array<Record<string, unknown>> {
  const context = {
    "Report Title": metadata.reportTitle,
    "Selected Scope": metadata.selectedScope,
    "Evidence Scope": metadata.evidenceScope,
    "Generated At": metadata.generatedAt,
    "Report Denominator": metadata.denominator,
    Exclusions: metadata.exclusions,
    "Suppression Note": metadata.suppressionNote,
    "Metric Version": metadata.metricVersion,
  };
  return (rows.length > 0 ? rows : [{ Message: "No data available" }]).map((row) => ({
    ...row,
    ...context,
  }));
}
