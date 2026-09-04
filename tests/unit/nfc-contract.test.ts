import { describe, expect, it } from "vitest";
import { buildNfcPayload, isNfcAssignmentCurrent, nfcTokenSchema } from "@/lib/nfc/contract";

const token = "10000000-0000-4000-8000-000000000001";
const assignment = { checkinCodeId: 5, code: "yala-001", attractionId: 4, photoSpotId: null, campaignId: 7 };

describe("NFC payload and immutable assignment contract", () => {
  it("builds only the canonical same-origin HTTPS URL", () => {
    expect(buildNfcPayload("https://tourism.example/", assignment.code, token))
      .toBe(`https://tourism.example/c/yala-001?nfc=${token}`);
  });

  it.each([
    "http://tourism.example", "javascript:alert(1)", "//evil.example",
    "https://staff:password@tourism.example", "https://tourism.example/other",
    "https://tourism.example?next=https://evil.example", "https://tourism.example/#fragment",
  ])("rejects unsafe or non-origin base %s", (origin) => {
    expect(() => buildNfcPayload(origin, assignment.code, token)).toThrow();
  });

  it.each(["../admin", "test?next=evil", "test#fragment", "a/b", "a\\b", "", "a".repeat(101)])(
    "rejects unsafe check-in code %s", (code) => {
      expect(() => buildNfcPayload("https://tourism.example", code, token)).toThrow();
    },
  );

  it("rejects malformed tokens without coercing them", () => {
    expect(nfcTokenSchema.safeParse("not-a-tag").success).toBe(false);
    expect(nfcTokenSchema.safeParse([token]).success).toBe(false);
    expect(() => buildNfcPayload("https://tourism.example", assignment.code, "invalid")).toThrow();
  });

  it("matches every part of the assignment, including nullable photo spot and campaign", () => {
    expect(isNfcAssignmentCurrent(assignment, { ...assignment })).toBe(true);
    for (const changed of [
      { checkinCodeId: 9 }, { code: "renamed" }, { attractionId: 6 },
      { photoSpotId: 3 }, { campaignId: null },
    ]) {
      expect(isNfcAssignmentCurrent(assignment, { ...assignment, ...changed })).toBe(false);
    }
  });
});
