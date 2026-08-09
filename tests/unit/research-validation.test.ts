import { describe, expect, it } from "vitest";

import {
  researchAcceptanceSchema,
  researchCheckinCodeSchema,
  researchInvitationSchema,
  researchOperatorAcceptanceSchema,
  researchOperatorAttemptSchema,
  researchStudyCodeSchema,
  researchResponseInputSchema,
  researchVisitLinkSchema,
  researchWithdrawalSchema,
  redactResearchFreeText,
} from "@/lib/validation/research";

describe("research validation", () => {
  it("accepts only URL-safe study and check-in identifiers", () => {
    expect(researchStudyCodeSchema.safeParse("field-tour-2026").success).toBe(true);
    expect(researchCheckinCodeSchema.safeParse("YALA_01").success).toBe(true);
    expect(researchStudyCodeSchema.safeParse("Field Tour").success).toBe(false);
    expect(researchCheckinCodeSchema.safeParse("a".repeat(101)).success).toBe(false);
  });

  it("keeps invitation language optional and controlled", () => {
    expect(
      researchInvitationSchema.safeParse({
        studyCode: "field-tour-2026",
        checkinCode: "YALA_01",
      }).success,
    ).toBe(true);
    expect(
      researchInvitationSchema.safeParse({
        studyCode: "field-tour-2026",
        checkinCode: "YALA_01",
        language: "ja",
      }).success,
    ).toBe(false);
  });

  it("requires an affirmative consent value and validates bounded link/withdrawal input", () => {
    expect(
      researchAcceptanceSchema.safeParse({
        studyCode: "field-tour-2026",
        checkinCode: "YALA_01",
        hasConsented: true,
      }).success,
    ).toBe(true);
    expect(
      researchAcceptanceSchema.safeParse({
        studyCode: "field-tour-2026",
        checkinCode: "YALA_01",
        hasConsented: false,
      }).success,
    ).toBe(false);
    expect(researchVisitLinkSchema.safeParse({ visitId: "not-a-uuid" }).success).toBe(false);
    expect(
      researchWithdrawalSchema.safeParse({
        reason: "  ขอถอนความยินยอม  ",
        source: "withdrawal_page",
      }).success,
    ).toBe(true);
  });

  it("accepts one typed value per answer and rejects duplicate item codes", () => {
    expect(researchResponseInputSchema.safeParse({
      instrumentKey: "tourist_evaluation",
      submit: true,
      answers: [
        { itemCode: "SQ_01", integerValue: 5 },
        { itemCode: "COMMENT", textValue: "ใช้งานง่าย" },
      ],
    }).success).toBe(true);
    expect(researchResponseInputSchema.safeParse({
      instrumentKey: "tourist_evaluation",
      submit: false,
      answers: [
        { itemCode: "SQ_01", integerValue: 5 },
        { itemCode: "SQ_01", integerValue: 4 },
      ],
    }).success).toBe(false);
    expect(researchResponseInputSchema.safeParse({
      instrumentKey: "tourist_evaluation",
      submit: false,
      answers: [{ itemCode: "SQ_01", integerValue: 5, textValue: "five" }],
    }).success).toBe(false);
  });

  it("requires explicit stakeholder consent and evidence for completed decision tasks", () => {
    expect(researchOperatorAcceptanceSchema.safeParse({
      studyId: "11111111-1111-4111-8111-111111111111",
      studyCode: "field-tour-2026",
      idempotencyKey: "22222222-2222-4222-8222-222222222222",
      participantType: "operator",
      collectionMode: "field_observation",
      language: "th",
      hasConsented: true,
    }).success).toBe(true);
    expect(researchOperatorAcceptanceSchema.safeParse({
      studyId: "11111111-1111-4111-8111-111111111111",
      studyCode: "field-tour-2026",
      idempotencyKey: "22222222-2222-4222-8222-222222222222",
      participantType: "operator",
      collectionMode: "field_observation",
      hasConsented: false,
    }).success).toBe(false);
    expect(researchOperatorAttemptSchema.safeParse({
      taskCode: "segment_choice",
      status: "completed",
      confidence: 4,
      rationale: "เลือกจากแนวโน้มผู้เข้าชม",
    }).success).toBe(true);
    expect(researchOperatorAttemptSchema.safeParse({
      taskCode: "segment_choice",
      status: "completed",
      confidence: null,
      rationale: "",
    }).success).toBe(false);
    expect(researchOperatorAttemptSchema.safeParse({
      taskCode: "segment_choice",
      status: "skipped",
    }).success).toBe(true);
  });

  it("redacts direct contact details from optional research text", () => {
    expect(redactResearchFreeText("ติดต่อ test@example.com โทร 081-234-5678 https://example.com"))
      .toBe("ติดต่อ [ข้อมูลติดต่อถูกปกปิด] โทร [ข้อมูลติดต่อถูกปกปิด] [ข้อมูลติดต่อถูกปกปิด]");
  });
});
