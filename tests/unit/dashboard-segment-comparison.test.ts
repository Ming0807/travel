import { describe, expect, it } from "vitest";

import { buildTwoGroupMeanComparison } from "@/lib/dashboard/segment-comparison";

describe("dashboard segment comparison", () => {
  it("compares only the two largest groups when both meet the minimum sample", () => {
    const entries = [
      ...Array.from({ length: 35 }, () => ({ segment: "25-34", value: 4 })),
      ...Array.from({ length: 32 }, () => ({ segment: "35-44", value: 3 })),
      ...Array.from({ length: 12 }, () => ({ segment: "45-54", value: 5 })),
    ];

    expect(buildTwoGroupMeanComparison(entries)).toMatchObject({
      status: "ready",
      groups: [
        { label: "25-34", sampleSize: 35, mean: 4 },
        { label: "35-44", sampleSize: 32, mean: 3 },
      ],
    });
  });

  it("withholds the comparison when either selected group is below the decision threshold", () => {
    const entries = [
      ...Array.from({ length: 35 }, () => ({ segment: "25-34", value: 4 })),
      ...Array.from({ length: 20 }, () => ({ segment: "35-44", value: 3 })),
    ];

    const result = buildTwoGroupMeanComparison(entries);
    expect(result.status).toBe("insufficient");
    expect(result.groups[1]).toMatchObject({ label: "35-44", sampleSize: 20, mean: null });
  });
});
