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
  clearResearchVisitCredentials: vi.fn(),
  createResearchCredentials: vi.fn(),
  getResearchOperationalSessionToken: vi.fn(),
  getResearchSessionCredentials: vi.fn(),
  getResearchVisitCredentials: vi.fn(),
  setResearchVisitCredentials: vi.fn(),
  hashResearchToken: vi.fn((value: string) => `hash:${value}`),
  setResearchSessionCredentials: vi.fn(),
}));
const guards = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  requireTouristVisitAccess: vi.fn(),
}));
const entry = vi.hoisted(() => ({ resolveCheckinFlow: vi.fn() }));
const browserGrant = vi.hoisted(() => ({ read: vi.fn(), resolve: vi.fn(), accept: vi.fn() }));
vi.mock("@/lib/auth/research-browser", () => ({ readResearchBrowserToken: browserGrant.read, hashResearchBrowserToken: () => "a".repeat(64) }));
vi.mock("@/lib/repositories/research-browser-grant.repository", () => ({ resolveResearchBrowserContext: browserGrant.resolve, acceptResearchBrowserInvitation: browserGrant.accept }));
vi.mock("@/lib/config/checkin-entry", () => ({getCheckinEntryConfig:()=>({sessionsEnabled:true,hashSecret:"s".repeat(32)})}));
vi.mock("@/lib/services/checkin-entry.service", () => entry);
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: "11111111-1111-4111-8111-111111111111" }) }) }));

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
  linkCurrentResearchSessionVisitIfPresent,
  saveCurrentResearchResponse,
  saveCurrentResearchOperatorAttempt,
  withdrawResearchSession,
  hasCurrentResearchParticipation,
} from "@/lib/services/research.service";

const publicSessionCode = "11111111-1111-4111-8111-111111111111";

describe("research service", () => {
  it.each(["success","missing-grant","wrong-session","rpc-failure"])("handles atomic acceptance %s without writing proposed cookies",async(scenario)=>{
    browserGrant.read.mockResolvedValue("browser");
    entry.resolveCheckinFlow.mockResolvedValue({mode:"session",session:{evidenceScope:"field_observation",researchStudyId:publicSessionCode,researchFrozenAt:"2026-09-01T00:00:00Z"}});
    repository.getActiveResearchInvitation.mockResolvedValue({studyId:publicSessionCode,frozenAt:"2026-09-01T00:00:00Z",collectionMode:"field_observation"});
    browserGrant.accept.mockResolvedValue({success:true,already_exists:true,public_session_code:publicSessionCode,collection_mode:"field_observation"});
    browserGrant.resolve.mockResolvedValue({publicSessionCode});
    if(scenario==="missing-grant") browserGrant.resolve.mockResolvedValue(null);
    if(scenario==="wrong-session") browserGrant.resolve.mockResolvedValue({publicSessionCode:"other"});
    if(scenario==="rpc-failure") browserGrant.accept.mockRejectedValue(new Error("private detail"));
    const result=acceptResearchInvitation({studyCode:"field-tour-2026",checkinCode:"YALA_01",hasConsented:true,entrySessionId:publicSessionCode});
    if(scenario==="success") await expect(result).resolves.toEqual({accepted:true,alreadyExists:true,collectionMode:"field_observation"});
    else await expect(result).rejects.toMatchObject({code:"RESEARCH_UNAVAILABLE"});
    expect(auth.setResearchSessionCredentials).not.toHaveBeenCalled();
    expect(auth.setResearchVisitCredentials).not.toHaveBeenCalled();
    expect(repository.acceptResearchInvitation).not.toHaveBeenCalled();
  });
  it("links an owned entry grant without creating a Visit cookie", async () => {
    browserGrant.read.mockResolvedValue("browser");
    browserGrant.resolve.mockResolvedValue({publicSessionCode,accessTokenHash:"access-hash",withdrawalTokenHash:"withdraw-hash",visitId:null,entrySessionId:publicSessionCode});
    repository.getResearchSessionForAccess.mockResolvedValue({participantType:"tourist",status:"consented",visitId:null,withdrawnAt:null});
    guards.requireTouristVisitAccess.mockResolvedValue({touristId:"owner"});
    repository.linkResearchSessionVisit.mockResolvedValue({success:true});
    expect(await linkCurrentResearchSessionVisitIfPresent({visitId:publicSessionCode},publicSessionCode)).toEqual({linked:true});
    expect(repository.linkResearchSessionVisit).toHaveBeenCalledWith({publicSessionCode,accessTokenHash:"access-hash",visitId:publicSessionCode,touristId:"owner"});
    expect(auth.setResearchVisitCredentials).not.toHaveBeenCalled();
  });
  it("discovers grant participation on the withdrawal page only for the owned Visit", async () => {
    browserGrant.read.mockResolvedValue("browser");
    browserGrant.resolve.mockResolvedValue({publicSessionCode,accessTokenHash:"access-hash",withdrawalTokenHash:"withdraw-hash",visitId:publicSessionCode});
    repository.getResearchSessionForAccess.mockResolvedValue({participantType:"tourist",status:"completed",visitId:publicSessionCode,withdrawnAt:null});
    guards.requireTouristVisitAccess.mockResolvedValue({touristId:"owner"});
    expect(await hasCurrentResearchParticipation(publicSessionCode)).toBe(true);
    expect(repository.getResearchSessionForAccess).toHaveBeenCalledWith(publicSessionCode,"access-hash");
    guards.requireTouristVisitAccess.mockRejectedValue({code:"VISIT_ACCESS_DENIED"});
    expect(await hasCurrentResearchParticipation(publicSessionCode)).toBe(false);
  });
  it("does not show participation for withdrawn grants or resolver failures", async () => {
    browserGrant.read.mockResolvedValue("browser");
    browserGrant.resolve.mockResolvedValue({publicSessionCode,accessTokenHash:"access-hash",withdrawalTokenHash:"withdraw-hash",visitId:publicSessionCode});
    repository.getResearchSessionForAccess.mockResolvedValue({participantType:"tourist",status:"withdrawn",visitId:publicSessionCode,withdrawnAt:"2026-09-07"});
    expect(await hasCurrentResearchParticipation(publicSessionCode)).toBe(false);
    browserGrant.resolve.mockRejectedValue(new Error("unavailable"));
    expect(await hasCurrentResearchParticipation(publicSessionCode)).toBe(false);
  });
  it("uses grant hashes unchanged for owned Visit withdrawal", async () => {
    browserGrant.read.mockResolvedValue("browser");
    browserGrant.resolve.mockResolvedValue({publicSessionCode,accessTokenHash:"access-hash",withdrawalTokenHash:"withdraw-hash",visitId:publicSessionCode});
    repository.getResearchSessionForAccess.mockResolvedValue({participantType:"tourist",status:"in_progress",visitId:publicSessionCode,withdrawnAt:null});
    guards.requireTouristVisitAccess.mockResolvedValue({touristId:"owner"});
    repository.withdrawResearchSession.mockResolvedValue({success:true,alreadyWithdrawn:false});
    await withdrawResearchSession({visitId:publicSessionCode});
    expect(repository.getResearchSessionForAccess).toHaveBeenCalledWith(publicSessionCode,"access-hash");
    expect(repository.withdrawResearchSession).toHaveBeenCalledWith(expect.objectContaining({withdrawalTokenHash:"withdraw-hash"}));
  });
  it("still rejects a grant when tourist ownership is denied", async () => {
    browserGrant.read.mockResolvedValue("browser");
    browserGrant.resolve.mockResolvedValue({publicSessionCode,accessTokenHash:"access-hash",withdrawalTokenHash:"withdraw-hash",visitId:publicSessionCode});
    repository.getResearchSessionForAccess.mockResolvedValue({participantType:"tourist",status:"in_progress",visitId:publicSessionCode,withdrawnAt:null});
    guards.requireTouristVisitAccess.mockRejectedValue({code:"VISIT_ACCESS_DENIED"});
    await expect(withdrawResearchSession({visitId:publicSessionCode})).rejects.toMatchObject({code:"VISIT_ACCESS_DENIED"});
    expect(repository.withdrawResearchSession).not.toHaveBeenCalled();
  });
  it("rejects rebinding an existing research session to another Visit", async () => {
    auth.getResearchSessionCredentials.mockResolvedValue({ publicSessionCode, accessToken: "token" });
    repository.getResearchSessionForAccess.mockResolvedValue({ participantType: "tourist", status: "in_progress", visitId: publicSessionCode, withdrawnAt: null });
    await expect(linkResearchSessionVisit({ visitId: "22222222-2222-4222-8222-222222222222" })).rejects.toMatchObject({ code: "VISIT_MISMATCH" });
    expect(repository.linkResearchSessionVisit).not.toHaveBeenCalled();
    expect(auth.setResearchVisitCredentials).not.toHaveBeenCalled();
  });

  it("allows an owned completed Visit link replay without reopening the evaluation", async () => {
    auth.getResearchSessionCredentials.mockResolvedValue({ publicSessionCode, accessToken: "token" });
    repository.getResearchSessionForAccess.mockResolvedValue({ participantType: "tourist", status: "completed", visitId: publicSessionCode, withdrawnAt: null });
    guards.requireTouristVisitAccess.mockResolvedValue({ touristId: "tourist-id" });
    repository.linkResearchSessionVisit.mockResolvedValue({ success: true, researchSessionId: "private" });
    await expect(linkResearchSessionVisit({ visitId: publicSessionCode })).resolves.toEqual({ linked: true });
    expect(guards.requireTouristVisitAccess).toHaveBeenCalledWith(publicSessionCode);
  });
  it("rejects a different Visit before saving or withdrawing a global session", async () => {
    auth.getResearchVisitCredentials.mockResolvedValue(null);
    auth.getResearchSessionCredentials.mockResolvedValue({ publicSessionCode, accessToken: "token" });
    repository.getResearchSessionForAccess.mockResolvedValue({
      participantType: "tourist", status: "in_progress", visitId: "22222222-2222-4222-8222-222222222222", withdrawnAt: null,
    });
    await expect(saveCurrentResearchResponse({ visitId: publicSessionCode, instrumentKey: "tourist_evaluation", answers: [], submit: false })).rejects.toThrow();
    await expect(withdrawResearchSession({ visitId: publicSessionCode })).rejects.toThrow();
    expect(repository.saveResearchResponse).not.toHaveBeenCalled();
    expect(repository.withdrawResearchSession).not.toHaveBeenCalled();
  });

  it("saves with Visit-scoped credentials rather than the latest global session", async () => {
    auth.getResearchVisitCredentials.mockResolvedValue({ publicSessionCode, accessToken: "scoped-token" });
    repository.getResearchSessionForAccess.mockResolvedValue({ participantType: "tourist", status: "in_progress", visitId: publicSessionCode, withdrawnAt: null });
    guards.requireTouristVisitAccess.mockResolvedValue({ touristId: "owner" });
    repository.saveResearchResponse.mockResolvedValue({ success: true, status: "draft", answerCount: 0 });
    await saveCurrentResearchResponse({ visitId: publicSessionCode, instrumentKey: "tourist_evaluation", answers: [], submit: false });
    expect(repository.saveResearchResponse).toHaveBeenCalledWith(expect.objectContaining({ accessTokenHash: "hash:scoped-token" }));
    expect(guards.requireTouristVisitAccess).toHaveBeenCalledWith(publicSessionCode);
    expect(auth.getResearchSessionCredentials).not.toHaveBeenCalled();
  });

  it("does not fall back to a different tab's research credentials", async () => {
    auth.getResearchSessionCredentials.mockResolvedValue(null);
    expect(await linkCurrentResearchSessionVisitIfPresent({ visitId: publicSessionCode }, publicSessionCode)).toEqual({ linked: false });
    expect(auth.getResearchSessionCredentials).toHaveBeenCalledWith(publicSessionCode);
    expect(repository.linkResearchSessionVisit).not.toHaveBeenCalled();
  });

  it("rejects entry acceptance when browser-bound context is unavailable", async () => {
    entry.resolveCheckinFlow.mockResolvedValue({ mode: "blocked" });
    await expect(acceptResearchInvitation({ studyCode: "field-tour-2026", checkinCode: "YALA_01", hasConsented: true, entrySessionId: publicSessionCode })).rejects.toThrow();
    expect(repository.acceptResearchInvitation).not.toHaveBeenCalled();
  });

  it("uses the validated entry as the operational key and stores scoped credentials", async () => {
    entry.resolveCheckinFlow.mockResolvedValue({ mode: "session", session: { evidenceScope: "field_observation", researchStudyId: publicSessionCode, researchFrozenAt: "2026-09-01T00:00:00Z" } });
    repository.getActiveResearchInvitation.mockResolvedValue({ studyId: publicSessionCode, frozenAt: "2026-09-01T00:00:00.000+00:00", collectionMode: "field_observation" });
    await acceptResearchInvitation({ studyCode: "field-tour-2026", checkinCode: "YALA_01", hasConsented: true, entrySessionId: publicSessionCode });
    expect(repository.acceptResearchInvitation).toHaveBeenCalledWith(expect.objectContaining({ entrySessionId: publicSessionCode, operationalSessionHash: `hash:${publicSessionCode}` }));
    expect(auth.setResearchSessionCredentials).toHaveBeenCalledWith(expect.any(Object), publicSessionCode);
    expect(auth.getResearchOperationalSessionToken).not.toHaveBeenCalled();
  });

  it.each([
    { studyId: "22222222-2222-4222-8222-222222222222", frozenAt: "2026-09-01T00:00:00Z", collectionMode: "field_observation" },
    { studyId: publicSessionCode, frozenAt: "2026-09-02T00:00:00Z", collectionMode: "field_observation" },
    { studyId: publicSessionCode, frozenAt: "2026-09-01T00:00:00Z", collectionMode: "simulated_usability" },
    null,
  ])("rejects changed or unavailable research deployments %#", async (invitation) => {
    entry.resolveCheckinFlow.mockResolvedValue({ mode: "session", session: { evidenceScope: "field_observation", researchStudyId: publicSessionCode, researchFrozenAt: "2026-09-01T00:00:00Z" } });
    repository.getActiveResearchInvitation.mockResolvedValue(invitation);
    await expect(acceptResearchInvitation({ studyCode: "field-tour-2026", checkinCode: "YALA_01", hasConsented: true, entrySessionId: publicSessionCode })).rejects.toThrow();
    expect(repository.acceptResearchInvitation).not.toHaveBeenCalled();
    expect(auth.setResearchSessionCredentials).not.toHaveBeenCalled();
  });

  it("withdraws only the selected Visit and preserves another tab's global session", async () => {
    auth.getResearchVisitCredentials.mockResolvedValue({ publicSessionCode, accessToken: "scoped-token", withdrawalToken: "scoped-withdrawal" });
    auth.getResearchSessionCredentials.mockResolvedValue({ publicSessionCode: "22222222-2222-4222-8222-222222222222" });
    repository.getResearchSessionForAccess.mockResolvedValue({ participantType: "tourist", status: "in_progress", visitId: publicSessionCode, withdrawnAt: null });
    guards.requireTouristVisitAccess.mockResolvedValue({ touristId: "owner" });
    repository.withdrawResearchSession.mockResolvedValue({ success: true, alreadyWithdrawn: false });
    await withdrawResearchSession({ visitId: publicSessionCode });
    expect(repository.withdrawResearchSession).toHaveBeenCalledWith(expect.objectContaining({ publicSessionCode, withdrawalTokenHash: "hash:scoped-withdrawal" }));
    expect(auth.clearResearchVisitCredentials).toHaveBeenCalledWith(publicSessionCode);
    expect(auth.clearResearchSessionCredentials).not.toHaveBeenCalled();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    browserGrant.read.mockReset();
    browserGrant.resolve.mockReset();
    browserGrant.accept.mockReset();
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
