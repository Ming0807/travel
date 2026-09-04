import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import type { DashboardFilters } from "@/types/dashboard";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams("province_id=99&email=private@example.com"),
}));

afterEach(() => vi.restoreAllMocks());

describe("dashboard export screen scope", () => {
  it("exports the resolved screen dates and filters, never a pending or unrelated URL", () => {
    const filters: DashboardFilters = {
      dateFrom: "2026-08-01", dateTo: "2026-08-31", evidenceScope: "pilot_only",
      provinceId: 1, districtId: 2, attractionId: 3, attractionTypeId: 4,
      originCountryId: 5, originProvinceId: 6, ageGroup: "18_24",
      transportModeId: 7, travelPurposeId: 8, satisfactionMin: 3.2, satisfactionMax: 5,
    };
    let downloadUrl = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) { downloadUrl = this.href; });
    render(<ExportCsvButton filters={filters} />);
    fireEvent.click(screen.getByText("ส่งออกข้อมูล"));
    fireEvent.click(screen.getByRole("button", { name: "สรุปภาพรวม" }));
    fireEvent.click(screen.getByRole("button", { name: "ดาวน์โหลด" }));

    const params = new URL(downloadUrl).searchParams;
    expect(Object.fromEntries(params)).toEqual({
      date_from: "2026-08-01", date_to: "2026-08-31", evidence_scope: "pilot_only",
      province_id: "1", district_id: "2", attraction_id: "3", attraction_type_id: "4",
      origin_country_id: "5", origin_province_id: "6", age_group: "18_24",
      transport_mode_id: "7", travel_purpose_id: "8", satisfaction_min: "3.2", satisfaction_max: "5",
      type: "summary", format: "csv",
    });
    expect(downloadUrl).not.toContain("private@example.com");
  });
});
