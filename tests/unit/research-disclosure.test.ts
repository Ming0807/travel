import { describe, expect, it } from "vitest";

import { disclosableResearchCount, researchCountLabel, researchRateLabel } from "@/lib/research/disclosure";

describe("research dashboard disclosure", () => {
  it("hides a small cohort rather than presenting zero or its exact size", () => {
    expect(disclosableResearchCount(2, 2, 10)).toBeNull();
    expect(researchCountLabel(2, 2, 10)).toBe("ปกปิด");
    expect(researchRateLabel(2, 2, 10)).toBe("ปกปิด");
  });

  it("hides small outcome cells and complementary cells recoverable from the base", () => {
    expect(disclosableResearchCount(2, 30, 10)).toBeNull();
    expect(disclosableResearchCount(28, 30, 10)).toBeNull();
    expect(researchRateLabel(28, 30, 10)).toBe("ปกปิด");
  });

  it("keeps zero distinct from missing data and allows sufficiently large cells", () => {
    expect(researchCountLabel(0, 30, 10)).toBe("0");
    expect(researchCountLabel(0, 0, 10)).toBe("ยังไม่มีข้อมูล");
    expect(researchCountLabel(20, 30, 10)).toBe("20");
    expect(researchRateLabel(20, 30, 10)).toContain("66.7");
  });
});
