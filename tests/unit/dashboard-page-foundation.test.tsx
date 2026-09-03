import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardPageFailure } from "@/components/dashboard/DashboardPageFailure";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { navGroups } from "@/components/admin/admin-nav-items";
import { buildDashboardNavigationHref } from "@/components/dashboard/dashboard-navigation";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/dashboard/expenses",
  useSearchParams: () => new URLSearchParams("date_from=2026-08-01&date_to=2026-08-31&attraction_id=4&ignored=private"),
}));

describe("dashboard page foundation", () => {
  it("explains the page decision, visible scope, freshness and source", () => {
    render(
      <DashboardPageHeader
        dataSource="pre_aggregated"
        filters={{ dateFrom: "2026-08-01", dateTo: "2026-08-31" }}
        generatedAt="2026-09-03T10:20:00.000Z"
        page="expenses"
        summaryRefreshTimestamp="2026-09-03T10:00:00.000Z"
      />,
    );

    expect(screen.getByRole("heading", { name: "สัญญาณค่าใช้จ่าย" })).toBeInTheDocument();
    expect(screen.getByText(/รูปแบบการใช้จ่ายที่ผู้ตอบรายงานเอง/)).toBeInTheDocument();
    expect(screen.getByText("1 ส.ค. 2569 - 31 ส.ค. 2569")).toBeInTheDocument();
    expect(screen.getByText("ข้อมูลสรุปที่ประมวลผลแล้ว")).toBeInTheDocument();
    expect(screen.getByText(/อัปเดตข้อมูล/)).toBeInTheDocument();
  });

  it("uses a stable heading id for each dashboard area", () => {
    render(
      <DashboardPageHeader
        dataSource="live_database"
        filters={{ dateFrom: "2026-08-01", dateTo: "2026-08-31" }}
        generatedAt="2026-09-03T10:20:00.000Z"
        page="overview"
        summaryRefreshTimestamp={null}
      />,
    );

    expect(screen.getByRole("heading", { name: "ภาพรวมการตัดสินใจ" })).toHaveAttribute("id", "executive-overview-heading");
    expect(screen.getByText("ฐานข้อมูลปัจจุบัน")).toBeInTheDocument();
  });

  it("distinguishes invalid filters from a temporary query failure", () => {
    const { rerender } = render(<DashboardPageFailure error={{ code: "VALIDATION_ERROR" }} />);
    expect(screen.getByRole("heading", { name: "ตัวกรองไม่ถูกต้อง" })).toBeInTheDocument();
    expect(screen.getByText(/ตรวจสอบช่วงวันที่และค่าตัวกรอง/)).toBeInTheDocument();

    rerender(<DashboardPageFailure error={{ code: "QUERY_FAILED" }} />);
    expect(screen.getByRole("heading", { name: "ข้อมูลวิเคราะห์ไม่พร้อมใช้งานชั่วคราว" })).toBeInTheDocument();
    expect(screen.getByText(/ข้อมูลเดิมไม่ได้ถูกลบ/)).toBeInTheDocument();
  });

  it("states permission denial without presenting it as missing data", () => {
    render(<DashboardPageFailure error={{ code: "FORBIDDEN" }} />);
    expect(screen.getByRole("heading", { name: "ไม่มีสิทธิ์ดูข้อมูลส่วนนี้" })).toBeInTheDocument();
    expect(screen.queryByText("ยังไม่มีข้อมูล")).not.toBeInTheDocument();
  });

  it("uses one decision-oriented order and vocabulary across dashboard navigation", () => {
    render(<DashboardTabs />);
    const labels = screen.getAllByRole("link").map((link) => link.textContent?.trim());

    expect(labels).toEqual([
      "ภาพรวม",
      "กลุ่มนักท่องเที่ยว",
      "การเดินทาง",
      "เส้นทางผู้ใช้",
      "ประสบการณ์",
      "ค่าใช้จ่าย",
      "รายสถานที่",
      "ความยั่งยืน",
    ]);

    const analyticsGroup = navGroups.find((group) => group.group === "วิเคราะห์และวิจัย");
    expect(analyticsGroup?.items.map((item) => item.label)).toEqual([
      "ภาพรวมการตัดสินใจ",
      "กลุ่มนักท่องเที่ยว",
      "พฤติกรรมการเดินทาง",
      "เส้นทางผู้ใช้",
      "คุณภาพประสบการณ์",
      "สัญญาณค่าใช้จ่าย",
      "วิเคราะห์รายสถานที่",
      "ความยั่งยืนและข้อเสนอ",
      "ศูนย์งานวิจัย",
    ]);
    expect(screen.getByRole("link", { name: "ประสบการณ์" })).toHaveAttribute(
      "href",
      "/admin/dashboard/satisfaction?date_from=2026-08-01&date_to=2026-08-31&attraction_id=4",
    );
  });

  it("translates the shared scope for attraction analytics and drops unsupported parameters", () => {
    expect(buildDashboardNavigationHref(
      "/admin/dashboard/attractions",
      "date_from=2026-08-01&date_to=2026-08-31&attraction_id=4&origin_country_id=66&ignored=private",
    )).toBe("/admin/dashboard/attractions?dateFrom=2026-08-01&dateTo=2026-08-31&attractionId=4");

    expect(buildDashboardNavigationHref(
      "/admin/dashboard/tourists",
      "dateFrom=2026-07-01&dateTo=2026-07-31&attractionId=9&compare=previous_period&evidenceScope=pilot_only",
    )).toBe("/admin/dashboard/tourists?date_from=2026-07-01&date_to=2026-07-31&attraction_id=9&compare=previous_period");
  });
});
