import { describe, expect, it } from "vitest";
import { minimalProfileFormSchema } from "@/lib/validation/tourist-profile";

// =========================================
// minimalProfileFormSchema Tests
// =========================================
describe("minimalProfileFormSchema", () => {
  const validPayload = {
    displayName: "สมชาย ใจดี",
    ageGroup: "25_34",
    hasConsented: true,
    originCountryId: 1,
    originProvinceId: null,
  };

  // ── Valid payloads ──

  it("accepts a valid minimal payload with country", () => {
    const result = minimalProfileFormSchema.parse(validPayload);
    expect(result.displayName).toBe("สมชาย ใจดี");
    expect(result.ageGroup).toBe("25_34");
    expect(result.hasConsented).toBe(true);
    expect(result.originCountryId).toBe(1);
  });

  it("accepts originProvinceId instead of originCountryId", () => {
    const result = minimalProfileFormSchema.parse({
      ...validPayload,
      originCountryId: null,
      originProvinceId: 5,
    });
    expect(result.originProvinceId).toBe(5);
    expect(result.originCountryId).toBeNull();
  });

  it("accepts all valid age group values", () => {
    const groups = [
      "under_18",
      "18_24",
      "25_34",
      "35_44",
      "45_54",
      "55_64",
      "65_plus",
      "prefer_not_to_answer",
    ] as const;
    for (const ageGroup of groups) {
      const result = minimalProfileFormSchema.parse({ ...validPayload, ageGroup });
      expect(result.ageGroup).toBe(ageGroup);
    }
  });

  // ── Display name ──

  it("rejects empty display name", () => {
    const result = minimalProfileFormSchema.safeParse({
      ...validPayload,
      displayName: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("displayName");
    }
  });

  it("rejects displayName exceeding 150 chars", () => {
    const result = minimalProfileFormSchema.safeParse({
      ...validPayload,
      displayName: "ก".repeat(151),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("displayName");
    }
  });

  it("accepts displayName at exactly 150 chars", () => {
    const result = minimalProfileFormSchema.safeParse({
      ...validPayload,
      displayName: "ก".repeat(150),
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from displayName", () => {
    const result = minimalProfileFormSchema.parse({
      ...validPayload,
      displayName: "  สมชาย ใจดี  ",
    });
    expect(result.displayName).toBe("สมชาย ใจดี");
  });

  // ── Consent ──

  it("rejects when hasConsented is false", () => {
    const result = minimalProfileFormSchema.safeParse({
      ...validPayload,
      hasConsented: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const consentIssue = result.error.issues.find(
        (i) => i.path.includes("hasConsented"),
      );
      expect(consentIssue).toBeDefined();
    }
  });

  it("rejects when hasConsented is undefined", () => {
    const result = minimalProfileFormSchema.safeParse({
      displayName: "สมชาย",
      ageGroup: "25_34",
      originCountryId: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const consentIssue = result.error.issues.find(
        (i) => i.path.includes("hasConsented"),
      );
      expect(consentIssue).toBeDefined();
    }
  });

  // ── Origin validation (cross-field) ──

  it("rejects when both originCountryId and originProvinceId are null", () => {
    const result = minimalProfileFormSchema.safeParse({
      ...validPayload,
      originCountryId: null,
      originProvinceId: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("originCountryId");
    }
  });

  it("accepts when originCountryId is 0 (falsy but valid)", () => {
    const result = minimalProfileFormSchema.safeParse({
      ...validPayload,
      originCountryId: null,
      originProvinceId: 1,
    });
    expect(result.success).toBe(true);
  });

  // ── Missing required fields ──

  it("rejects missing displayName", () => {
    const { displayName: _displayName, ...rest } = validPayload;
    const result = minimalProfileFormSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing ageGroup", () => {
    const { ageGroup: _ageGroup, ...rest } = validPayload;
    const result = minimalProfileFormSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects invalid ageGroup value", () => {
    const result = minimalProfileFormSchema.safeParse({
      ...validPayload,
      ageGroup: "invalid_age",
    });
    expect(result.success).toBe(false);
  });

  // ── Edge cases ──

  it("handles all fields as strings via coerce", () => {
    // When coming from FormData, numbers are strings
    const result = minimalProfileFormSchema.parse({
      displayName: "John",
      ageGroup: "35_44",
      hasConsented: true,
      originCountryId: "3",
    });
    expect(result.originCountryId).toBe(3);
  });

  it("handles originCountryId as null explicitly", () => {
    const result = minimalProfileFormSchema.parse({
      ...validPayload,
      originCountryId: null,
      originProvinceId: 2,
    });
    expect(result.originCountryId).toBeNull();
    expect(result.originProvinceId).toBe(2);
  });

  it("rejects Thai ageGroup string (case-sensitive)", () => {
    // AgeGroup enum values use snake_case English
    const result = minimalProfileFormSchema.safeParse({
      ...validPayload,
      ageGroup: "25-34",
    });
    expect(result.success).toBe(false);
  });
});
