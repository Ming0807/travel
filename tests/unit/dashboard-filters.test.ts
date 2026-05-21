import { describe, expect, it } from "vitest";
import { parseDashboardFilters } from "@/lib/validation/dashboard-filters";

describe("dashboard filter validation", () => {
  it("accepts a valid date range and numeric filters", () => {
    const result = parseDashboardFilters({
      date_from: "2026-05-01",
      date_to: "2026-05-31",
      province_id: "1",
      satisfaction_min: "3",
      satisfaction_max: "5"
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.provinceId).toBe(1);
      expect(result.data.satisfactionMin).toBe(3);
    }
  });

  it("rejects inverted date ranges", () => {
    const result = parseDashboardFilters({
      date_from: "2026-06-01",
      date_to: "2026-05-01"
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid satisfaction ranges", () => {
    const result = parseDashboardFilters({
      date_from: "2026-05-01",
      date_to: "2026-05-31",
      satisfaction_min: "5",
      satisfaction_max: "2"
    });

    expect(result.success).toBe(false);
  });
});
