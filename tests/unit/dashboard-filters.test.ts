import { describe, expect, it } from "vitest";
import { getPreviousDashboardPeriod, parseDashboardFilters } from "@/lib/validation/dashboard-filters";

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

  it("accepts only the supported previous-period comparison mode", () => {
    const valid = parseDashboardFilters({
      date_from: "2026-05-01",
      date_to: "2026-05-31",
      compare: "previous_period"
    });
    const invalid = parseDashboardFilters({
      date_from: "2026-05-01",
      date_to: "2026-05-31",
      compare: "year_over_year"
    });

    expect(valid.success).toBe(true);
    if (valid.success) expect(valid.data.comparisonMode).toBe("previous_period");
    expect(invalid.success).toBe(false);
  });

  it("derives an equal inclusive previous period across month boundaries", () => {
    expect(getPreviousDashboardPeriod("2026-03-01", "2026-03-31")).toEqual({
      dateFrom: "2026-01-29",
      dateTo: "2026-02-28"
    });
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
