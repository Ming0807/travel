import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { DashboardAlertBar } from "@/components/dashboard/DashboardAlertBar";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { localizeDashboardKpi } from "@/components/dashboard/dashboard-localization";
import { SmallSampleWarning } from "@/components/dashboard/SmallSampleWarning";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/dashboard/expenses",
  useSearchParams: () => new URLSearchParams(),
}));

describe("dashboard responsive actions", () => {
  it("keeps the export menu within the mobile viewport", () => {
    const { container } = render(<ExportCsvButton />);
    const menu = container.querySelector("details > div");

    expect(menu).toHaveClass("w-[min(15rem,calc(100vw-2rem))]");
    expect(menu).toHaveClass("left-0", "sm:left-auto", "sm:right-0");
  });
});

describe("dashboard export privacy interactions", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  function openTouristExport() {
    const { container } = render(<ExportCsvButton />);
    const details = container.querySelector("details") as HTMLDetailsElement;
    const summary = container.querySelector("summary") as HTMLElement;
    fireEvent.click(summary);
    const trigger = container.querySelector("details > div > button") as HTMLButtonElement;
    fireEvent.click(trigger);
    return { container, details, summary, trigger };
  }

  it("opens an accessible dialog and moves focus inside it", () => {
    const { container, details } = openTouristExport();
    const dialog = screen.getByRole("dialog");

    expect(details.open).toBe(true);
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(dialog).toHaveAttribute("aria-describedby");
    expect(document.activeElement).toBe(container.querySelector('[role="dialog"] button'));
  });

  it("closes on Escape, closes the parent menu, and restores summary focus", async () => {
    const { details, summary } = openTouristExport();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(summary);
  });

  it("closes on cancel and restores focus to the visible export action", async () => {
    const { details, summary } = openTouristExport();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog.querySelectorAll("button")[1]);

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(summary);
  });

  it("downloads, closes the dialog and closes the parent menu", async () => {
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    const { details, summary } = openTouristExport();
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog.querySelectorAll("button")[2]);

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(anchorClick).toHaveBeenCalled();
    expect(details.open).toBe(false);
    expect(document.activeElement).toBe(summary);
    anchorClick.mockRestore();
  });

  it("keeps Tab focus inside the dialog", () => {
    openTouristExport();
    const dialog = screen.getByRole("dialog");
    const buttons = dialog.querySelectorAll("button");
    const first = buttons[0] as HTMLButtonElement;
    const last = buttons[buttons.length - 1] as HTMLButtonElement;

    last.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    first.focus();
    fireEvent.keyDown(dialog, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Dashboard UX ภาษาไทย", () => {
  it("แสดงแท็บภาษาไทยและระบุหน้าปัจจุบัน", () => {
    render(<DashboardTabs />);
    expect(screen.getByRole("link", { name: "ค่าใช้จ่าย" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "ค่าใช้จ่าย" })).toHaveClass("bg-[#171717]");
    expect(screen.getByRole("navigation", { name: "หมวดการวิเคราะห์" })).toHaveClass("lg:hidden");
  });

  it("ยุบตัวกรองหลักไว้ในแถบกะทัดรัดและเปิดแก้ไขได้", () => {
    render(
      <DashboardFilters
        filters={{ dateFrom: "2026-07-01", dateTo: "2026-07-31" }}
        options={{
          provinces: [{ value: "1", label: "ยะลา" }],
          districts: [],
          attractions: [],
          attractionTypes: [],
          originCountries: [],
          originProvinces: [],
          ageGroups: [],
          transportModes: [],
          travelPurposes: [],
        }}
      />,
    );

    const toggle = screen.getByRole("button", { name: "ปรับตัวกรอง" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByLabelText("ตั้งแต่วันที่").closest("#dashboard-filter-form")).toHaveClass("hidden");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText("ตั้งแต่วันที่").closest("#dashboard-filter-form")).toHaveClass("block");
    expect(screen.getByLabelText("ตั้งแต่วันที่")).toBeVisible();
    expect(screen.getByRole("button", { name: "นำตัวกรองไปใช้" })).toBeVisible();
  });

  it("เปิดแถบตัวกรองอัตโนมัติบนหน้าจอ desktop", async () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(
      <DashboardFilters
        filters={{ dateFrom: "2026-07-01", dateTo: "2026-07-31" }}
        options={{
          provinces: [{ value: "1", label: "ยะลา" }],
          districts: [],
          attractions: [],
          attractionTypes: [],
          originCountries: [],
          originProvinces: [],
          ageGroups: [],
          transportModes: [],
          travelPurposes: [],
        }}
      />,
    );

    await waitFor(() => expect(screen.getByLabelText("ตั้งแต่วันที่")).toBeVisible());
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

  it("แสดงกราฟแนวโน้มพร้อมผลรวมและตารางข้อมูลที่ตรวจสอบได้", () => {
    render(
      <TrendChart
        points={[
          { label: "2026-07-01", value: 4 },
          { label: "2026-07-02", value: 7 },
        ]}
      />,
    );

    expect(screen.getByText("รวมในช่วงที่เลือก")).toBeInTheDocument();
    expect(screen.getByText("11 ครั้ง")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "ข้อมูลแนวโน้มรายการเข้าชม" })).toBeInTheDocument();
    expect(screen.getAllByText("7").length).toBeGreaterThan(0);
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
