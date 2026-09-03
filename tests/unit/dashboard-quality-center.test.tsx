import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardQualityCenter } from "@/components/dashboard/DashboardQualityCenter";
import { buildDashboardQuality } from "@/lib/dashboard/dashboard-quality";

describe("dashboard quality center", () => {
  it("grades complete field evidence and exposes auditable metadata", () => {
    const quality = buildDashboardQuality({
      activeTab: "satisfaction",
      evidenceScope: "field_claim",
      generatedAt: "2026-09-04T10:00:00.000Z",
      dataSource: "live_database",
      summaryRefreshTimestamp: null,
      sampleSize: 80,
      answeredCount: 72,
      denominatorCount: 80,
      suppressedCellCount: 0,
      isTruncated: false,
      warnings: [],
    });

    expect(quality.evidenceGrade).toBe("strong");
    expect(quality.claimsAllowed).toBe(true);
    expect(quality.exportAllowed).toBe(true);
    expect(quality.scope.label).toContain("ภาคสนาม");
    expect(quality.metadata.sourceTables).toContain("satisfaction_surveys");

    render(<DashboardQualityCenter quality={quality} />);
    expect(screen.getByRole("region", { name: "คุณภาพและความเชื่อมั่นของข้อมูล" })).toBeInTheDocument();
    expect(screen.getByText("หลักฐานแข็งแรง")).toBeInTheDocument();
    expect(screen.getByText(/72 \/ 80/)).toBeInTheDocument();
    expect(screen.getByText("รายละเอียดและที่มาของข้อมูล")).toBeInTheDocument();
  });

  it("blocks conclusions and exports when a bounded read is truncated", () => {
    const quality = buildDashboardQuality({
      activeTab: "executive",
      evidenceScope: "all_records",
      generatedAt: "2026-09-04T10:00:00.000Z",
      dataSource: "live_database",
      summaryRefreshTimestamp: null,
      sampleSize: 10_000,
      answeredCount: 9_000,
      denominatorCount: 10_000,
      suppressedCellCount: 3,
      isTruncated: true,
      warnings: ["ข้อมูลถึงขีดจำกัดการอ่าน"],
    });

    expect(quality.status).toBe("blocked");
    expect(quality.claimsAllowed).toBe(false);
    expect(quality.exportAllowed).toBe(false);
    expect(quality.operationalTasks.some((task) => task.key === "narrow_scope")).toBe(true);
  });
});
