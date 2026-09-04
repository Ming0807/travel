import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExecutiveOverview } from "@/components/dashboard/ExecutiveOverview";
import { executiveFixture } from "../visual/dashboard/executive-fixture";

describe("Executive decision workspace", () => {
  it("keeps five primary metrics and restores experience and planning evidence", () => {
    const { container } = render(<ExecutiveOverview data={executiveFixture(null)} />);
    expect(within(screen.getByLabelText("ตัวชี้วัดหลัก")).getAllByRole("article")).toHaveLength(5);
    expect(container.querySelectorAll("[data-print-grid]")).toHaveLength(3);
    expect(container.querySelector("[data-print-kpis]")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "คุณภาพประสบการณ์" })).toBeInTheDocument();
    const planning = screen.getByRole("region", { name: "ข้อมูลประกอบการวางแผน" });
    expect(within(planning).getByText("90,000 - 180,000 บาท")).toBeInTheDocument();
    expect(within(planning).getByText(/ไม่ใช่รายได้ธุรกิจ/)).toBeInTheDocument();
    expect(within(planning).getByText("360")).toBeInTheDocument();
  });

  it("preserves selected dates, evidence and fractional score on supported drill-downs", () => {
    render(<ExecutiveOverview data={executiveFixture(null)} />);
    const href = screen.getByRole("link", { name: "เจาะลึกคุณภาพประสบการณ์" }).getAttribute("href");
    const query = new URL(href!, "http://localhost").searchParams;
    expect(query.get("date_from")).toBe("2026-08-01");
    expect(query.get("evidence_scope")).toBe("pilot_only");
    expect(query.get("satisfaction_min")).toBe("3.2");
    const attraction = screen.getByRole("link", { name: "วิเคราะห์รายสถานที่" }).getAttribute("href");
    expect(attraction).toContain("dateFrom=2026-08-01");
    expect(attraction).toContain("evidenceScope=pilot_only");
  });

  it("keeps missing scores distinct from zero and warns on single-date evidence", () => {
    const { unmount } = render(<ExecutiveOverview data={executiveFixture("empty")} />);
    expect(screen.queryByText("0.0 / 5")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "ยังไม่มีคะแนนเฉลี่ย" })).toBeInTheDocument();
    unmount();
    render(<ExecutiveOverview data={executiveFixture("low")} />);
    expect(screen.getByText(/มีข้อมูลเพียงวันเดียว/)).toBeInTheDocument();
    expect(screen.getByText(/แสดงจุดเมื่อมีคำตอบอย่างน้อย 30/)).toBeInTheDocument();
  });

  it("withholds directional comparison copy when the quality gate blocks claims", () => {
    const data = executiveFixture("low");
    data.comparison = {
      mode: "previous_period",
      dateFrom: "2026-07-01",
      dateTo: "2026-07-31",
      status: "ready",
      unavailableReason: null,
      metrics: {
        total_visits: { currentValue: 2, previousValue: 1, absoluteChange: 1, percentChange: 100, direction: "up" },
      },
    };
    data.quality = {
      status: "blocked",
      evidenceGrade: "insufficient",
      scope: { code: "pilot_only", label: "Pilot" },
      sampleSize: 2,
      coverage: { answeredCount: 2, denominatorCount: 2, rate: 1, missingCount: 0, missingRate: 0 },
      freshness: { state: "fresh", label: "ใหม่" },
      suppressedCellCount: 0,
      truncated: false,
      claimsAllowed: false,
      exportAllowed: false,
      blockers: ["ฐานข้อมูลน้อยกว่าเกณฑ์"],
      warnings: [],
      operationalTasks: [],
      metadata: { sourceTables: ["visits"], metricVersion: "test", dateField: "visit_date", refreshedAt: "2026-09-04T00:00:00.000Z", exclusions: [] },
    };

    render(<ExecutiveOverview data={data} />);

    expect(screen.queryByText(/เพิ่มขึ้น 100% จากช่วงก่อน/)).not.toBeInTheDocument();
    expect(screen.queryByText("สิ่งที่เปลี่ยนจากช่วงก่อน")).not.toBeInTheDocument();
  });
});
