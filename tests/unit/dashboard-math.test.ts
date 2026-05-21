import { describe, expect, it } from "vitest";
import {
  averageNullable,
  buildFunnelStages,
  formatEstimatedSpending,
  safeRate
} from "@/lib/services/dashboard-math";

describe("dashboard metric helpers", () => {
  it("returns null for zero denominator rates", () => {
    expect(safeRate(0, 0)).toBeNull();
    expect(safeRate(3, 0)).toBeNull();
    expect(safeRate(3, 6)).toBe(0.5);
  });

  it("excludes missing satisfaction values from averages", () => {
    expect(averageNullable([5, null, undefined, 3])).toBe(4);
    expect(averageNullable([null, undefined])).toBeNull();
  });

  it("builds funnel conversions without treating empty previous stages as zero percent", () => {
    const stages = buildFunnelStages(new Map([["qr_scanned", 10], ["landing_viewed", 5]]));
    expect(stages[0].conversionFromPrevious).toBeNull();
    expect(stages[1].conversionFromPrevious).toBe(0.5);
    expect(stages[2].conversionFromPrevious).toBe(0);
    expect(stages[3].conversionFromPrevious).toBeNull();
  });

  it("labels spending as estimated and handles open-ended ranges", () => {
    expect(formatEstimatedSpending(500, 1500, false)).toContain("Estimated");
    expect(formatEstimatedSpending(5000, null, true)).toContain("+");
    expect(formatEstimatedSpending(null, null, false)).toBe("No data");
  });
});
