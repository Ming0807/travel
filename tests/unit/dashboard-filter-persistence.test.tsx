import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import type { DashboardFilters as DashboardFiltersValue, DashboardReferenceOptions } from "@/types/dashboard";

const mockPathname = vi.hoisted(() => ({ current: "/admin/dashboard/expenses" }));
const mockSearchParams = vi.hoisted(() => ({ current: new URLSearchParams() }));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname.current,
  useSearchParams: () => mockSearchParams.current,
}));

const options: DashboardReferenceOptions = {
  provinces: [{ value: "1", label: "ยะลา" }],
  districts: [
    { value: "10", label: "อำเภอเมืองยะลา" },
    { value: "11", label: "อำเภอเบตง" },
  ],
  attractions: [],
  attractionTypes: [],
  originCountries: [],
  originProvinces: [],
  ageGroups: [
    { value: "18-24", label: "18–24 ปี" },
    { value: "25-34", label: "25–34 ปี" },
  ],
  transportModes: [],
  travelPurposes: [],
};

function renderFilters(filters: Partial<DashboardFiltersValue> = {}) {
  return render(
    <DashboardFilters
      filters={{ dateFrom: "2026-07-01", dateTo: "2026-07-31", ...filters }}
      options={options}
    />,
  );
}

function readFormData() {
  const form = document.querySelector("form");
  if (!form) throw new Error("Dashboard filter form was not rendered");
  return new FormData(form);
}

describe("DashboardFilters advanced filter persistence", () => {
  it("retains applied advanced values in FormData while the panel is collapsed", () => {
    renderFilters({ districtId: 10, ageGroup: "18-24", evidenceScope: "pilot_only" });

    const advancedToggle = screen.getByRole("button", { name: /ตัวกรองขั้นสูง/ });
    const panel = document.querySelector("#dashboard-advanced-filters");
    expect(panel).toHaveClass("hidden");
    expect(readFormData().get("district_id")).toBe("10");
    expect(readFormData().get("age_group")).toBe("18-24");
    expect(readFormData().get("evidence_scope")).toBe("pilot_only");

    fireEvent.click(advancedToggle);
    expect(panel).not.toHaveClass("hidden");
    fireEvent.click(advancedToggle);

    expect(advancedToggle).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveClass("hidden");
    expect(readFormData().get("district_id")).toBe("10");
    expect(readFormData().get("age_group")).toBe("18-24");
    expect(readFormData().get("evidence_scope")).toBe("pilot_only");
  });

  it("retains edited advanced values after the panel is collapsed", () => {
    renderFilters({ districtId: 10, ageGroup: "18-24", evidenceScope: "field_claim" });

    const advancedToggle = screen.getByRole("button", { name: /ตัวกรองขั้นสูง/ });
    fireEvent.click(advancedToggle);
    fireEvent.change(screen.getByLabelText("อำเภอปลายทาง"), { target: { value: "11" } });
    fireEvent.change(screen.getByLabelText("ช่วงอายุ"), { target: { value: "25-34" } });
    fireEvent.change(screen.getByLabelText("ขอบเขตหลักฐาน"), { target: { value: "all_records" } });
    fireEvent.click(advancedToggle);

    const data = readFormData();
    expect(data.get("district_id")).toBe("11");
    expect(data.get("age_group")).toBe("25-34");
    expect(data.get("evidence_scope")).toBe("all_records");
  });

  it("keeps a reachable mobile submit action inside the open advanced panel", () => {
    renderFilters();

    fireEvent.click(screen.getByRole("button", { name: /ตัวกรองขั้นสูง/ }));

    const submit = screen.getByRole("button", { name: "ใช้ตัวกรองขั้นสูง" });
    expect(submit).toHaveAttribute("type", "submit");
    expect(submit.closest("#dashboard-advanced-filters")).not.toHaveClass("hidden");
  });

  it("keeps the existing noninteger satisfaction score option", () => {
    renderFilters({ satisfactionMin: 3.2 });

    fireEvent.click(screen.getByRole("button", { name: /ตัวกรองขั้นสูง/ }));

    expect(screen.getByLabelText("คะแนนขั้นต่ำ")).toHaveValue("3.2");
    expect(screen.getByRole("option", { name: "3.2 / 5" })).toBeInTheDocument();
  });
});
