import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { DashboardAlertBar } from "@/components/dashboard/DashboardAlertBar";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { localizeDashboardKpi } from "@/components/dashboard/dashboard-localization";
import { SmallSampleWarning } from "@/components/dashboard/SmallSampleWarning";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/dashboard/expenses",
}));

describe("Dashboard UX ภาษาไทย", () => {
  it("แสดงแท็บภาษาไทยและระบุหน้าปัจจุบัน", () => {
    render(<DashboardTabs />);
    expect(screen.getByRole("link", { name: "ค่าใช้จ่าย" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("navigation", { name: "หมวดการวิเคราะห์" })).toBeInTheDocument();
  });

  it("แสดงกราฟแท่งพร้อมตารางข้อมูลที่เข้าถึงได้", () => {
    render(
      <BarChartCard
        title="การเข้าชมแยกตามจังหวัด"
        definition="จำนวนรายการเข้าชม"
        emptyDescription="ยังไม่มีข้อมูล"
        data={[{ label: "Pattani", value: 12, percent: 0.6 }]}
      />,
    );
    expect(screen.getByRole("heading", { name: "การเข้าชมแยกตามจังหวัด" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByText("12").length).toBeGreaterThan(0);
  });

  it("ยุบการแจ้งเตือนเป็นค่าเริ่มต้นและจำกัดข้อความบนหน้าหลัก", () => {
    render(
      <DashboardAlertBar
        alerts={[{
          id: "satisfaction_no_data",
          severity: "info",
          title: "No satisfaction responses",
          message: "No responses",
          source: "satisfaction",
        }]}
      />,
    );
    const toggle = screen.getByRole("button", { name: /สิ่งที่ควรตรวจสอบ/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("แปลตัวชี้วัดหลักโดยไม่เปลี่ยน key หรือค่าดิบ", () => {
    const metric = localizeDashboardKpi({
      key: "total_visits",
      label: "Total Visits",
      value: "25",
      rawValue: 25,
      valueType: "count",
      definition: "Visit records",
    });
    expect(metric.label).toBe("การเข้าชมที่บันทึก");
    expect(metric.key).toBe("total_visits");
    expect(metric.rawValue).toBe(25);
  });

  it("ใช้เกณฑ์ production 30 รายการสำหรับคำเตือนกลุ่มตัวอย่าง", () => {
    const { rerender } = render(<SmallSampleWarning count={29} />);
    expect(screen.getByText("กลุ่มตัวอย่างยังน้อย")).toBeInTheDocument();
    rerender(<SmallSampleWarning count={30} />);
    expect(screen.queryByText("กลุ่มตัวอย่างยังน้อย")).not.toBeInTheDocument();
  });
});
