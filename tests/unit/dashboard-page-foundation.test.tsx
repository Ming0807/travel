import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardPageFailure } from "@/components/dashboard/DashboardPageFailure";
import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";

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
});
