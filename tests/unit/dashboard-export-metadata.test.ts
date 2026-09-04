import { describe, expect, it } from "vitest";

import {
  attachDashboardExportMetadata,
  buildDashboardExportMetadata,
} from "@/lib/dashboard/dashboard-export-metadata";
import type { DashboardQuality } from "@/types/dashboard";

const quality: DashboardQuality = {
  status: "caution",
  evidenceGrade: "usable",
  scope: { code: "pilot_only", label: "Pilot เท่านั้น" },
  sampleSize: 42,
  coverage: {
    answeredCount: 35,
    denominatorCount: 42,
    rate: 35 / 42,
    missingCount: 7,
    missingRate: 7 / 42,
  },
  freshness: { state: "fresh", label: "ข้อมูลล่าสุด" },
  suppressedCellCount: 2,
  truncated: false,
  claimsAllowed: true,
  exportAllowed: true,
  blockers: [],
  warnings: ["ตัวอย่างคำเตือน"],
  operationalTasks: [],
  metadata: {
    sourceTables: ["visits", "satisfaction_surveys"],
    metricVersion: "dashboard-v3",
    dateField: "visit_date",
    refreshedAt: "2026-09-04T01:00:00.000Z",
    exclusions: ["ไม่รวมข้อมูลจำลอง", "ไม่รวมคำตอบที่เว้นว่าง"],
  },
};

describe("dashboard export metadata", () => {
  it("describes scope, denominator, exclusions, suppression, and metric version", () => {
    const metadata = buildDashboardExportMetadata({
      title: "รายงานประสบการณ์นักท่องเที่ยว",
      generatedAt: "2026-09-04T02:00:00.000Z",
      filters: {
        dateFrom: "2026-08-01",
        dateTo: "2026-08-31",
        evidenceScope: "pilot_only",
        attractionId: 4,
      },
      quality,
    });

    expect(metadata).toMatchObject({
      reportTitle: "รายงานประสบการณ์นักท่องเที่ยว",
      evidenceScope: "Pilot เท่านั้น",
      generatedAt: "2026-09-04T02:00:00.000Z",
      denominator: 42,
      metricVersion: "dashboard-v3",
    });
    expect(metadata.selectedScope).toContain("date_from=2026-08-01");
    expect(metadata.selectedScope).toContain("attraction_id=4");
    expect(metadata.exclusions).toContain("ไม่รวมข้อมูลจำลอง");
    expect(metadata.suppressionNote).toContain("2");
  });

  it("embeds reproducibility context in every analytical row", () => {
    const metadata = buildDashboardExportMetadata({
      title: "รายงานสรุป",
      generatedAt: "2026-09-04T02:00:00.000Z",
      filters: { dateFrom: "2026-08-01", dateTo: "2026-08-31" },
      quality,
    });
    const rows = attachDashboardExportMetadata([{ Metric: "visits", Value: 42 }], metadata);

    expect(rows[0]).toMatchObject({
      Metric: "visits",
      Value: 42,
      "Report Title": "รายงานสรุป",
      "Evidence Scope": "Pilot เท่านั้น",
      "Report Denominator": 42,
      "Metric Version": "dashboard-v3",
    });
  });
});
