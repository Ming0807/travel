import { describe, expect, it } from "vitest";

import {
  adminResearchAnalyticsFiltersSchema,
  adminResearchApprovalSchema,
  adminResearchDeploymentSchema,
  adminResearchExportFiltersSchema,
  adminResearchInstrumentDraftSchema,
  adminResearchItemCreateSchema,
  adminResearchOperatorAttemptSchema,
  adminResearchOperatorAssessmentSchema,
  adminResearchOperatorTaskDraftSchema,
  adminResearchStudyActivationSchema,
  adminResearchStudyDraftCreateSchema,
  adminResearchStudyDraftUpdateSchema,
} from "@/lib/validation/admin-research";
import { assertResearchStudyScope, AdminResearchServiceError } from "@/lib/services/admin-research.service";

const studyId = "11111111-1111-4111-8111-111111111111";
const instrumentId = "22222222-2222-4222-8222-222222222222";
const taskId = "33333333-3333-4333-8333-333333333333";
const sessionId = "44444444-4444-4444-8444-444444444444";

const studyDraft = {
  studyCode: "yala-field-2026",
  titleTh: "การประเมินระบบ",
  titleEn: "System evaluation",
  protocolVersion: "protocol-1",
  consentVersion: "consent-1",
  noticeVersion: "notice-1",
  purposeTh: "วัตถุประสงค์การวิจัย",
  participationTh: "รายละเอียดการเข้าร่วม",
  privacyTh: "รายละเอียดความเป็นส่วนตัว",
  withdrawalTh: "รายละเอียดการถอนตัว",
  contactEmail: "research@example.org",
  scopeCode: "yala-pilot",
  startsAt: "2026-09-01T00:00:00Z",
  endsAt: "2026-09-30T23:59:59Z",
  retentionUntil: "2027-09-30T23:59:59Z",
};

describe("admin research validation", () => {
  it("rejects analytics filters that target a different study workspace", () => {
    expect(() => assertResearchStudyScope(
      "11111111-1111-4111-8111-111111111111",
      "22222222-2222-4222-8222-222222222222",
    )).toThrowError(AdminResearchServiceError);
  });
  it("accepts a complete study draft and normalizes the default draft status", () => {
    const result = adminResearchStudyDraftCreateSchema.safeParse(studyDraft);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("draft");
  });

  it("rejects invalid study dates, contact details, unknown fields, and active draft status", () => {
    expect(
      adminResearchStudyDraftCreateSchema.safeParse({
        ...studyDraft,
        startsAt: "2026-10-01T00:00:00Z",
        endsAt: "2026-09-30T23:59:59Z",
      }).success,
    ).toBe(false);
    expect(
      adminResearchStudyDraftCreateSchema.safeParse({
        ...studyDraft,
        retentionUntil: "2026-09-29T23:59:59Z",
      }).success,
    ).toBe(false);
    expect(
      adminResearchStudyDraftCreateSchema.safeParse({ ...studyDraft, contactEmail: "not-an-email" }).success,
    ).toBe(false);
    expect(
      adminResearchStudyDraftCreateSchema.safeParse({ ...studyDraft, status: "active" }).success,
    ).toBe(false);
    expect(
      adminResearchStudyDraftCreateSchema.safeParse({ ...studyDraft, unexpected: true }).success,
    ).toBe(false);
    expect(
      adminResearchStudyDraftUpdateSchema.safeParse({ studyId, status: "active" }).success,
    ).toBe(false);
  });

  it("accepts draft instrument metadata and rejects publication-only state or out-of-range metadata", () => {
    const result = adminResearchInstrumentDraftSchema.safeParse({
      studyId,
      instrumentKey: "tourist_evaluation",
      versionNumber: 1,
      audience: "tourist",
      titleTh: "แบบประเมิน",
      estimatedMinutes: 4,
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("draft");
    expect(
      adminResearchInstrumentDraftSchema.safeParse({
        studyId,
        instrumentKey: "tourist_evaluation",
        versionNumber: 0,
        audience: "tourist",
        titleTh: "แบบประเมิน",
        status: "published",
      }).success,
    ).toBe(false);
    expect(
      adminResearchInstrumentDraftSchema.safeParse({
        studyId,
        instrumentKey: "Tourist Evaluation",
        versionNumber: 1,
        audience: "tourist",
        titleTh: "แบบประเมิน",
      }).success,
    ).toBe(false);
  });

  it("enforces item answer-type and option invariants while allowing future construct slugs", () => {
    const shared = {
      instrumentId,
      itemCode: "SQ_01",
      constructKey: "future_approved_construct",
      promptTh: "คำถาม",
      displayOrder: 1,
      isRequired: true,
      reverseScore: false,
    };

    for (const answerType of ["agreement_5", "rating_5", "boolean", "integer", "short_text", "long_text"] as const) {
      expect(adminResearchItemCreateSchema.safeParse({ ...shared, answerType }).success).toBe(true);
      expect(
        adminResearchItemCreateSchema.safeParse({
          ...shared,
          answerType,
          options: ["Yes", "No"],
        }).success,
      ).toBe(false);
    }

    expect(
      adminResearchItemCreateSchema.safeParse({
        ...shared,
        answerType: "single_choice",
        options: ["field", "online"],
      }).success,
    ).toBe(true);
    expect(
      adminResearchItemCreateSchema.safeParse({ ...shared, answerType: "single_choice" }).success,
    ).toBe(false);
    expect(
      adminResearchItemCreateSchema.safeParse({
        ...shared,
        answerType: "single_choice",
        options: ["field", "field"],
      }).success,
    ).toBe(false);
    expect(
      adminResearchItemCreateSchema.safeParse({ ...shared, answerType: "multi_choice" }).success,
    ).toBe(false);
    expect(
      adminResearchItemCreateSchema.safeParse({ ...shared, answerType: "agreement_5", constructKey: "bad key" }).success,
    ).toBe(false);
  });

  it("validates check-in deployment mode and date ordering", () => {
    expect(
      adminResearchDeploymentSchema.safeParse({
        studyId,
        checkinCodeId: 12,
        collectionMode: "field_observation",
        startsAt: "2026-09-01T00:00:00Z",
        endsAt: "2026-09-30T00:00:00Z",
      }).success,
    ).toBe(true);
    expect(
      adminResearchDeploymentSchema.safeParse({
        studyId,
        checkinCodeId: 12,
        collectionMode: "real_world",
      }).success,
    ).toBe(false);
    expect(
      adminResearchDeploymentSchema.safeParse({
        studyId,
        checkinCodeId: 12,
        collectionMode: "pilot_internal",
        startsAt: "2026-09-30T00:00:00Z",
        endsAt: "2026-09-01T00:00:00Z",
      }).success,
    ).toBe(false);
  });

  it("requires an explicit freeze confirmation for activation and never accepts a direct active status", () => {
    expect(adminResearchStudyActivationSchema.safeParse({ studyId, confirmFreeze: true }).success).toBe(true);
    expect(adminResearchStudyActivationSchema.safeParse({ studyId, confirmFreeze: false }).success).toBe(false);
    expect(adminResearchStudyActivationSchema.safeParse({ studyId, status: "active" }).success).toBe(false);
  });

  it("requires traceable advisor and ethics evidence before activation", () => {
    expect(adminResearchApprovalSchema.safeParse({
      studyId,
      advisorApprovedAt: "2026-08-15T09:00:00+07:00",
      ethicsReviewStatus: "not_required",
      approvalReference: "บันทึกอาจารย์ที่ปรึกษา 15/08/2569",
      confirmRecordedEvidence: true,
    }).success).toBe(true);
    expect(adminResearchApprovalSchema.safeParse({
      studyId,
      advisorApprovedAt: "2026-08-15T09:00:00+07:00",
      ethicsReviewStatus: "approved",
      approvalReference: "REC-2026-001",
      confirmRecordedEvidence: true,
    }).success).toBe(false);
  });

  it("defaults analytics to field observations and fixes the privacy cell threshold at ten", () => {
    const result = adminResearchAnalyticsFiltersSchema.safeParse({
      studyId,
      dateFrom: "2026-09-01",
      dateTo: "2026-09-30",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.collectionModes).toEqual(["field_observation"]);
      expect(result.data.minCellThreshold).toBe(10);
    }
    expect(
      adminResearchAnalyticsFiltersSchema.safeParse({
        studyId,
        dateFrom: "2026-10-01",
        dateTo: "2026-09-30",
      }).success,
    ).toBe(false);
    expect(
      adminResearchAnalyticsFiltersSchema.safeParse({
        studyId,
        dateFrom: "2026-09-01",
        dateTo: "2026-09-30",
        collectionModes: [],
        minCellThreshold: 5,
      }).success,
    ).toBe(false);
    expect(
      adminResearchAnalyticsFiltersSchema.safeParse({
        studyId,
        dateFrom: "2026-09-01",
        dateTo: "2026-09-30",
        participantType: "tourist",
        collectionModes: ["field_observation", "pilot_internal"],
      }).success,
    ).toBe(true);
  });

  it("validates operator task drafts and completion invariants for attempts", () => {
    expect(
      adminResearchOperatorTaskDraftSchema.safeParse({
        studyId,
        taskCode: "identify_segment",
        versionNumber: 1,
        audience: "operator",
        titleTh: "ระบุกลุ่มนักท่องเที่ยว",
        instructionTh: "ใช้แดชบอร์ดเพื่อระบุกลุ่มหลัก",
        expectedEvidence: "ข้อมูลอายุและแหล่งที่มา",
        scoringRule: { requiredEvidence: ["age", "origin"] },
        displayOrder: 1,
        maximumMinutes: 10,
      }).success,
    ).toBe(true);
    expect(
      adminResearchOperatorTaskDraftSchema.safeParse({
        studyId,
        taskCode: "identify-segment",
        versionNumber: 1,
        audience: "operator",
        titleTh: "Task",
        instructionTh: "Instruction",
        expectedEvidence: "Evidence",
        scoringRule: {},
        displayOrder: 1,
      }).success,
    ).toBe(false);

    expect(
      adminResearchOperatorAttemptSchema.safeParse({
        researchSessionId: sessionId,
        researchOperatorTaskId: taskId,
        sequenceNumber: 1,
        status: "completed",
        outcome: "passed",
        confidence: 4,
        evidenceQuality: 5,
        startedAt: "2026-09-01T10:00:00Z",
        completedAt: "2026-09-01T10:05:00Z",
      }).success,
    ).toBe(true);
    expect(
      adminResearchOperatorAttemptSchema.safeParse({
        researchSessionId: sessionId,
        researchOperatorTaskId: taskId,
        sequenceNumber: 1,
        status: "completed",
        confidence: 4,
      }).success,
    ).toBe(false);
    expect(adminResearchOperatorAssessmentSchema.safeParse({
      studyId,
      attemptId: taskId,
      outcome: "partial",
      evidenceQuality: "4",
      reviewNote: "หลักฐานครบสองมิติ",
    }).success).toBe(true);
    expect(adminResearchOperatorAssessmentSchema.safeParse({
      studyId,
      attemptId: taskId,
      outcome: "not_assessed",
      evidenceQuality: 6,
    }).success).toBe(false);
  });

  it("requires de-identified export filters and rejects unsafe dataset or threshold values", () => {
    expect(
      adminResearchExportFiltersSchema.safeParse({
        studyId,
        dataset: "responses",
      }).success,
    ).toBe(true);
    expect(adminResearchExportFiltersSchema.safeParse({ studyId, dataset: "codebook" }).success).toBe(true);
    expect(
      adminResearchExportFiltersSchema.safeParse({
        studyId,
        dataset: "raw_tourists",
      }).success,
    ).toBe(false);
    expect(
      adminResearchExportFiltersSchema.safeParse({
        studyId,
        dataset: "answers",
        deidentified: false,
        minCellThreshold: 9,
      }).success,
    ).toBe(false);
    expect(
      adminResearchExportFiltersSchema.safeParse({
        studyId,
        dataset: "operator_tasks",
        dateFrom: "2026-09-30",
        dateTo: "2026-09-01",
      }).success,
    ).toBe(false);
  });
});
