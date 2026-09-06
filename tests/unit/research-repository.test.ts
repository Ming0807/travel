import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
const from = vi.fn();

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ from, rpc }),
}));

import {
  acceptResearchInvitation,
  acceptResearchOperatorInvitation,
  getActiveResearchInvitation,
  getActiveResearchInvitationForCheckin,
  getResearchSessionForAccess,
  getResearchResponseSnapshot,
  linkResearchSessionVisit,
  saveResearchResponse,
  saveResearchOperatorAttempt,
  withdrawResearchSession,
} from "@/lib/repositories/research.repository";

function queryResult(data: unknown, error: { message: string } | null = null) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    not: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn(),
  };
  for (const method of ["select", "eq", "order", "limit", "not"]) {
    query[method as keyof typeof query].mockReturnValue(query);
  }
  query.maybeSingle.mockResolvedValue({ data, error });
  query.then.mockImplementation((resolve: (value: unknown) => unknown) => resolve({ data, error }));
  return query;
}

describe("research repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([undefined, "22222222-2222-4222-8222-222222222222"])("passes only hashed credentials and bounded identifiers to the accept RPC (%s)", async (entrySessionId) => {
    rpc.mockResolvedValue({
      data: {
        success: true,
        already_exists: false,
        public_session_code: "11111111-1111-4111-8111-111111111111",
        collection_mode: "field_observation",
      },
      error: null,
    });

    await acceptResearchInvitation({
      entrySessionId,
      studyCode: "field-tour-2026",
      checkinCode: "YALA_01",
      operationalSessionHash: "a".repeat(64),
      accessTokenHash: "b".repeat(64),
      withdrawalTokenHash: "c".repeat(64),
      language: "th",
    });

    expect(rpc).toHaveBeenCalledWith(entrySessionId ? "accept_entry_research_invitation" : "accept_research_invitation", {
      ...(entrySessionId ? { p_entry_session_id: entrySessionId } : {}),
      p_study_code: "field-tour-2026",
      p_checkin_code: "YALA_01",
      p_operational_session_hash: "a".repeat(64),
      p_access_token_hash: "b".repeat(64),
      p_withdrawal_token_hash: "c".repeat(64),
      p_language: "th",
    });
  });

  it("keeps facilitator identity and stakeholder session secrets inside server RPC calls", async () => {
    rpc
      .mockResolvedValueOnce({ data: { success: true, public_session_code: "11111111-1111-4111-8111-111111111111", collection_mode: "field_observation", participant_type: "operator" }, error: null })
      .mockResolvedValueOnce({ data: { success: true, attempt_id: "22222222-2222-4222-8222-222222222222", status: "completed" }, error: null });

    await acceptResearchOperatorInvitation({
      studyCode: "field-tour-2026",
      idempotencyKey: "44444444-4444-4444-8444-444444444444",
      participantType: "operator",
      collectionMode: "field_observation",
      accessTokenHash: "a".repeat(64),
      withdrawalTokenHash: "b".repeat(64),
      language: "th",
      processedBy: "33333333-3333-4333-8333-333333333333",
    });
    await saveResearchOperatorAttempt({
      publicSessionCode: "11111111-1111-4111-8111-111111111111",
      accessTokenHash: "a".repeat(64),
      taskCode: "segment_choice",
      status: "completed",
      confidence: 4,
      rationale: "อ้างอิงข้อมูลแนวโน้ม",
    });

    expect(rpc).toHaveBeenNthCalledWith(1, "accept_research_operator_invitation", expect.objectContaining({
      p_processed_by: "33333333-3333-4333-8333-333333333333",
      p_idempotency_key: "44444444-4444-4444-8444-444444444444",
      p_access_token_hash: "a".repeat(64),
    }));
    expect(rpc).toHaveBeenNthCalledWith(2, "save_research_operator_attempt", expect.objectContaining({
      p_task_code: "segment_choice",
      p_confidence: 4,
    }));
  });

  it("maps malformed RPC responses without returning secret fields", async () => {
    rpc.mockResolvedValue({
      data: { success: true, access_token_hash: "secret" },
      error: null,
    });

    await expect(
      acceptResearchInvitation({
        studyCode: "field-tour-2026",
        checkinCode: "YALA_01",
        operationalSessionHash: "a".repeat(64),
        accessTokenHash: "b".repeat(64),
        withdrawalTokenHash: "c".repeat(64),
        language: null,
      }),
    ).rejects.toMatchObject({ code: "INVALID_RPC_RESPONSE" });
  });

  it("projects active tourist invitations without operator answers", async () => {
    const study = queryResult({
      research_study_id: "11111111-1111-4111-8111-111111111111",
      study_code: "field-tour-2026",
      title_th: "การทดสอบ",
      title_en: "Evaluation",
      consent_version: "1",
      notice_version: "1",
      status: "active",
      frozen_at: "2026-08-01T00:00:00.000Z",
      starts_at: null,
      ends_at: null,
    });
    const checkin = queryResult({
      checkin_code_id: 10,
      code: "YALA_01",
      is_active: true,
      starts_at: null,
      ends_at: null,
    });
    const deployment = queryResult({
      study_id: "11111111-1111-4111-8111-111111111111",
      checkin_code_id: 10,
      default_collection_mode: "field_observation",
      is_active: true,
      starts_at: null,
      ends_at: null,
    });
    const instrument = queryResult({
      research_instrument_id: "22222222-2222-4222-8222-222222222222",
      version_number: 1,
      instrument_key: "tourist_evaluation",
      title_th: "ประเมิน",
      title_en: "Evaluation",
      description_th: null,
      description_en: null,
      estimated_minutes: 5,
    });
    const items = queryResult([
      {
        research_item_id: "33333333-3333-4333-8333-333333333333",
        item_code: "SAT_01",
        construct_key: "satisfaction",
        prompt_th: "พึงพอใจหรือไม่",
        prompt_en: "Satisfied?",
        answer_type: "rating_5",
        options_json: null,
        display_order: 1,
        is_required: true,
      },
    ]);
    from.mockImplementation((table: string) =>
      ({
        research_studies: study,
        checkin_codes: checkin,
        research_checkin_codes: deployment,
        research_instruments: instrument,
        research_items: items,
      })[table],
    );

    const result = await getActiveResearchInvitation("field-tour-2026", "YALA_01");

    expect(result?.instrument.items[0]).not.toHaveProperty("expected_evidence");
    expect(result?.instrument.items[0]).not.toHaveProperty("scoring_rule");
    expect(instrument.select).toHaveBeenCalledWith(expect.not.stringContaining("expected_evidence"));
  });

  it("discovers the only active research deployment from a check-in code", async () => {
    const checkin = queryResult({
      checkin_code_id: 10,
      code: "YALA_01",
      is_active: true,
      starts_at: null,
      ends_at: null,
    });
    const deployment = queryResult({
      study_id: "11111111-1111-4111-8111-111111111111",
      checkin_code_id: 10,
      default_collection_mode: "field_observation",
      is_active: true,
      starts_at: null,
      ends_at: null,
    });
    const study = queryResult({
      research_study_id: "11111111-1111-4111-8111-111111111111",
      study_code: "field-tour-2026",
      title_th: "การทดสอบ",
      title_en: "Evaluation",
      consent_version: "1",
      notice_version: "1",
      purpose_th: "ประเมินระบบ",
      participation_th: "ตอบแบบประเมินหลังท่องเที่ยว",
      privacy_th: "วิเคราะห์โดยไม่แสดงตัวตน",
      withdrawal_th: "ถอนตัวได้โดยไม่เสียสิทธิ",
      contact_email: "research@example.org",
      status: "active",
      frozen_at: "2026-08-01T00:00:00.000Z",
      starts_at: null,
      ends_at: null,
      retention_until: "2027-08-01T00:00:00.000Z",
    });
    const instrument = queryResult({
      research_instrument_id: "22222222-2222-4222-8222-222222222222",
      version_number: 1,
      instrument_key: "tourist_evaluation",
      title_th: "ประเมิน",
      title_en: null,
      description_th: null,
      description_en: null,
      estimated_minutes: 4,
    });
    const items = queryResult([]);
    from.mockImplementation((table: string) => ({
      checkin_codes: checkin,
      research_checkin_codes: deployment,
      research_studies: study,
      research_instruments: instrument,
      research_items: items,
    })[table]);

    await expect(getActiveResearchInvitationForCheckin("YALA_01")).resolves.toMatchObject({
      studyCode: "field-tour-2026",
      contactEmail: "research@example.org",
      collectionMode: "field_observation",
    });
  });

  it.each([
    ["inactive study", { status: "paused", frozen_at: "2026-08-01T00:00:00.000Z", starts_at: null, ends_at: null }, null, null],
    ["expired deployment", { status: "active", frozen_at: "2026-08-01T00:00:00.000Z", starts_at: null, ends_at: null }, { is_active: true, starts_at: null, ends_at: "2026-08-07T00:00:00.000Z" }, null],
    ["mismatched study", { status: "active", frozen_at: "2026-08-01T00:00:00.000Z", starts_at: null, ends_at: null }, { is_active: true, starts_at: null, ends_at: null }, null],
  ])("returns no invitation for an %s", async (_label, studyState, checkinState, deploymentState) => {
    const study = queryResult({
      research_study_id: "11111111-1111-4111-8111-111111111111",
      study_code: "field-tour-2026",
      title_th: "การทดสอบ",
      title_en: "Evaluation",
      consent_version: "1",
      notice_version: "1",
      ...studyState,
    });
    const checkin = queryResult(checkinState ? {
      checkin_code_id: 10,
      code: "YALA_01",
      ...checkinState,
    } : null);
    const deployment = queryResult(deploymentState ? {
      study_id: "99999999-9999-4999-8999-999999999999",
      checkin_code_id: 10,
      default_collection_mode: "field_observation",
      ...(deploymentState as Record<string, unknown>),
    } : null);
    from.mockImplementation((table: string) =>
      ({
        research_studies: study,
        checkin_codes: checkin,
        research_checkin_codes: deployment,
      })[table],
    );

    await expect(getActiveResearchInvitation("field-tour-2026", "YALA_01")).resolves.toBeNull();
  });

  it("passes ownership credentials to link and withdrawal RPCs", async () => {
    rpc
      .mockResolvedValueOnce({ data: { success: true, research_session_id: "44444444-4444-4444-8444-444444444444" }, error: null })
      .mockResolvedValueOnce({ data: { success: true, already_withdrawn: false }, error: null });

    await linkResearchSessionVisit({
      publicSessionCode: "11111111-1111-4111-8111-111111111111",
      accessTokenHash: "b".repeat(64),
      visitId: "22222222-2222-4222-8222-222222222222",
      touristId: "33333333-3333-4333-8333-333333333333",
    });
    await withdrawResearchSession({
      publicSessionCode: "11111111-1111-4111-8111-111111111111",
      withdrawalTokenHash: "c".repeat(64),
      reason: "no longer wish to participate",
      source: "withdrawal_page",
    });

    expect(rpc).toHaveBeenNthCalledWith(1, "link_research_session_visit", expect.objectContaining({
      p_access_token_hash: "b".repeat(64),
    }));
    expect(rpc).toHaveBeenNthCalledWith(2, "withdraw_research_session", expect.objectContaining({
      p_withdrawal_token_hash: "c".repeat(64),
    }));
    from.mockReturnValue(queryResult(null));
    expect(await getResearchSessionForAccess("11111111-1111-4111-8111-111111111111", "b".repeat(64))).toBeNull();
  });

  it("passes a bounded answer snapshot to the atomic response RPC", async () => {
    rpc.mockResolvedValue({
      data: {
        success: true,
        response_id: "55555555-5555-4555-8555-555555555555",
        status: "submitted",
        answer_count: 2,
      },
      error: null,
    });

    await expect(saveResearchResponse({
      publicSessionCode: "11111111-1111-4111-8111-111111111111",
      accessTokenHash: "b".repeat(64),
      instrumentKey: "tourist_evaluation",
      submit: true,
      answers: [
        { item_code: "SQ_01", integer_value: 5 },
        { item_code: "COMMENT", text_value: "ดี" },
      ],
    })).resolves.toMatchObject({ success: true, status: "submitted", answerCount: 2 });
    expect(rpc).toHaveBeenCalledWith("save_research_response", expect.objectContaining({
      p_submit: true,
      p_answers: expect.any(Array),
    }));
  });

  it("loads a bounded draft snapshot for refresh recovery", async () => {
    const response = queryResult({
      research_response_id: "55555555-5555-4555-8555-555555555555",
      status: "draft",
      started_at: "2026-08-08T00:00:00.000Z",
      submitted_at: null,
    });
    const answers = queryResult([
      { item_id: "33333333-3333-4333-8333-333333333333", integer_value: 4, text_value: null, boolean_value: null },
    ]);
    from.mockImplementation((table: string) => ({
      research_responses: response,
      research_answers: answers,
    })[table]);

    await expect(getResearchResponseSnapshot(
      "11111111-1111-4111-8111-111111111111",
      "22222222-2222-4222-8222-222222222222",
    )).resolves.toMatchObject({ status: "draft", answers: [{ integerValue: 4 }] });
  });
});
