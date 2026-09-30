import { describe, expect, it } from "vitest";
import { assertCheckinRewardEligible, isDemoCheckinLabel } from "@/lib/checkin/reward-eligibility";

describe("check-in reward eligibility", () => {
  it.each(["Demo QR: trial", " demo qr: trial "])("recognizes reserved demo label %s", (label) => {
    expect(isDemoCheckinLabel(label)).toBe(true);
    expect(() => assertCheckinRewardEligible({ checkin_codes: { label } }))
      .toThrow(/ไม่สามารถออกใบประกาศ/);
    expect(() => assertCheckinRewardEligible({ checkin_codes: [{ label }] }))
      .toThrow(/ไม่สามารถออกใบประกาศ/);
  });

  it.each([null, {}, { checkin_codes: { label: "จุดชมวิว" } }])("preserves genuine and historical non-demo visits %#", (visit) => {
    expect(() => assertCheckinRewardEligible(visit)).not.toThrow();
  });
});
