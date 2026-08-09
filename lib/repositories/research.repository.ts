import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export type ResearchRpcFailure = {
  success: false;
  errorCode: string;
};

export type ResearchAcceptRpcResult =
  | ResearchRpcFailure
  | {
      success: true;
      alreadyExists: boolean;
      publicSessionCode: string;
      collectionMode: string;
    };

export type ResearchOperatorAcceptRpcResult =
  | ResearchRpcFailure
  | {
      success: true;
      publicSessionCode: string;
      collectionMode: string;
      participantType: "operator" | "attraction_manager";
    };

export type ResearchOperatorAttemptRpcResult =
  | ResearchRpcFailure
  | {
      success: true;
      attemptId: string;
      status: "in_progress" | "completed" | "skipped" | "abandoned";
    };

export type ResearchLinkRpcResult =
  | ResearchRpcFailure
  | { success: true; researchSessionId: string };

export type ResearchWithdrawalRpcResult =
  | ResearchRpcFailure
  | { success: true; alreadyWithdrawn: boolean };

export type ResearchResponseAnswerPayload =
  | { item_code: string; integer_value: number }
  | { item_code: string; text_value: string }
  | { item_code: string; boolean_value: boolean };

export type ResearchResponseRpcResult =
  | ResearchRpcFailure
  | {
      success: true;
      responseId: string;
      status: "draft" | "submitted";
      answerCount: number;
    };

export class ResearchRepositoryError extends Error {
  constructor(
    public readonly code: "RPC_FAILED" | "INVALID_RPC_RESPONSE" | "LOOKUP_FAILED",
    message = "Research repository operation failed.",
    public readonly rpcCode?: string,
  ) {
    super(message);
    this.name = "ResearchRepositoryError";
  }
}

export type ResearchInvitationRecord = {
  studyCode: string;
  titleTh: string;
  titleEn: string | null;
  consentVersion: string;
  noticeVersion: string;
  purposeTh: string;
  participationTh: string;
  privacyTh: string;
  withdrawalTh: string;
  contactEmail: string;
  retentionUntil: string | null;
  collectionMode: string;
  instrument: ResearchInstrumentRecord;
};

export type ResearchInstrumentItemRecord = {
  itemId: string;
  itemCode: string;
  constructKey: string;
  promptTh: string;
  promptEn: string | null;
  answerType: string;
  options: unknown;
  displayOrder: number;
  isRequired: boolean;
};

export type ResearchInstrumentRecord = {
  instrumentId: string;
  versionNumber: number;
  instrumentKey: string;
  titleTh: string;
  titleEn: string | null;
  descriptionTh: string | null;
  descriptionEn: string | null;
  estimatedMinutes: number | null;
  items: ResearchInstrumentItemRecord[];
};

export type ResearchSessionAccessRecord = {
  researchSessionId: string;
  publicSessionCode: string;
  studyId: string;
  participantType: string;
  collectionMode: string;
  status: string;
  inclusionStatus: string;
  visitId: string | null;
  checkinCodeId: number | null;
  withdrawnAt: string | null;
};

export type ResearchResponseSnapshotRecord = {
  status: "draft" | "submitted";
  startedAt: string;
  submittedAt: string | null;
  answers: Array<{
    itemId: string;
    integerValue: number | null;
    textValue: string | null;
    booleanValue: boolean | null;
  }>;
};

export type ResearchOperatorTaskRecord = {
  taskId: string;
  taskCode: string;
  versionNumber: number;
  titleTh: string;
  titleEn: string | null;
  instructionTh: string;
  instructionEn: string | null;
  displayOrder: number;
  maximumMinutes: number | null;
};

export type ResearchOperatorAttemptRecord = {
  taskId: string;
  status: "not_started" | "in_progress" | "completed" | "skipped" | "abandoned";
  confidence: number | null;
  rationale: string | null;
  startedAt: string | null;
  completedAt: string | null;
};

type RpcObject = Record<string, unknown>;

type ResearchStudyRow = {
  research_study_id: string;
  study_code: string;
  title_th: string;
  title_en: string | null;
  consent_version: string;
  notice_version: string;
  purpose_th: string;
  participation_th: string;
  privacy_th: string;
  withdrawal_th: string;
  contact_email: string;
  status: string;
  frozen_at: string | null;
  starts_at: string | null;
  ends_at: string | null;
  retention_until: string | null;
};

type ResearchInstrumentRow = {
  research_instrument_id: string;
  version_number: number;
  instrument_key: string;
  title_th: string;
  title_en: string | null;
  description_th: string | null;
  description_en: string | null;
  estimated_minutes: number | null;
};

type ResearchCheckinRow = {
  checkin_code_id: number;
  code: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

type ResearchDeploymentRow = {
  study_id: string;
  checkin_code_id: number;
  default_collection_mode: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
};

type ResearchItemRow = {
  research_item_id: string;
  item_code: string;
  construct_key: string;
  prompt_th: string;
  prompt_en: string | null;
  answer_type: string;
  options_json: unknown;
  display_order: number;
  is_required: boolean;
};

type ResearchSessionRow = {
  research_session_id: string;
  public_session_code: string;
  study_id: string;
  participant_type: string;
  collection_mode: string;
  status: string;
  inclusion_status: string;
  visit_id: string | null;
  checkin_code_id: number | null;
  withdrawn_at: string | null;
};

type ResearchResponseRow = {
  research_response_id: string;
  status: "draft" | "submitted";
  started_at: string;
  submitted_at: string | null;
};

type ResearchAnswerRow = {
  item_id: string;
  integer_value: number | null;
  text_value: string | null;
  boolean_value: boolean | null;
};

type ResearchOperatorTaskRow = {
  research_operator_task_id: string;
  task_code: string;
  version_number: number;
  title_th: string;
  title_en: string | null;
  instruction_th: string;
  instruction_en: string | null;
  display_order: number;
  maximum_minutes: number | null;
};

type ResearchOperatorAttemptRow = {
  research_operator_task_id: string;
  status: ResearchOperatorAttemptRecord["status"];
  confidence: number | null;
  rationale: string | null;
  started_at: string | null;
  completed_at: string | null;
};

function asObject(value: unknown): RpcObject | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as RpcObject : null;
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function parseRpcBase(value: unknown): RpcObject {
  const object = asObject(value);
  if (!object || typeof object.success !== "boolean") {
    throw new ResearchRepositoryError("INVALID_RPC_RESPONSE");
  }
  return object;
}

function parseFailure(object: RpcObject): ResearchRpcFailure {
  if (object.success !== false || typeof object.error_code !== "string") {
    throw new ResearchRepositoryError("INVALID_RPC_RESPONSE");
  }
  return { success: false, errorCode: object.error_code };
}

async function callRpc(name: string, args: Record<string, unknown>) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new ResearchRepositoryError("RPC_FAILED", "Research RPC failed.");
  return parseRpcBase(data);
}

export async function acceptResearchInvitation(params: {
  studyCode: string;
  checkinCode: string;
  operationalSessionHash: string;
  accessTokenHash: string;
  withdrawalTokenHash: string;
  language: string | null;
}): Promise<ResearchAcceptRpcResult> {
  const object = await callRpc("accept_research_invitation", {
    p_study_code: params.studyCode,
    p_checkin_code: params.checkinCode,
    p_operational_session_hash: params.operationalSessionHash,
    p_access_token_hash: params.accessTokenHash,
    p_withdrawal_token_hash: params.withdrawalTokenHash,
    p_language: params.language,
  });

  if (object.success === false) return parseFailure(object);
  if (
    typeof object.already_exists !== "boolean" ||
    !isUuid(object.public_session_code) ||
    typeof object.collection_mode !== "string"
  ) {
    throw new ResearchRepositoryError("INVALID_RPC_RESPONSE");
  }

  return {
    success: true,
    alreadyExists: object.already_exists,
    publicSessionCode: object.public_session_code,
    collectionMode: object.collection_mode,
  };
}

export async function acceptResearchOperatorInvitation(params: {
  studyCode: string;
  idempotencyKey: string;
  participantType: "operator" | "attraction_manager";
  collectionMode: "field_observation" | "simulated_usability" | "pilot_internal";
  accessTokenHash: string;
  withdrawalTokenHash: string;
  language: string | null;
  processedBy: string;
}): Promise<ResearchOperatorAcceptRpcResult> {
  const object = await callRpc("accept_research_operator_invitation", {
    p_study_code: params.studyCode,
    p_idempotency_key: params.idempotencyKey,
    p_participant_type: params.participantType,
    p_collection_mode: params.collectionMode,
    p_access_token_hash: params.accessTokenHash,
    p_withdrawal_token_hash: params.withdrawalTokenHash,
    p_language: params.language,
    p_processed_by: params.processedBy,
  });

  if (object.success === false) return parseFailure(object);
  if (
    !isUuid(object.public_session_code)
    || typeof object.collection_mode !== "string"
    || !["operator", "attraction_manager"].includes(String(object.participant_type))
  ) {
    throw new ResearchRepositoryError("INVALID_RPC_RESPONSE");
  }
  return {
    success: true,
    publicSessionCode: object.public_session_code,
    collectionMode: object.collection_mode,
    participantType: object.participant_type as "operator" | "attraction_manager",
  };
}

export async function saveResearchOperatorAttempt(params: {
  publicSessionCode: string;
  accessTokenHash: string;
  taskCode: string;
  status: "in_progress" | "completed" | "skipped" | "abandoned";
  confidence?: number | null;
  rationale?: string;
}): Promise<ResearchOperatorAttemptRpcResult> {
  const object = await callRpc("save_research_operator_attempt", {
    p_public_session_code: params.publicSessionCode,
    p_access_token_hash: params.accessTokenHash,
    p_task_code: params.taskCode,
    p_status: params.status,
    p_confidence: params.confidence ?? null,
    p_rationale: params.rationale ?? null,
  });

  if (object.success === false) return parseFailure(object);
  if (!isUuid(object.attempt_id) || !["in_progress", "completed", "skipped", "abandoned"].includes(String(object.status))) {
    throw new ResearchRepositoryError("INVALID_RPC_RESPONSE");
  }
  return {
    success: true,
    attemptId: object.attempt_id,
    status: object.status as "in_progress" | "completed" | "skipped" | "abandoned",
  };
}

export async function linkResearchSessionVisit(params: {
  publicSessionCode: string;
  accessTokenHash: string;
  visitId: string;
  touristId: string;
}): Promise<ResearchLinkRpcResult> {
  const object = await callRpc("link_research_session_visit", {
    p_public_session_code: params.publicSessionCode,
    p_access_token_hash: params.accessTokenHash,
    p_visit_id: params.visitId,
    p_tourist_id: params.touristId,
  });

  if (object.success === false) return parseFailure(object);
  if (!isUuid(object.research_session_id)) {
    throw new ResearchRepositoryError("INVALID_RPC_RESPONSE");
  }
  return { success: true, researchSessionId: object.research_session_id };
}

export async function withdrawResearchSession(params: {
  publicSessionCode: string;
  withdrawalTokenHash: string;
  reason?: string;
  source: string;
}): Promise<ResearchWithdrawalRpcResult> {
  const object = await callRpc("withdraw_research_session", {
    p_public_session_code: params.publicSessionCode,
    p_withdrawal_token_hash: params.withdrawalTokenHash,
    p_reason: params.reason ?? null,
    p_source: params.source,
  });

  if (object.success === false) return parseFailure(object);
  if (typeof object.already_withdrawn !== "boolean") {
    throw new ResearchRepositoryError("INVALID_RPC_RESPONSE");
  }
  return { success: true, alreadyWithdrawn: object.already_withdrawn };
}

export async function saveResearchResponse(params: {
  publicSessionCode: string;
  accessTokenHash: string;
  instrumentKey: string;
  answers: ResearchResponseAnswerPayload[];
  submit: boolean;
}): Promise<ResearchResponseRpcResult> {
  const object = await callRpc("save_research_response", {
    p_public_session_code: params.publicSessionCode,
    p_access_token_hash: params.accessTokenHash,
    p_instrument_key: params.instrumentKey,
    p_answers: params.answers,
    p_submit: params.submit,
  });

  if (object.success === false) return parseFailure(object);
  if (
    !isUuid(object.response_id)
    || !["draft", "submitted"].includes(String(object.status))
    || typeof object.answer_count !== "number"
    || !Number.isInteger(object.answer_count)
    || object.answer_count < 0
    || object.answer_count > 100
  ) {
    throw new ResearchRepositoryError("INVALID_RPC_RESPONSE");
  }

  return {
    success: true,
    responseId: object.response_id,
    status: object.status as "draft" | "submitted",
    answerCount: object.answer_count,
  };
}

function isInWindow(startsAt: string | null, endsAt: string | null, now: number) {
  return (!startsAt || new Date(startsAt).getTime() <= now) && (!endsAt || new Date(endsAt).getTime() > now);
}

async function readMaybeSingle<T>(query: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const result = await query;
  if (result.error) throw new ResearchRepositoryError("LOOKUP_FAILED", "Research lookup failed.");
  return result.data;
}

export async function getPublishedResearchInstrument(
  studyId: string,
  audience: "tourist" | "operator" | "attraction_manager",
): Promise<ResearchInstrumentRecord | null> {
  const supabase = createSupabaseServiceRoleClient();
  const instrument = await readMaybeSingle<ResearchInstrumentRow>(
    supabase
      .from("research_instruments")
      .select("research_instrument_id, version_number, instrument_key, title_th, title_en, description_th, description_en, estimated_minutes")
      .eq("study_id", studyId)
      .eq("audience", audience)
      .eq("status", "published")
      .not("frozen_at", "is", null)
      .order("version_number", { ascending: false })
      .limit(1)
      .maybeSingle(),
  );

  if (!instrument) return null;

  const itemsResult = await supabase
    .from("research_items")
    .select("research_item_id, item_code, construct_key, prompt_th, prompt_en, answer_type, options_json, display_order, is_required")
    .eq("instrument_id", instrument.research_instrument_id)
    .order("display_order", { ascending: true });
  if (itemsResult.error) throw new ResearchRepositoryError("LOOKUP_FAILED", "Research item lookup failed.");

  const itemRows = (itemsResult.data ?? []) as ResearchItemRow[];

  return {
    instrumentId: instrument.research_instrument_id,
    versionNumber: instrument.version_number,
    instrumentKey: instrument.instrument_key,
    titleTh: instrument.title_th,
    titleEn: instrument.title_en ?? null,
    descriptionTh: instrument.description_th ?? null,
    descriptionEn: instrument.description_en ?? null,
    estimatedMinutes: instrument.estimated_minutes ?? null,
    items: itemRows.map((item) => ({
          itemId: item.research_item_id,
          itemCode: item.item_code,
          constructKey: item.construct_key,
          promptTh: item.prompt_th,
          promptEn: item.prompt_en ?? null,
          answerType: item.answer_type,
          options: item.options_json ?? null,
          displayOrder: item.display_order,
          isRequired: item.is_required,
        })),
  };
}

export async function getPublishedTouristInstrument(studyId: string): Promise<ResearchInstrumentRecord | null> {
  return getPublishedResearchInstrument(studyId, "tourist");
}

export async function getPublishedResearchOperatorTasks(
  studyId: string,
  audience: "operator" | "attraction_manager",
): Promise<ResearchOperatorTaskRecord[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("research_operator_tasks")
    .select("research_operator_task_id, task_code, version_number, title_th, title_en, instruction_th, instruction_en, display_order, maximum_minutes")
    .eq("study_id", studyId)
    .eq("audience", audience)
    .eq("status", "published")
    .not("frozen_at", "is", null)
    .order("display_order", { ascending: true });
  if (error) throw new ResearchRepositoryError("LOOKUP_FAILED", "Research operator task lookup failed.");
  return ((data ?? []) as ResearchOperatorTaskRow[]).map((task) => ({
    taskId: task.research_operator_task_id,
    taskCode: task.task_code,
    versionNumber: task.version_number,
    titleTh: task.title_th,
    titleEn: task.title_en ?? null,
    instructionTh: task.instruction_th,
    instructionEn: task.instruction_en ?? null,
    displayOrder: task.display_order,
    maximumMinutes: task.maximum_minutes ?? null,
  }));
}

export async function getResearchOperatorAttempts(
  researchSessionId: string,
): Promise<ResearchOperatorAttemptRecord[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("research_operator_task_attempts")
    .select("research_operator_task_id, status, confidence, rationale, started_at, completed_at")
    .eq("research_session_id", researchSessionId);
  if (error) throw new ResearchRepositoryError("LOOKUP_FAILED", "Research operator attempt lookup failed.");
  return ((data ?? []) as ResearchOperatorAttemptRow[]).map((attempt) => ({
    taskId: attempt.research_operator_task_id,
    status: attempt.status,
    confidence: attempt.confidence ?? null,
    rationale: attempt.rationale ?? null,
    startedAt: attempt.started_at ?? null,
    completedAt: attempt.completed_at ?? null,
  }));
}

export async function getActiveResearchInvitation(studyCode: string, checkinCode: string): Promise<ResearchInvitationRecord | null> {
  const supabase = createSupabaseServiceRoleClient();
  const study = await readMaybeSingle<ResearchStudyRow>(
    supabase
      .from("research_studies")
      .select("research_study_id, study_code, title_th, title_en, consent_version, notice_version, purpose_th, participation_th, privacy_th, withdrawal_th, contact_email, status, frozen_at, starts_at, ends_at, retention_until")
      .eq("study_code", studyCode)
      .maybeSingle(),
  );
  if (!study || study.status !== "active" || !study.frozen_at || !isInWindow(study.starts_at, study.ends_at, Date.now())) {
    return null;
  }

  const checkin = await readMaybeSingle<ResearchCheckinRow>(
    supabase
      .from("checkin_codes")
      .select("checkin_code_id, code, is_active, starts_at, ends_at")
      .eq("code", checkinCode)
      .maybeSingle(),
  );
  if (!checkin || !checkin.is_active || !isInWindow(checkin.starts_at, checkin.ends_at, Date.now())) return null;

  const deployment = await readMaybeSingle<ResearchDeploymentRow>(
    supabase
      .from("research_checkin_codes")
      .select("study_id, checkin_code_id, default_collection_mode, is_active, starts_at, ends_at")
      .eq("study_id", study.research_study_id)
      .eq("checkin_code_id", checkin.checkin_code_id)
      .maybeSingle(),
  );
  if (!deployment || !deployment.is_active || !isInWindow(deployment.starts_at, deployment.ends_at, Date.now())) return null;

  const instrument = await getPublishedTouristInstrument(study.research_study_id);
  if (!instrument) return null;

  return {
    studyCode: study.study_code,
    titleTh: study.title_th,
    titleEn: study.title_en ?? null,
    consentVersion: study.consent_version,
    noticeVersion: study.notice_version,
    purposeTh: study.purpose_th,
    participationTh: study.participation_th,
    privacyTh: study.privacy_th,
    withdrawalTh: study.withdrawal_th,
    contactEmail: study.contact_email,
    retentionUntil: study.retention_until ?? null,
    collectionMode: deployment.default_collection_mode,
    instrument,
  };
}

export async function getActiveResearchInvitationForCheckin(
  checkinCode: string,
): Promise<ResearchInvitationRecord | null> {
  const supabase = createSupabaseServiceRoleClient();
  const now = Date.now();
  const checkin = await readMaybeSingle<ResearchCheckinRow>(
    supabase
      .from("checkin_codes")
      .select("checkin_code_id, code, is_active, starts_at, ends_at")
      .eq("code", checkinCode)
      .maybeSingle(),
  );
  if (!checkin || !checkin.is_active || !isInWindow(checkin.starts_at, checkin.ends_at, now)) return null;

  const deployment = await readMaybeSingle<ResearchDeploymentRow>(
    supabase
      .from("research_checkin_codes")
      .select("study_id, checkin_code_id, default_collection_mode, is_active, starts_at, ends_at")
      .eq("checkin_code_id", checkin.checkin_code_id)
      .eq("is_active", true)
      .maybeSingle(),
  );
  if (!deployment || !isInWindow(deployment.starts_at, deployment.ends_at, now)) return null;

  const study = await readMaybeSingle<ResearchStudyRow>(
    supabase
      .from("research_studies")
      .select("research_study_id, study_code, title_th, title_en, consent_version, notice_version, purpose_th, participation_th, privacy_th, withdrawal_th, contact_email, status, frozen_at, starts_at, ends_at, retention_until")
      .eq("research_study_id", deployment.study_id)
      .maybeSingle(),
  );
  if (!study || study.status !== "active" || !study.frozen_at || !isInWindow(study.starts_at, study.ends_at, now)) {
    return null;
  }

  const instrument = await getPublishedTouristInstrument(study.research_study_id);
  if (!instrument) return null;

  return {
    studyCode: study.study_code,
    titleTh: study.title_th,
    titleEn: study.title_en ?? null,
    consentVersion: study.consent_version,
    noticeVersion: study.notice_version,
    purposeTh: study.purpose_th,
    participationTh: study.participation_th,
    privacyTh: study.privacy_th,
    withdrawalTh: study.withdrawal_th,
    contactEmail: study.contact_email,
    retentionUntil: study.retention_until ?? null,
    collectionMode: deployment.default_collection_mode,
    instrument,
  };
}

export async function getResearchSessionForAccess(
  publicSessionCode: string,
  accessTokenHash: string,
): Promise<ResearchSessionAccessRecord | null> {
  const supabase = createSupabaseServiceRoleClient();
  const session = await readMaybeSingle<ResearchSessionRow>(
    supabase
      .from("research_sessions")
      .select("research_session_id, public_session_code, study_id, participant_type, collection_mode, status, inclusion_status, visit_id, checkin_code_id, withdrawn_at")
      .eq("public_session_code", publicSessionCode)
      .eq("access_token_hash", accessTokenHash)
      .maybeSingle(),
  );
  if (!session) return null;

  return {
    researchSessionId: session.research_session_id,
    publicSessionCode: session.public_session_code,
    studyId: session.study_id,
    participantType: session.participant_type,
    collectionMode: session.collection_mode,
    status: session.status,
    inclusionStatus: session.inclusion_status,
    visitId: session.visit_id ?? null,
    checkinCodeId: session.checkin_code_id ?? null,
    withdrawnAt: session.withdrawn_at ?? null,
  };
}

export async function getResearchResponseSnapshot(
  researchSessionId: string,
  instrumentId: string,
): Promise<ResearchResponseSnapshotRecord | null> {
  const supabase = createSupabaseServiceRoleClient();
  const response = await readMaybeSingle<ResearchResponseRow>(
    supabase
      .from("research_responses")
      .select("research_response_id, status, started_at, submitted_at")
      .eq("research_session_id", researchSessionId)
      .eq("instrument_id", instrumentId)
      .maybeSingle(),
  );
  if (!response) return null;

  const answersResult = await supabase
    .from("research_answers")
    .select("item_id, integer_value, text_value, boolean_value")
    .eq("response_id", response.research_response_id);
  if (answersResult.error) {
    throw new ResearchRepositoryError("LOOKUP_FAILED", "Research answer lookup failed.");
  }

  return {
    status: response.status,
    startedAt: response.started_at,
    submittedAt: response.submitted_at ?? null,
    answers: ((answersResult.data ?? []) as ResearchAnswerRow[]).map((answer) => ({
      itemId: answer.item_id,
      integerValue: answer.integer_value ?? null,
      textValue: answer.text_value ?? null,
      booleanValue: answer.boolean_value ?? null,
    })),
  };
}
