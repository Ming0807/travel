import { describe, expect, it } from "vitest";

import {
  buildDistributionEvidence,
  buildDistributionInterpretation,
} from "@/lib/dashboard/distribution-evidence";

describe("dashboard distribution evidence", () => {
  it.each([
    [{ answeredCount: 0, denominatorCount: 0 }, "unavailable"],
    [{ answeredCount: 8, denominatorCount: 100 }, "insufficient"],
    [{ answeredCount: 20, denominatorCount: 100 }, "limited"],
    [{ answeredCount: 40, denominatorCount: 100 }, "usable"],
    [{ answeredCount: 80, denominatorCount: 100 }, "strong"],
  ] as const)("grades %o deterministically", (input, expected) => {
    expect(buildDistributionEvidence(input).strength).toBe(expected);
  });

  it("reports the answered denominator, coverage, missing count, and missing rate", () => {
    expect(buildDistributionEvidence({ answeredCount: 75, denominatorCount: 100 })).toEqual({
      answeredCount: 75,
      denominatorCount: 100,
      coverage: 0.75,
      missingCount: 25,
      missingRate: 0.25,
      strength: "strong",
    });
  });

  it("does not produce a planning conclusion from a weak sample", () => {
    expect(buildDistributionInterpretation(
      [{ label: "รถยนต์ส่วนตัว", value: 8, percent: 0.8 }],
      { answeredCount: 8, denominatorCount: 100 },
    )).toMatch(/ยังไม่ควรใช้สรุป/);
  });

  it("describes the leading category as a share of answered records", () => {
    expect(buildDistributionInterpretation(
      [
        { label: "รถยนต์ส่วนตัว", value: 60, percent: 0.6 },
        { label: "รถโดยสาร", value: 40, percent: 0.4 },
      ],
      { answeredCount: 100, denominatorCount: 120 },
    )).toContain("รถยนต์ส่วนตัวมีสัดส่วนสูงสุด 60.0% ของคำตอบที่ระบุ");
  });
});
