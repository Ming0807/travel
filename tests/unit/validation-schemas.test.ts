import { describe, expect, it } from "vitest";
import { minimalProfileFormSchema } from "@/lib/validation/tourist-profile";
import { resolveCheckinCodeSchema } from "@/lib/validation/checkin";
import { postCertificateSurveySchema } from "@/lib/validation/survey";
import { passportVisitIdSchema } from "@/lib/validation/passport";
import { uuidSchema, localeSchema, checkinCodeSchema, displayNameSchema } from "@/lib/validation/common";

// =========================================
// Common Schemas
// =========================================
describe("common validation schemas", () => {
  describe("uuidSchema", () => {
    it("accepts a valid UUID", () => {
      expect(uuidSchema.parse("550e8400-e29b-41d4-a716-446655440000")).toBe("550e8400-e29b-41d4-a716-446655440000");
    });

    it("rejects invalid UUID", () => {
      expect(() => uuidSchema.parse("not-a-uuid")).toThrow();
    });

    it("rejects empty string as UUID", () => {
      expect(() => uuidSchema.parse("")).toThrow();
    });
  });

  describe("localeSchema", () => {
    it("defaults to th", () => {
      expect(localeSchema.parse(undefined)).toBe("th");
    });

    it("accepts th", () => {
      expect(localeSchema.parse("th")).toBe("th");
    });

    it("accepts en", () => {
      expect(localeSchema.parse("en")).toBe("en");
    });

    it("rejects invalid locale", () => {
      expect(() => localeSchema.parse("fr")).toThrow();
    });
  });

  describe("checkinCodeSchema", () => {
    it("accepts valid URL-safe code", () => {
      expect(checkinCodeSchema.parse("yala-beach-2026")).toBe("yala-beach-2026");
    });

    it("accepts alphanumeric with underscore", () => {
      expect(checkinCodeSchema.parse("test_code_01")).toBe("test_code_01");
    });

    it("rejects code with spaces", () => {
      expect(() => checkinCodeSchema.parse("invalid code")).toThrow();
    });

    it("rejects code with special characters", () => {
      expect(() => checkinCodeSchema.parse("code@#$")).toThrow();
    });

    it("trims whitespace", () => {
      expect(checkinCodeSchema.parse("  my-code  ")).toBe("my-code");
    });

    it("rejects code shorter than 3 chars", () => {
      expect(() => checkinCodeSchema.parse("ab")).toThrow();
    });

    it("rejects code longer than 64 chars", () => {
      expect(() => checkinCodeSchema.parse("a".repeat(65))).toThrow();
    });
  });

  describe("displayNameSchema", () => {
    it("accepts valid name", () => {
      expect(displayNameSchema.parse("สมชาย")).toBe("สมชาย");
    });

    it("trims whitespace from name", () => {
      expect(displayNameSchema.parse("  John  ")).toBe("John");
    });

    it("rejects empty name", () => {
      expect(() => displayNameSchema.parse("")).toThrow();
    });

    it("rejects overly long name", () => {
      expect(() => displayNameSchema.parse("a".repeat(151))).toThrow();
    });
  });
});

// =========================================
// Tourist Profile Schema
// =========================================
describe("tourist profile validation", () => {
  it("accepts minimal valid profile with country", () => {
    const result = minimalProfileFormSchema.parse({
      displayName: "สมชาย",
      ageGroup: "25_34",
      originCountryId: 1,
      hasConsented: true,
    });
    expect(result.displayName).toBe("สมชาย");
    expect(result.ageGroup).toBe("25_34");
  });

  it("accepts profile with province instead of country", () => {
    const result = minimalProfileFormSchema.parse({
      displayName: "สมหญิง",
      ageGroup: "35_44",
      originProvinceId: 10,
      hasConsented: true,
    });
    expect(result.originProvinceId).toBe(10);
  });

  it("accepts profile with both country and province", () => {
    const result = minimalProfileFormSchema.parse({
      displayName: "John",
      ageGroup: "18_24",
      originCountryId: 2,
      originProvinceId: 5,
      hasConsented: true,
    });
    expect(result.originCountryId).toBe(2);
    expect(result.originProvinceId).toBe(5);
  });

  it("rejects empty display name", () => {
    expect(() =>
      minimalProfileFormSchema.parse({
        displayName: "",
        ageGroup: "25_34",
        originCountryId: 1,
        hasConsented: true,
      })
    ).toThrow();
  });

  it("rejects missing consent", () => {
    expect(() =>
      minimalProfileFormSchema.parse({
        displayName: "สมชาย",
        ageGroup: "25_34",
        originCountryId: 1,
        hasConsented: false,
      })
    ).toThrow();
  });

  it("rejects missing both country and province", () => {
    expect(() =>
      minimalProfileFormSchema.parse({
        displayName: "สมชาย",
        ageGroup: "25_34",
        hasConsented: true,
      })
    ).toThrow();
  });

  it("accepts 'prefer not to answer' age group", () => {
    const result = minimalProfileFormSchema.parse({
      displayName: "สมชาย",
      ageGroup: "prefer_not_to_answer",
      originCountryId: 1,
      hasConsented: true,
    });
    expect(result.ageGroup).toBe("prefer_not_to_answer");
  });

  it("rejects invalid age group value", () => {
    expect(() =>
      minimalProfileFormSchema.parse({
        displayName: "สมชาย",
        ageGroup: "invalid_age",
        originCountryId: 1,
        hasConsented: true,
      })
    ).toThrow();
  });
});

// =========================================
// Check-in Schema
// =========================================
describe("check-in code resolution validation", () => {
  it("accepts valid check-in code", () => {
    const result = resolveCheckinCodeSchema.parse({ code: "abc123" });
    expect(result.code).toBe("abc123");
  });

  it("rejects empty code", () => {
    expect(() => resolveCheckinCodeSchema.parse({ code: "" })).toThrow();
  });

  it("rejects code that is too long", () => {
    expect(() => resolveCheckinCodeSchema.parse({ code: "x".repeat(101) })).toThrow();
  });
});

// =========================================
// Survey Schema
// =========================================
describe("survey validation", () => {
  const validVisitId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts a complete valid survey", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      travelCompanionId: 1,
      groupSize: 2,
      transportModeId: 3,
      travelPurposeId: 5,
      overnightStatus: "same_day",
      spendingRangeId: 2,
      expenseCategoryId: 4,
      overallSatisfaction: 4,
      safetyScore: 5,
      cleanlinessScore: 3,
      accessibilityScore: 4,
      informationScore: 3,
      valueScore: 4,
      revisitIntention: "yes",
      recommendIntention: "yes",
      optionalComment: "",
    });
    expect(result.visitId).toBe(validVisitId);
    expect(result.overallSatisfaction).toBe(4);
    expect(result.safetyScore).toBe(5);
  });

  it("accepts survey with only satisfaction scores (minimal)", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overallSatisfaction: 5,
    });
    expect(result.overallSatisfaction).toBe(5);
  });

  it("accepts survey with only travel companion", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      travelCompanionId: 2,
    });
    expect(result.travelCompanionId).toBe(2);
  });

  it("accepts survey with only comment", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      optionalComment: "Great place!",
    });
    expect(result.optionalComment).toBe("Great place!");
  });

  it("rejects empty survey (no fields filled)", () => {
    expect(() =>
      postCertificateSurveySchema.parse({
        visitId: validVisitId,
      })
    ).toThrow("กรุณาตอบอย่างน้อยหนึ่งข้อ");
  });

  it("rejects survey with invalid satisfaction score (0)", () => {
    expect(() =>
      postCertificateSurveySchema.parse({
        visitId: validVisitId,
        overallSatisfaction: 0,
      })
    ).toThrow();
  });

  it("rejects survey with invalid satisfaction score (6)", () => {
    expect(() =>
      postCertificateSurveySchema.parse({
        visitId: validVisitId,
        overallSatisfaction: 6,
      })
    ).toThrow();
  });

  it("rejects survey with too long comment", () => {
    expect(() =>
      postCertificateSurveySchema.parse({
        visitId: validVisitId,
        optionalComment: "x".repeat(1001),
      })
    ).toThrow();
  });

  it("sets nightsCount to 0 when overnightStatus is same_day", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overnightStatus: "same_day",
      nightsCount: 3,
    });
    // Transform: same_day overrides nightsCount to 0
    expect(result.nightsCount).toBe(0);
  });

  it("accepts overnight with valid nightsCount", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overnightStatus: "overnight",
      nightsCount: 2,
    });
    expect(result.nightsCount).toBe(2);
  });

  it("rejects negative group size", () => {
    expect(() =>
      postCertificateSurveySchema.parse({
        visitId: validVisitId,
        groupSize: -1,
      })
    ).toThrow();
  });

  it("accepts all optional intention values", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      revisitIntention: "maybe",
      recommendIntention: "no",
    });
    expect(result.revisitIntention).toBe("maybe");
    expect(result.recommendIntention).toBe("no");
  });

  it("accepts overnight status 'unknown'", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overnightStatus: "unknown",
    });
    expect(result.overnightStatus).toBe("unknown");
  });
});

// =========================================
// Passport Schema
// =========================================
describe("passport validation", () => {
  it("accepts a valid UUID visit ID", () => {
    expect(passportVisitIdSchema.parse("550e8400-e29b-41d4-a716-446655440000")).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects invalid visit ID", () => {
    expect(() => passportVisitIdSchema.parse("not-a-valid-id")).toThrow();
  });
});
