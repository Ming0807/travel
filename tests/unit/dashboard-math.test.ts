import { describe, expect, it } from "vitest";
import {
  averageNullable,
  buildDistribution,
  buildFunnelStages,
  formatCount,
  formatEstimatedSpending,
  formatPercentage,
  formatRating,
  percentage,
  safeRate
} from "@/lib/services/dashboard-math";

describe("safeRate", () => {
  it("returns null for zero denominator", () => {
    expect(safeRate(0, 0)).toBeNull();
    expect(safeRate(3, 0)).toBeNull();
  });

  it("returns null for negative denominator", () => {
    expect(safeRate(3, -1)).toBeNull();
  });

  it("returns zero for zero numerator", () => {
    expect(safeRate(0, 10)).toBe(0);
  });

  it("computes correct rate", () => {
    expect(safeRate(3, 6)).toBe(0.5);
    expect(safeRate(1, 3)).toBeCloseTo(0.333, 2);
  });

  it("handles numerator larger than denominator", () => {
    expect(safeRate(10, 5)).toBe(2);
  });
});

describe("averageNullable", () => {
  it("excludes null and undefined values", () => {
    expect(averageNullable([5, null, undefined, 3])).toBe(4);
  });

  it("returns null for all-null array", () => {
    expect(averageNullable([null, undefined])).toBeNull();
  });

  it("returns null for empty array", () => {
    expect(averageNullable([])).toBeNull();
  });

  it("returns the value for a single-element array", () => {
    expect(averageNullable([7])).toBe(7);
  });

  it("handles all-zero values", () => {
    expect(averageNullable([0, 0, 0])).toBe(0);
  });

  it("filters out NaN and Infinity", () => {
    expect(averageNullable([1, NaN, 2, Infinity, 3])).toBe(2);
  });
});

describe("percentage", () => {
  it("returns null for zero total", () => {
    expect(percentage(5, 0)).toBeNull();
  });

  it("computes correct percentage ratio", () => {
    expect(percentage(5, 10)).toBe(0.5);
  });

  it("handles zero part", () => {
    expect(percentage(0, 10)).toBe(0);
  });

  it("handles part larger than total", () => {
    expect(percentage(10, 5)).toBe(2);
  });
});

describe("format helpers", () => {
  it("formatCount returns No data for null", () => {
    expect(formatCount(null)).toBe("No data");
  });

  it("formatCount formats numbers with Thai locale", () => {
    expect(formatCount(1000)).toBe("1,000");
    expect(formatCount(0)).toBe("0");
  });

  it("formatRating returns No data for null", () => {
    expect(formatRating(null)).toBe("No data");
  });

  it("formatRating formats with /5 suffix", () => {
    expect(formatRating(4.2)).toBe("4.2 / 5");
    expect(formatRating(0)).toBe("0.0 / 5");
  });

  it("formatPercentage returns No data for null", () => {
    expect(formatPercentage(null)).toBe("No data");
  });

  it("formatPercentage formats as percentage with rounding", () => {
    expect(formatPercentage(0.756)).toBe("76%");
    expect(formatPercentage(0)).toBe("0%");
    expect(formatPercentage(1)).toBe("100%");
  });
});

describe("buildDistribution", () => {
  it("handles empty map", () => {
    expect(buildDistribution(new Map())).toEqual([]);
  });

  it("sorts items by value descending", () => {
    const map = new Map([["B", 10], ["A", 20], ["C", 5]]);
    const result = buildDistribution(map);
    expect(result[0].label).toBe("A");
    expect(result[1].label).toBe("B");
    expect(result[2].label).toBe("C");
  });

  it("computes percentages from total", () => {
    const map = new Map([["X", 3], ["Y", 1]]);
    const result = buildDistribution(map);
    expect(result[0].label).toBe("X");
    expect(result[0].percent).toBe(0.75);
    expect(result[1].percent).toBe(0.25);
  });

  it("handles single-entry map", () => {
    const map = new Map([["only", 42]]);
    const result = buildDistribution(map);
    expect(result).toHaveLength(1);
    expect(result[0].percent).toBe(1);
  });

  it("handles map with zero values", () => {
    const map = new Map([["A", 0], ["B", 0]]);
    const result = buildDistribution(map);
    expect(result).toHaveLength(2);
    expect(result[0].percent).toBe(null);
    expect(result[1].percent).toBe(null);
  });
});

describe("buildFunnelStages", () => {
  it("returns all funnel stages with correct ordering", () => {
    const stages = buildFunnelStages(new Map([["qr_scanned", 100], ["landing_viewed", 80]]));
    expect(stages).toHaveLength(9);
    expect(stages[0].key).toBe("qr_scanned");
    expect(stages[0].count).toBe(100);
    expect(stages[0].conversionFromPrevious).toBeNull();
    expect(stages[1].key).toBe("landing_viewed");
    expect(stages[1].count).toBe(80);
    expect(stages[1].conversionFromPrevious).toBe(0.8);
  });

  it("returns zero for missing event types", () => {
    const stages = buildFunnelStages(new Map());
    stages.forEach((stage) => {
      expect(stage.count).toBe(0);
    });
  });

  it("sets conversionFromPrevious to null for first stage", () => {
    const stages = buildFunnelStages(new Map());
    expect(stages[0].conversionFromPrevious).toBeNull();
  });

  it("handles drop-off calculation correctly", () => {
    const stages = buildFunnelStages(new Map([
      ["qr_scanned", 100],
      ["landing_viewed", 60],
      ["certificate_started", 30]
    ]));
    expect(stages[0].dropOffFromPrevious).toBeNull();
    expect(stages[1].dropOffFromPrevious).toBeCloseTo(0.4, 1);
    expect(stages[2].dropOffFromPrevious).toBeCloseTo(0.5, 1);
  });

  it("handles zero-count stages without division errors", () => {
    const stages = buildFunnelStages(new Map([["qr_scanned", 0]]));
    expect(stages[0].count).toBe(0);
    expect(stages[0].conversionFromPrevious).toBeNull();
    expect(stages[0].dropOffFromPrevious).toBeNull();
  });
});

describe("formatEstimatedSpending", () => {
  it("returns No data when both min and max are null", () => {
    expect(formatEstimatedSpending(null, null, false)).toBe("No data");
  });

  it("includes estimated prefix for all results", () => {
    expect(formatEstimatedSpending(500, 1500, false)).toContain("Estimated");
    expect(formatEstimatedSpending(5000, null, true)).toContain("Estimated");
  });

  it("appends plus sign for open-ended ranges", () => {
    expect(formatEstimatedSpending(5000, null, true)).toContain("+");
    expect(formatEstimatedSpending(5000, 7000, true)).toContain("+");
  });

  it("formats range when both min and max are available", () => {
    const result = formatEstimatedSpending(500, 1500, false);
    expect(result).toContain("-");
    expect(result).toContain("฿");
  });

  it("handles zero min value", () => {
    const result = formatEstimatedSpending(0, 1000, false);
    expect(result).toContain("0");
  });

  it("uses THB currency format", () => {
    const result = formatEstimatedSpending(10000, 25000, false);
    expect(result).toContain("฿");
  });
});
