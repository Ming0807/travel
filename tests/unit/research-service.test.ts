import { beforeEach, describe, expect, it, vi } from "vitest";

const repository = vi.hoisted(() => ({
  acceptResearchInvitation: vi.fn(),
  acceptResearchOperatorInvitation: vi.fn(),
  getActiveResearchInvitation: vi.fn(),
  getPublishedResearchInstrument: vi.fn(),
  getPublishedResearchOperatorTasks: vi.fn(),
  getResearchOperatorAttempts: vi.fn(),
  getResearchResponseSnapshot: vi.fn(),
  getResearchSessionForAccess: vi.fn(),
  linkResearchSessionVisit: vi.fn(),
  saveResearchOperatorAttempt: vi.fn(),
  saveResearchResponse: vi.fn(),
  withdrawResearchSession: vi.fn(),
}));
const adminRepository = vi.hoisted(() => ({
  getAdminResearchStudyDetail: vi.fn(),
}));
const auth = vi.hoisted(() => ({
  clearResearchSessionCredentials: vi.fn(),
  createResearchCredentials: vi.fn(),
  getResearchOperationalSessionToken: vi.fn(),
  getResearchSessionCredentials: vi.fn(),
  hashResearchToken: vi.fn((value: string) => `hash:${value}`),
  setResearchSessionCredentials: vi.fn(),
}));
const guards = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  requireTouristVisitAccess: vi.fn(),
}));

vi.mock("@/lib/repositories/research.repository", () => repository);
vi.mock("@/lib/auth/research-session", () => auth);
vi.mock("@/lib/auth/guards", () => guards);
vi.mock("@/lib/repositories/admin-research.repository", () => adminRepository);

import {
  acceptResearchInvitation,
  acceptFacilitatedResearchOperator,
  declineResearchInvitation,
  getCurrentResearchEvaluation,
  getCurrentResearchOperatorWorkspace,
  getOptionalResearchInvitation,
  linkResearchSessionVisit,
  saveCurrentResearchResponse,
  saveCurrentResearchOperatorAttempt,
  withdrawResearchSession,
} from "@/lib/services/research.service";

const publicSessionCode = "11111111-1111-4111-8111-111111111111";

describe("research service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.getResearchOperationalSessionToken.mockResolvedValue("operational-token");
    auth.createResearchCredentials.mockReturnValue({
      publicSessionCode,
      operationalSessionToken: "operational-token",
      accessToken: "access-token",
      withdrawalToken: "withdrawal-token",
      accessTokenHash: "a".repeat(64),
      withdrawalTokenHash: "b".repeat(64),
    });
    repository.acceptResearchInvitation.mockResolvedValue({
      success: true,
      alreadyExists: false,
      publicSessionCode,
      collectionMode: "field_observation",
    });
    guards.requirePermission.mockResolvedValue({ actor: { adminId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", permissions: ["research.manage"] } });
  });

  it("returns an optional safe invitation and creates nothing when declined", async () => {
    repository.getActiveResearchInvitation.mockResolvedValue({
      studyCode: "field-tour-2026",
      titleTh: "การประเมิน",
      titleEn: "Evaluation",
      instrument: {
        versionNumber: 1,
        titleTh: "แบบประเมิน",
        titleEn: "Evaluation",
        items: [{ itemCode: "SAT_01", promptTh: "พึงพอใจ", answerType: "rating_5" }],
      },
    });

    const invitation = await getOptionalResearchInvitation({
      studyCode: "field-tour-2026",
      checkinCode: "YALA_01",
    });
    const declined = await declineResearchInvitation();

    expect(invitation?.instrument).not.toHaveProperty("items");
    expect(declined).toEqual({ declined: true });
    expect(repository.acceptResearchInvitation).not.toHaveBeenCalled();
    expect(auth.setResearchSessionCredentials).not.toHaveBeenCalled();
  });

  it("reveals the frozen instrument only after consent, session ownership, and visit access", async () => {
    auth.getResearchSessionCredentials.mockResolvedValue({
      publicSessionCode,
      accessToken: "access-token",
      withdrawalToken: "withdrawal-token",
      operationalSessionToken: "operational-token",
    });
    repository.getResearchSessionForAccess.mockResolvedValue({
      researchSessionId: "99999999-9999-4999-8999-999999999999",
      publicSessionCode,
      studyId: "study-id",
      status: "in_progress",
      participantType: "tourist",
      visitId: "22222222-2222-4222-8222-222222222222",
      withdrawnAt: null,
    });
    guards.requireTouristVisitAccess.mockResolvedValue({ touristId: "tourist-id", visit: {} });
    repository.getPublishedResearchInstrument.mockResolvedValue({
      instrumentId: "22222222-2222-4222-8222-222222222222",
      instrumentKey: "tourist_evaluation",
      versionNumber: 1,
      titleTh: "แบบประเมิน",
      items: [{ itemId: "33333333-3333-4333-8333-333333333333", itemCode: "SQ_01", constructKey: "system_quality", answerType: "agreement_5", isRequired: true }],
    });
    repository.getResearchResponseSnapshot.mockResolvedValue({
      status: "draft",
      startedAt: "2026-08-08T00:00:00.000Z",
      submittedAt: null,
      answers: [{
        itemId: "33333333-3333-4333-8333-333333333333",
        integerValue: 4,
        textValue: null,
        booleanValue: null,
      }],
    });

    const evaluation = await getCurrentResearchEvaluation();

    expect(guards.requireTouristVisitAccess).toHaveBeenCalledWith(
      "22222222-2222-4222-8222-222222222222",
    );
    expect(evaluation?.items).toHaveLength(1);
    expect(evaluation?.savedAnswers).toEqual([{ itemCode: "SQ_01", integerValue: 4 }]);
  });

  it("creates a facilitated stakeholder session without exposing credentials", async () => {
    adminRepository.getAdminResearchStudyDetail.mockResolvedValue({
      study: { studyCode: "field-tour-2026", status: "active" },
    });
    repository.acceptResearchOperatorInvitation.mockResolvedValue({
      success: true,
      publicSessionCode,
      collectionMode: "field_observation",
      participantType: "operator",
    });

    const result = await acceptFacilitatedResearchOperator({
      studyId: "22222222-2222-4222-8222-222222222222",
      studyCode: "field-tour-2026",
      idempotencyKey: "33333333-3333-4333-8333-333333333333",
      participantType: "operator",
      collectionMode: "field_observation",
      language: "th",
      hasConsented: true,
    });

    expect(repository.acceptResearchOperatorInvitation).toHaveBeenCalledWith(expect.objectContaining({
      processedBy: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      idempotencyKey: "33333333-3333-4333-8333-333333333333",
      accessTokenHash: "a".repeat(64),
      withdrawalTokenHash: "b".repeat(64),
    }));
    expect(auth.setResearchSessionCredentials).toHaveBeenCalled();
    expect(result).toEqual({ accepted: true, participantType: "operator" });
    expect(result).not.toHaveProperty("publicSessionCode");
  });

  it("loads and saves stakeholder decision tasks through session-bound RPCs", async () => {
    auth.getResearchSessionCredentials.mockResolvedValue({
      publicSessionCode,
      accessToken: "access-token",
      withdrawalToken: "withdrawal-token",
      operationalSessionToken: "operational-token",
    });
    repository.getResearchSessionForAccess.mockResolvedValue({
      researchSessionId: "99999999-9999-4999-8999-999999999999",
      publicSessionCode,
      studyId: "study-id",
      status: "in_progress",
      participantType: "operator",
      visitId: null,
      withdrawnAt: null,
    });
    repository.getPublishedResearchOperatorTasks.mockResolvedValue([{ taskId: "task-1", taskCode: "segment_choice" }]);
    repository.getResearchOperatorAttempts.mockResolvedValue([{ taskId: "task-1", status: "completed", confidence: 4, rationale: "เลือกจากแนวโน้ม" }]);
    repository.saveResearchOperatorAttempt.mockResolvedValue({ success: true, attemptId: "77777777-7777-4777-8777-777777777777", status: "completed" });

    await expect(getCurrentResearchOperatorWorkspace()).resolves.toMatchObject({ completedTasks: 1 });
    await expect(saveCurrentResearchOperatorAttempt({
      taskCode: "segment_choice",
      status: "completed",
      confidence: 4,
      rationale: "เลือกจากแนวโน้มผู้เข้าชม",
    })).resolves.toEqual({ saved: true, status: "completed" });
    expect(repository.saveResearchOperatorAttempt).toHaveBeenCalledWith(expect.objectContaining({ accessTokenHash: "hash:access-token" }));
    expect(guards.requireTouristVisitAccess).not.toHaveBeenCalled();
  });

  it("redacts direct contact details before research free text reaches persistence", async () => {
    auth.getResearchSessionCredentials.mockResolvedValue({ publicSessionCode, accessToken: "access-token", withdrawalToken: "withdrawal-token", operationalSessionToken: "operational-token" });
    repository.getResearchSessionForAccess.mockResolvedValue({ researchSessionId: "99999999-9999-4999-8999-999999999999", publicSessionCode, studyId: "study-id", status: "in_progress", participantType: "operator", visitId: null, withdrawnAt: null });
    repository.saveResearchOperatorAttempt.mockResolvedValue({ success: true, attemptId: "77777777-7777-4777-8777-777777777777", status: "completed" });
    await saveCurrentResearchOperatorAttempt({ taskCode: "segment_choice", status: "completed", confidence: 5, rationale: "โทร 0812345678 หรือ https://example.com" });
    expect(repository.saveResearchOperatorAttempt).toHaveBeenCalledWith(expect.objectContaining({ rationale: "โทร [ข้อมูลติดต่อถูกปกปิด] หรือ [ข้อมูลติดต่อถูกปกปิด]" }));
  });

  it("saves a validated answer snapshot through the atomic RPC without exposing response ids", async () => {
    auth.getResearchSessionCredentials.mockResolvedValue({
      publicSessionCode,
      accessToken: "access-token",
      withdrawalToken: "withdrawal-token",
      operationalSessionToken: "operational-token",
    });
    repository.getResearchSessionForAccess.mockResolvedValue({
      publicSessionCode,
      studyId: "study-id",
      status: "in_progress",
      participantType: "tourist",
      visitId: "22222222-2222-4222-8222-222222222222",
      withdrawnAt: null,
    });
    guards.requireTouristVisitAccess.mockResolvedValue({ touristId: "tourist-id", visit: {} });
    repository.saveResearchResponse.mockResolvedValue({
      success: true,
      responseId: "private-response-id",
      status: "draft",
      answerCount: 1,
    });

    await expect(saveCurrentResearchResponse({
      instrumentKey: "tourist_evaluation",
      submit: false,
      answers: [{ itemCode: "SQ_01", integerValue: 5 }],
    })).resolves.toEqual({ saved: true, status: "draft", answerCount: 1 });
    expect(repository.saveResearchResponse).toHaveBeenCalledWith(expect.objectContaining({
      accessTokenHash: "hash:access-token",
      answers: [{ item_code: "SQ_01", integer_value: 5 }],
    }));
  });

  it("rejects a non-affirmative decision before any persistence", async () => {
    await expect(
      acceptResearchInvitation({
        studyCode: "field-tour-2026",
        checkinCode: "YALA_01",
        hasConsented: false as never,
      }),
    ).rejects.toMatchObject({ code: "CONSENT_REQUIRED" });
    expect(repository.acceptResearchInvitation).not.toHaveBeenCalled();
  });

  it("accepts idempotently and keeps all credentials server-side", async () => {
    const result = await acceptResearchInvitation({
      studyCode: "field-tour-2026",
      checkinCode: "YALA_01",
      hasConsented: true,
      language: "th",
    });

    expect(repository.acceptResearchInvitation).toHaveBeenCalledWith(expect.objectContaining({
      operationalSessionHash: expect.any(String),
      accessTokenHash: "a".repeat(64),
      withdrawalTokenHash: "b".repeat(64),
    }));
    expect(auth.setResearchSessionCredentials).toHaveBeenCalled();
    expect(result).toEqual({ accepted: true, alreadyExists: false, collectionMode: "field_observation" });
    expect(result).not.toHaveProperty("publicSessionCode");
    expect(result).not.toHaveProperty("accessToken");
    expect(result).not.toHaveProperty("withdrawalToken");

    repository.acceptResearchInvitation.mockResolvedValue({
      success: true,
      alreadyExists: true,
      publicSessionCode,
      collectionMode: "field_observation",
    });
    await expect(
      acceptResearchInvitation({
        studyCode: "field-tour-2026",
        checkinCode: "YALA_01",
        hasConsented: true,
      }),
    ).resolves.toMatchObject({ accepted: true, alreadyExists: true });
  });

  it("maps unavailable study, visit mismatch, and invalid withdrawal to typed Thai-safe errors", async () => {
    repository.acceptResearchInvitation.mockResolvedValue({
      success: false,
      errorCode: "RESEARCH_STUDY_UNAVAILABLE",
    });
    await expect(
      acceptResearchInvitation({ studyCode: "field-tour-2026", checkinCode: "YALA_01", hasConsented: true }),
    ).rejects.toMatchObject({ code: "INVITATION_UNAVAILABLE" });

    auth.getResearchSessionCredentials.mockResolvedValue({
      publicSessionCode,
      accessToken: "access-token",
      withdrawalToken: "withdrawal-token",
      operationalSessionToken: "operational-token",
    });
    repository.getResearchSessionForAccess.mockResolvedValue({
      publicSessionCode,
      status: "consented",
      participantType: "tourist",
    });
    guards.requireTouristVisitAccess.mockResolvedValue({ touristId: "tourist-id", visit: {} });
    repository.linkResearchSessionVisit.mockResolvedValue({
      success: false,
      errorCode: "RESEARCH_VISIT_MISMATCH",
    });
    await expect(linkResearchSessionVisit({ visitId: "22222222-2222-4222-8222-222222222222" })).rejects.toMatchObject({
      code: "VISIT_MISMATCH",
      message: expect.stringMatching(/[ก-๙]/),
    });

    repository.withdrawResearchSession.mockResolvedValue({
      success: false,
      errorCode: "RESEARCH_SESSION_NOT_FOUND",
    });
    await expect(withdrawResearchSession({ source: "withdrawal_page" })).rejects.toMatchObject({
      code: "SESSION_NOT_FOUND",
      message: expect.stringMatching(/[ก-๙]/),
    });
  });

  it("links a visit and clears credentials after withdrawal without returning IDs", async () => {
    auth.getResearchSessionCredentials.mockResolvedValue({
      publicSessionCode,
      accessToken: "access-token",
      withdrawalToken: "withdrawal-token",
      operationalSessionToken: "operational-token",
    });
    repository.getResearchSessionForAccess.mockResolvedValue({
      publicSessionCode,
      status: "consented",
      participantType: "tourist",
    });
    guards.requireTouristVisitAccess.mockResolvedValue({ touristId: "tourist-id", visit: {} });
    repository.linkResearchSessionVisit.mockResolvedValue({ success: true, researchSessionId: "private-id" });

    await expect(linkResearchSessionVisit({ visitId: "22222222-2222-4222-8222-222222222222" })).resolves.toEqual({ linked: true });
    expect(repository.linkResearchSessionVisit).toHaveBeenCalledWith(expect.objectContaining({
      publicSessionCode,
      accessTokenHash: "hash:access-token",
      touristId: "tourist-id",
    }));

    repository.withdrawResearchSession.mockResolvedValue({ success: true, alreadyWithdrawn: false });
    await expect(withdrawResearchSession({ source: "withdrawal_page" })).resolves.toEqual({
      withdrawn: true,
      alreadyWithdrawn: false,
    });
    expect(auth.clearResearchSessionCredentials).toHaveBeenCalled();
  });
});
