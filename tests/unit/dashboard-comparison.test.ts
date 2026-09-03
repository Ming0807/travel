import { describe, expect, it } from "vitest";

import { buildDashboardMetricComparison } from "@/lib/services/dashboard-comparison";

describe("dashboard previous-period comparison", () => {
  it("calculates absolute and percentage change when both values are comparable", () => {
    expect(buildDashboardMetricComparison(120, 100)).toEqual({
      currentValue: 120,
      previousValue: 100,
      absoluteChange: 20,
      percentChange: 20,
      direction: "up"
    });
  });

  it("does not invent a percentage or direction when the previous value is zero", () => {
    expect(buildDashboardMetricComparison(12, 0)).toEqual({
      currentValue: 12,
      previousValue: 0,
      absoluteChange: 12,
      percentChange: null,
      direction: "unavailable"
    });
  });

  it("marks missing values as unavailable instead of treating them as zero", () => {
    expect(buildDashboardMetricComparison(null, 8)).toEqual({
      currentValue: null,
      previousValue: 8,
      absoluteChange: null,
      percentChange: null,
      direction: "unavailable"
    });
  });
});
