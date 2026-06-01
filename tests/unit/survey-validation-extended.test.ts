import { describe, expect, it } from "vitest";
import { postCertificateSurveySchema, overnightStatusSchema } from "@/lib/validation/survey";

// =========================================
// overnightStatusSchema Tests
// =========================================
describe("overnightStatusSchema", () => {
  it("accepts same_day", () => {
    expect(overnightStatusSchema.parse("same_day")).toBe("same_day");
  });

  it("accepts overnight", () => {
    expect(overnightStatusSchema.parse("overnight")).toBe("overnight");
  });

  it("accepts unknown", () => {
    expect(overnightStatusSchema.parse("unknown")).toBe("unknown");
  });

  it("rejects invalid status", () => {
    expect(() => overnightStatusSchema.parse("yes")).toThrow();
    expect(() => overnightStatusSchema.parse("no")).toThrow();
    expect(() => overnightStatusSchema.parse("")).toThrow();
  });

  it("accepts null", () => {
    expect(overnightStatusSchema.parse(null)).toBeNull();
  });
});

// =========================================
// postCertificateSurveySchema Tests
// =========================================
describe("postCertificateSurveySchema", () => {
  const validVisitId = "550e8400-e29b-41d4-a716-446655440000";

  // ── Empty payload (all fields optional) ──

  it("rejects completely empty payload (no optional fields filled)", () => {
    const result = postCertificateSurveySchema.safeParse({
      visitId: validVisitId,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const visitIdIssue = result.error.issues.find(
        (i) => i.path.includes("visitId"),
      );
      expect(visitIdIssue).toBeDefined();
    }
  });

  it("rejects empty strings and null for all optional fields", () => {
    const result = postCertificateSurveySchema.safeParse({
      visitId: validVisitId,
      travelCompanionId: "",
      groupSize: "",
      transportModeId: "",
      travelPurposeId: "",
      overnightStatus: "",
      nightsCount: "",
      spendingRangeId: "",
      expenseCategoryId: "",
      overallSatisfaction: "",
      safetyScore: "",
      cleanlinessScore: "",
      accessibilityScore: "",
      informationScore: "",
      valueScore: "",
      revisitIntention: "",
      recommendIntention: "",
      optionalComment: "",
    });
    expect(result.success).toBe(false);
  });

  // ── Valid payloads with single field ──

  it("accepts single optional field: travelCompanionId", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      travelCompanionId: 3,
    });
    expect(result.travelCompanionId).toBe(3);
  });

  it("accepts single optional field: overallSatisfaction", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overallSatisfaction: 4,
    });
    expect(result.overallSatisfaction).toBe(4);
  });

  it("accepts single optional field: optionalComment", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      optionalComment: "ชอบมาก",
    });
    expect(result.optionalComment).toBe("ชอบมาก");
  });

  it("accepts single optional field: recommendIntention", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      recommendIntention: "yes",
    });
    expect(result.recommendIntention).toBe("yes");
  });

  // ── Full valid payload ──

  it("accepts a full valid payload with all fields", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      travelCompanionId: 2,
      groupSize: 4,
      transportModeId: 1,
      travelPurposeId: 3,
      overnightStatus: "overnight",
      nightsCount: 2,
      spendingRangeId: 1,
      expenseCategoryId: 2,
      overallSatisfaction: 5,
      safetyScore: 4,
      cleanlinessScore: 5,
      accessibilityScore: 3,
      informationScore: 4,
      valueScore: 5,
      revisitIntention: "yes",
      recommendIntention: "yes",
      optionalComment: "สถานที่สวยงามมาก",
    });
    expect(result.visitId).toBe(validVisitId);
    expect(result.travelCompanionId).toBe(2);
    expect(result.groupSize).toBe(4);
    expect(result.overallSatisfaction).toBe(5);
    expect(result.nightsCount).toBe(2);
  });

  // ── Visit ID validation ──

  it("rejects invalid visitId (not a UUID)", () => {
    const result = postCertificateSurveySchema.safeParse({
      visitId: "not-a-uuid",
      travelCompanionId: 1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("visitId");
    }
  });

  it("rejects empty visitId", () => {
    const result = postCertificateSurveySchema.safeParse({
      visitId: "",
      overallSatisfaction: 3,
    });
    expect(result.success).toBe(false);
  });

  // ── Score validation (1-5) ──

  it("rejects satisfaction score of 0 (below minimum 1)", () => {
    const result = postCertificateSurveySchema.safeParse({
      visitId: validVisitId,
      overallSatisfaction: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects satisfaction score of 6 (above maximum 5)", () => {
    const result = postCertificateSurveySchema.safeParse({
      visitId: validVisitId,
      overallSatisfaction: 6,
    });
    expect(result.success).toBe(false);
  });

  it("accepts satisfaction score of 1 (minimum)", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overallSatisfaction: 1,
    });
    expect(result.overallSatisfaction).toBe(1);
  });

  it("accepts satisfaction score of 5 (maximum)", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overallSatisfaction: 5,
    });
    expect(result.overallSatisfaction).toBe(5);
  });

  it("rejects non-integer score", () => {
    const result = postCertificateSurveySchema.safeParse({
      visitId: validVisitId,
      overallSatisfaction: 3.5,
    });
    expect(result.success).toBe(false);
  });

  it("applies validation to all score fields uniformly", () => {
    // safetyScore with invalid value
    const scoresResult = postCertificateSurveySchema.safeParse({
      visitId: validVisitId,
      safetyScore: 7,
    });
    expect(scoresResult.success).toBe(false);

    // cleanlinessScore with invalid value
    const cleanResult = postCertificateSurveySchema.safeParse({
      visitId: validVisitId,
      cleanlinessScore: 0,
    });
    expect(cleanResult.success).toBe(false);
  });

  // ── Intention validation ──

  it("accepts all valid intention values", () => {
    const intentions = ["yes", "maybe", "no"] as const;
    for (const intention of intentions) {
      const result = postCertificateSurveySchema.parse({
        visitId: validVisitId,
        revisitIntention: intention,
      });
      expect(result.revisitIntention).toBe(intention);
    }
  });

  it("rejects invalid intention value", () => {
    const result = postCertificateSurveySchema.safeParse({
      visitId: validVisitId,
      revisitIntention: "absolutely",
    });
    expect(result.success).toBe(false);
  });

  // ── Group size and nights validation ──

  it("rejects zero group size", () => {
    const result = postCertificateSurveySchema.safeParse({
      visitId: validVisitId,
      groupSize: 0,
    });
    expect(result.success).toBe(false);
  });

  it("accepts group size of 1", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      groupSize: 1,
    });
    expect(result.groupSize).toBe(1);
  });

  it("rejects negative nights count", () => {
    const result = postCertificateSurveySchema.safeParse({
      visitId: validVisitId,
      nightsCount: -1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts 0 nights (same day trip)", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      nightsCount: 0,
    });
    expect(result.nightsCount).toBe(0);
  });

  // ── Transform: same_day overnight sets nights to 0 ──

  it("transforms nightsCount to 0 when overnightStatus is same_day", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overnightStatus: "same_day",
      nightsCount: 5, // should be overridden by transform
    });
    expect(result.nightsCount).toBe(0);
  });

  it("preserves nightsCount when overnightStatus is overnight", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overnightStatus: "overnight",
      nightsCount: 3,
    });
    expect(result.nightsCount).toBe(3);
  });

  it("preserves nightsCount when overnightStatus is unknown", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overnightStatus: "unknown",
      nightsCount: null,
    });
    expect(result.nightsCount).toBeNull();
  });

  // ── Comment length ──

  it("rejects optionalComment exceeding 1000 chars", () => {
    const result = postCertificateSurveySchema.safeParse({
      visitId: validVisitId,
      optionalComment: "ก".repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts optionalComment at exactly 1000 chars", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      optionalComment: "ก".repeat(1000),
    });
    expect(result.optionalComment).toBe("ก".repeat(1000));
  });

  it("trims whitespace from optionalComment", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      optionalComment: "  ดีมาก  ",
    });
    expect(result.optionalComment).toBe("ดีมาก");
  });

  it("converts empty optionalComment to null", () => {
    // Must also fill at least one other optional field to satisfy the refine
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overallSatisfaction: 4,
      optionalComment: "",
    });
    expect(result.optionalComment).toBeNull();
  });

  // ── String coercion from form ──

  it("coerces string numbers from form fields", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overallSatisfaction: "4",
      groupSize: "2",
      travelCompanionId: "1",
    });
    expect(result.overallSatisfaction).toBe(4);
    expect(result.groupSize).toBe(2);
    expect(result.travelCompanionId).toBe(1);
  });

  it("treats empty string fields as null", () => {
    // Must also fill at least one other optional field to satisfy the refine
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      transportModeId: 1,
      overallSatisfaction: "",
      groupSize: "",
      travelCompanionId: "",
      overnightStatus: "",
      revisitIntention: "",
      recommendIntention: "",
      optionalComment: "",
    });
    expect(result.transportModeId).toBe(1);
    expect(result.overallSatisfaction).toBeNull();
    expect(result.groupSize).toBeNull();
    expect(result.travelCompanionId).toBeNull();
    expect(result.overnightStatus).toBeNull();
    expect(result.revisitIntention).toBeNull();
    expect(result.recommendIntention).toBeNull();
    expect(result.optionalComment).toBeNull();
  });

  // ── Intentions optional fields ──

  it("accepts null for all intention fields", () => {
    // Must also fill at least one other optional field to satisfy the refine
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      travelCompanionId: 1,
      revisitIntention: null,
      recommendIntention: null,
    });
    expect(result.revisitIntention).toBeNull();
    expect(result.recommendIntention).toBeNull();
  });

  // ── Nights with overnight same_day ──

  it("does not crash when nightsCount is null and overnightStatus is same_day", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overnightStatus: "same_day",
      nightsCount: null,
    });
    expect(result.nightsCount).toBe(0);
  });

  it("does not crash when both overnightStatus and nightsCount are null", () => {
    // This fails because with only overnight and nights, nothing else is filled
    // The refine forces at least one optional field
    const result = postCertificateSurveySchema.safeParse({
      visitId: validVisitId,
      overnightStatus: null,
      nightsCount: null,
    });
    // But wait — we need at least 1 optional field. Let's add travelCompanionId
    const result2 = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      travelCompanionId: 1,
      overnightStatus: null,
      nightsCount: null,
    });
    expect(result2.overnightStatus).toBeNull();
    expect(result2.nightsCount).toBeNull();
  });
});
