import "server-only";

import {
  clearResearchSessionCredentials,
  createResearchCredentials,
  getResearchOperationalSessionToken,
  getResearchSessionCredentials,
  hashResearchToken,
  setResearchSessionCredentials,
} from "@/lib/auth/research-session";
import { requirePermission, requireTouristVisitAccess } from "@/lib/auth/guards";
import { getAdminResearchStudyDetail } from "@/lib/repositories/admin-research.repository";
import {
  acceptResearchInvitation as acceptResearchInvitationRpc,
  acceptResearchOperatorInvitation as acceptResearchOperatorInvitationRpc,
  getActiveResearchInvitation,
  getActiveResearchInvitationForCheckin,
  getPublishedResearchInstrument,
  getPublishedResearchOperatorTasks,
  getResearchOperatorAttempts,
  getResearchResponseSnapshot,
  getResearchSessionForAccess,
  linkResearchSessionVisit as linkResearchSessionVisitRpc,
  saveResearchResponse as saveResearchResponseRpc,
  saveResearchOperatorAttempt as saveResearchOperatorAttemptRpc,
  withdrawResearchSession as withdrawResearchSessionRpc,
} from "@/lib/repositories/research.repository";
import {
  researchAcceptanceSchema,
  researchInvitationSchema,
  researchOperatorAcceptanceSchema,
  researchOperatorAttemptSchema,
  researchVisitLinkSchema,
  researchResponseInputSchema,
  researchWithdrawalSchema,
  redactResearchFreeText,
  type ResearchAcceptanceInput,
  type ResearchAnswerInput,
  type ResearchInvitationInput,
  type ResearchOperatorAcceptanceInput,
  type ResearchOperatorAttemptInput,
  type ResearchVisitLinkInput,
  type ResearchResponseInput,
  type ResearchWithdrawalInput,
} from "@/lib/validation/research";

export type ResearchServiceErrorCode =
  | "INVALID_INPUT"
  | "CONSENT_REQUIRED"
  | "INVITATION_UNAVAILABLE"
  | "SESSION_NOT_FOUND"
  | "SESSION_NOT_ELIGIBLE"
  | "VISIT_NOT_FOUND"
  | "VISIT_ACCESS_DENIED"
  | "VISIT_MISMATCH"
  | "WITHDRAWAL_INVALID"
  | "EVALUATION_INCOMPLETE"
  | "EVALUATION_ALREADY_SUBMITTED"
  | "OPERATOR_TASK_INCOMPLETE"
  | "RESEARCH_UNAVAILABLE";

export class ResearchServiceError extends Error {
  constructor(public readonly code: ResearchServiceErrorCode, message: string) {
    super(message);
    this.name = "ResearchServiceError";
  }
}

const THAI_MESSAGES: Record<ResearchServiceErrorCode, string> = {
  INVALID_INPUT: "ข้อมูลแบบประเมินไม่ถูกต้อง",
  CONSENT_REQUIRED: "กรุณายืนยันความยินยอมเพื่อเข้าร่วมการวิจัย",
  INVITATION_UNAVAILABLE: "แบบประเมินการวิจัยนี้ไม่พร้อมใช้งานแล้ว",
  SESSION_NOT_FOUND: "ไม่พบเซสชันการวิจัยหรือข้อมูลยืนยันไม่ถูกต้อง",
  SESSION_NOT_ELIGIBLE: "เซสชันการวิจัยนี้ไม่พร้อมสำหรับการดำเนินการต่อ",
  VISIT_NOT_FOUND: "ไม่พบข้อมูลการเข้าชมนี้",
  VISIT_ACCESS_DENIED: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลการเข้าชมนี้",
  VISIT_MISMATCH: "ไม่สามารถเชื่อมโยงการเข้าชมกับเซสชันวิจัยนี้ได้",
  WITHDRAWAL_INVALID: "ไม่สามารถถอนความยินยอมได้ กรุณาลองใหม่อีกครั้ง",
  EVALUATION_INCOMPLETE: "กรุณาตอบคำถามที่จำเป็นให้ครบก่อนส่งแบบประเมิน",
  EVALUATION_ALREADY_SUBMITTED: "แบบประเมินนี้ถูกส่งเรียบร้อยแล้ว",
  OPERATOR_TASK_INCOMPLETE: "กรุณาระบุเหตุผลและระดับความมั่นใจก่อนบันทึกงานตัดสินใจ",
  RESEARCH_UNAVAILABLE: "ระบบวิจัยไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง",
};

function serviceError(code: ResearchServiceErrorCode) {
  return new ResearchServiceError(code, THAI_MESSAGES[code]);
}

function parseOrThrow<T>(schema: { safeParse: (input: unknown) => { success: boolean; data?: T } }, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw serviceError("INVALID_INPUT");
  return result.data as T;
}

function mapRepositoryError(error: unknown): never {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    ["RPC_FAILED", "INVALID_RPC_RESPONSE", "LOOKUP_FAILED"].includes((error as { code?: unknown }).code as string)
  ) {
    throw serviceError("RESEARCH_UNAVAILABLE");
  }
  throw error;
}

function mapRpcFailure(errorCode: string): never {
  switch (errorCode) {
    case "RESEARCH_STUDY_UNAVAILABLE":
    case "RESEARCH_INVITATION_INVALID":
      throw serviceError("INVITATION_UNAVAILABLE");
    case "RESEARCH_SESSION_NOT_FOUND":
      throw serviceError("SESSION_NOT_FOUND");
    case "RESEARCH_VISIT_MISMATCH":
      throw serviceError("VISIT_MISMATCH");
    case "RESEARCH_WITHDRAWAL_INVALID":
      throw serviceError("WITHDRAWAL_INVALID");
    case "RESEARCH_REQUIRED_ANSWER_MISSING":
      throw serviceError("EVALUATION_INCOMPLETE");
    case "RESEARCH_RESPONSE_ALREADY_SUBMITTED":
      throw serviceError("EVALUATION_ALREADY_SUBMITTED");
    case "RESEARCH_SESSION_CONFLICT":
    case "RESEARCH_OPERATOR_SESSION_CONFLICT":
      throw serviceError("RESEARCH_UNAVAILABLE");
    case "RESEARCH_OPERATOR_STUDY_UNAVAILABLE":
    case "RESEARCH_OPERATOR_INVITATION_INVALID":
      throw serviceError("INVITATION_UNAVAILABLE");
    case "RESEARCH_OPERATOR_SESSION_NOT_FOUND":
      throw serviceError("SESSION_NOT_FOUND");
    case "RESEARCH_OPERATOR_ATTEMPT_INVALID":
      throw serviceError("OPERATOR_TASK_INCOMPLETE");
    default:
      throw serviceError("RESEARCH_UNAVAILABLE");
  }
}

function publicInvitation(invitation: Awaited<ReturnType<typeof getActiveResearchInvitation>>) {
  if (!invitation) return null;
  return {
    studyCode: invitation.studyCode,
    titleTh: invitation.titleTh,
    titleEn: invitation.titleEn,
    consentVersion: invitation.consentVersion,
    noticeVersion: invitation.noticeVersion,
    purposeTh: invitation.purposeTh,
    participationTh: invitation.participationTh,
    privacyTh: invitation.privacyTh,
    withdrawalTh: invitation.withdrawalTh,
    contactEmail: invitation.contactEmail,
    retentionUntil: invitation.retentionUntil,
    collectionMode: invitation.collectionMode,
    instrument: {
      versionNumber: invitation.instrument.versionNumber,
      instrumentKey: invitation.instrument.instrumentKey,
      titleTh: invitation.instrument.titleTh,
      titleEn: invitation.instrument.titleEn,
      descriptionTh: invitation.instrument.descriptionTh,
      descriptionEn: invitation.instrument.descriptionEn,
      estimatedMinutes: invitation.instrument.estimatedMinutes,
    },
  };
}

export async function hasCurrentResearchParticipation() {
  const credentials = await getResearchSessionCredentials();
  if (!credentials) return false;
  try {
    const session = await getResearchSessionForAccess(
      credentials.publicSessionCode,
      hashResearchToken(credentials.accessToken),
    );
    return Boolean(session && !session.withdrawnAt && !["withdrawn", "excluded", "expired"].includes(session.status));
  } catch {
    return false;
  }
}

async function requireCurrentResearchSession(options?: {
  allowCompleted?: boolean;
  participantTypes?: Array<"tourist" | "operator" | "attraction_manager">;
}) {
  const credentials = await getResearchSessionCredentials();
  if (!credentials) throw serviceError("SESSION_NOT_FOUND");

  let session: Awaited<ReturnType<typeof getResearchSessionForAccess>>;
  try {
    session = await getResearchSessionForAccess(
      credentials.publicSessionCode,
      hashResearchToken(credentials.accessToken),
    );
  } catch (error) {
    return mapRepositoryError(error);
  }

  const allowedStatuses = options?.allowCompleted
    ? ["consented", "in_progress", "completed"]
    : ["consented", "in_progress"];
  if (
    !session
    || !(options?.participantTypes ?? ["tourist", "operator", "attraction_manager"]).includes(
      session.participantType as "tourist" | "operator" | "attraction_manager",
    )
    || !allowedStatuses.includes(session.status)
    || session.withdrawnAt
  ) {
    throw serviceError("SESSION_NOT_ELIGIBLE");
  }

  if (session.participantType === "tourist") {
    if (!session.visitId) throw serviceError("SESSION_NOT_ELIGIBLE");
    try {
      await requireTouristVisitAccess(session.visitId);
    } catch (error) {
      return mapTouristAccessError(error);
    }
  }

  return { credentials, session };
}

export async function getCurrentResearchEvaluation() {
  const current = await requireCurrentResearchSession({ allowCompleted: true });
  let instrument: Awaited<ReturnType<typeof getPublishedResearchInstrument>>;
  try {
    instrument = await getPublishedResearchInstrument(
      current.session.studyId,
      current.session.participantType as "tourist" | "operator" | "attraction_manager",
    );
  } catch (error) {
    return mapRepositoryError(error);
  }
  if (!instrument) throw serviceError("RESEARCH_UNAVAILABLE");

  let response: Awaited<ReturnType<typeof getResearchResponseSnapshot>>;
  try {
    response = await getResearchResponseSnapshot(
      current.session.researchSessionId,
      instrument.instrumentId,
    );
  } catch (error) {
    return mapRepositoryError(error);
  }

  const itemCodeById = new Map(instrument.items.map((item) => [item.itemId, item.itemCode]));
  const savedAnswers = (response?.answers ?? []).reduce<ResearchAnswerInput[]>((answers, answer) => {
    const itemCode = itemCodeById.get(answer.itemId);
    if (!itemCode) return answers;
    if (answer.integerValue !== null) answers.push({ itemCode, integerValue: answer.integerValue });
    else if (answer.textValue !== null) answers.push({ itemCode, textValue: answer.textValue });
    else if (answer.booleanValue !== null) answers.push({ itemCode, booleanValue: answer.booleanValue });
    return answers;
  }, []);

  return {
    visitId: current.session.visitId,
    participantType: current.session.participantType as "tourist" | "operator" | "attraction_manager",
    versionNumber: instrument.versionNumber,
    instrumentKey: instrument.instrumentKey,
    titleTh: instrument.titleTh,
    titleEn: instrument.titleEn,
    descriptionTh: instrument.descriptionTh,
    descriptionEn: instrument.descriptionEn,
    estimatedMinutes: instrument.estimatedMinutes,
    status: response?.status ?? current.session.status,
    savedAnswers,
    items: instrument.items.map((item) => ({
      itemCode: item.itemCode,
      constructKey: item.constructKey,
      promptTh: item.promptTh,
      promptEn: item.promptEn,
      answerType: item.answerType,
      options: item.options,
      displayOrder: item.displayOrder,
      isRequired: item.isRequired,
    })),
  };
}

function toRepositoryAnswer(answer: ResearchResponseInput["answers"][number]) {
  if ("integerValue" in answer) {
    return { item_code: answer.itemCode, integer_value: answer.integerValue } as const;
  }
  if ("textValue" in answer) {
    return { item_code: answer.itemCode, text_value: redactResearchFreeText(answer.textValue) } as const;
  }
  return { item_code: answer.itemCode, boolean_value: answer.booleanValue } as const;
}

export async function saveCurrentResearchResponse(input: ResearchResponseInput) {
  const parsed = parseOrThrow(researchResponseInputSchema, input);
  const current = await requireCurrentResearchSession();

  let result: Awaited<ReturnType<typeof saveResearchResponseRpc>>;
  try {
    result = await saveResearchResponseRpc({
      publicSessionCode: current.credentials.publicSessionCode,
      accessTokenHash: hashResearchToken(current.credentials.accessToken),
      instrumentKey: parsed.instrumentKey,
      answers: parsed.answers.map(toRepositoryAnswer),
      submit: parsed.submit,
    });
  } catch (error) {
    return mapRepositoryError(error);
  }
  if (!result.success) mapRpcFailure(result.errorCode);

  return {
    saved: true as const,
    status: result.status,
    answerCount: result.answerCount,
  };
}

export async function getCurrentResearchOperatorWorkspace() {
  const current = await requireCurrentResearchSession({
    allowCompleted: true,
    participantTypes: ["operator", "attraction_manager"],
  });
  const audience = current.session.participantType as "operator" | "attraction_manager";
  try {
    const [tasks, attempts] = await Promise.all([
      getPublishedResearchOperatorTasks(current.session.studyId, audience),
      getResearchOperatorAttempts(current.session.researchSessionId),
    ]);
    const attemptByTask = new Map(attempts.map((attempt) => [attempt.taskId, attempt]));
    return {
      participantType: audience,
      status: current.session.status,
      tasks: tasks.map((task) => ({ ...task, attempt: attemptByTask.get(task.taskId) ?? null })),
      completedTasks: tasks.filter((task) => ["completed", "skipped"].includes(attemptByTask.get(task.taskId)?.status ?? "")).length,
    };
  } catch (error) {
    return mapRepositoryError(error);
  }
}

export async function acceptFacilitatedResearchOperator(input: ResearchOperatorAcceptanceInput) {
  const parsed = parseOrThrow(researchOperatorAcceptanceSchema, input);
  const guard = await requirePermission("research.manage");
  const detail = await getAdminResearchStudyDetail(parsed.studyId);
  if (!detail || detail.study.studyCode !== parsed.studyCode || detail.study.status !== "active") {
    throw serviceError("INVITATION_UNAVAILABLE");
  }
  if (detail.study.studyKind === "pilot" && parsed.collectionMode === "field_observation") {
    throw serviceError("INVITATION_UNAVAILABLE");
  }
  if (detail.study.studyKind === "final_collection" && parsed.collectionMode !== "field_observation") {
    throw serviceError("INVITATION_UNAVAILABLE");
  }
  const credentials = createResearchCredentials("00000000-0000-4000-8000-000000000000");
  let result: Awaited<ReturnType<typeof acceptResearchOperatorInvitationRpc>>;
  try {
    result = await acceptResearchOperatorInvitationRpc({
      studyCode: parsed.studyCode,
      idempotencyKey: parsed.idempotencyKey,
      participantType: parsed.participantType,
      collectionMode: parsed.collectionMode,
      accessTokenHash: credentials.accessTokenHash,
      withdrawalTokenHash: credentials.withdrawalTokenHash,
      language: parsed.language,
      processedBy: guard.actor.adminId,
    });
  } catch (error) {
    return mapRepositoryError(error);
  }
  if (!result.success) mapRpcFailure(result.errorCode);
  await setResearchSessionCredentials({ ...credentials, publicSessionCode: result.publicSessionCode });
  return { accepted: true as const, participantType: result.participantType };
}

export async function saveCurrentResearchOperatorAttempt(input: ResearchOperatorAttemptInput) {
  const parsed = parseOrThrow(researchOperatorAttemptSchema, input);
  const current = await requireCurrentResearchSession({ participantTypes: ["operator", "attraction_manager"] });
  let result: Awaited<ReturnType<typeof saveResearchOperatorAttemptRpc>>;
  try {
    result = await saveResearchOperatorAttemptRpc({
      publicSessionCode: current.credentials.publicSessionCode,
      accessTokenHash: hashResearchToken(current.credentials.accessToken),
      taskCode: parsed.taskCode,
      status: parsed.status,
      confidence: parsed.confidence,
      rationale: parsed.rationale ? redactResearchFreeText(parsed.rationale) : undefined,
    });
  } catch (error) {
    return mapRepositoryError(error);
  }
  if (!result.success) mapRpcFailure(result.errorCode);
  return { saved: true as const, status: result.status };
}

export async function getOptionalResearchInvitation(input: ResearchInvitationInput) {
  const parsed = parseOrThrow(researchInvitationSchema, input);
  try {
    return publicInvitation(await getActiveResearchInvitation(parsed.studyCode, parsed.checkinCode));
  } catch (error) {
    return mapRepositoryError(error);
  }
}

export async function getOptionalResearchInvitationForCheckin(checkinCode: string) {
  if (await getResearchSessionCredentials()) return null;
  const parsed = parseOrThrow(researchInvitationSchema.pick({ checkinCode: true }), { checkinCode });
  try {
    return publicInvitation(await getActiveResearchInvitationForCheckin(parsed.checkinCode));
  } catch (error) {
    return mapRepositoryError(error);
  }
}

export async function linkCurrentResearchSessionVisitIfPresent(input: ResearchVisitLinkInput) {
  if (!(await getResearchSessionCredentials())) return { linked: false as const };
  await linkResearchSessionVisit(input);
  return { linked: true as const };
}

export const getResearchInvitation = getOptionalResearchInvitation;

export async function declineResearchInvitation() {
  return { declined: true as const };
}

export async function acceptResearchInvitation(input: ResearchAcceptanceInput) {
  if (!input || input.hasConsented !== true) throw serviceError("CONSENT_REQUIRED");
  const parsed = parseOrThrow(researchAcceptanceSchema, input);
  const operationalSessionToken = await getResearchOperationalSessionToken();
  const credentials = createResearchCredentials("00000000-0000-4000-8000-000000000000", operationalSessionToken);

  let result: Awaited<ReturnType<typeof acceptResearchInvitationRpc>>;
  try {
    result = await acceptResearchInvitationRpc({
      studyCode: parsed.studyCode,
      checkinCode: parsed.checkinCode,
      operationalSessionHash: hashResearchToken(operationalSessionToken),
      accessTokenHash: credentials.accessTokenHash,
      withdrawalTokenHash: credentials.withdrawalTokenHash,
      language: parsed.language ?? null,
    });
  } catch (error) {
    return mapRepositoryError(error);
  }
  if (!result.success) mapRpcFailure(result.errorCode);

  await setResearchSessionCredentials({ ...credentials, publicSessionCode: result.publicSessionCode });
  return {
    accepted: true as const,
    alreadyExists: result.alreadyExists,
    collectionMode: result.collectionMode,
  };
}

function mapTouristAccessError(error: unknown): never {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: string }).code;
    if (code === "VISIT_NOT_FOUND") throw serviceError("VISIT_NOT_FOUND");
    if (code === "VISIT_ACCESS_DENIED") throw serviceError("VISIT_ACCESS_DENIED");
  }
  throw error;
}

export async function linkResearchSessionVisit(input: ResearchVisitLinkInput) {
  const parsed = parseOrThrow(researchVisitLinkSchema, input);
  const credentials = await getResearchSessionCredentials();
  if (!credentials) throw serviceError("SESSION_NOT_FOUND");

  const session = await getResearchSessionForAccess(
    credentials.publicSessionCode,
    hashResearchToken(credentials.accessToken),
  );
  if (!session) throw serviceError("SESSION_NOT_FOUND");
  if (session.participantType !== "tourist" || !["consented", "in_progress"].includes(session.status) || session.withdrawnAt) {
    throw serviceError("SESSION_NOT_ELIGIBLE");
  }

  let access: Awaited<ReturnType<typeof requireTouristVisitAccess>>;
  try {
    access = await requireTouristVisitAccess(parsed.visitId);
  } catch (error) {
    return mapTouristAccessError(error);
  }

  let result: Awaited<ReturnType<typeof linkResearchSessionVisitRpc>>;
  try {
    result = await linkResearchSessionVisitRpc({
      publicSessionCode: credentials.publicSessionCode,
      accessTokenHash: hashResearchToken(credentials.accessToken),
      visitId: parsed.visitId,
      touristId: access.touristId,
    });
  } catch (error) {
    return mapRepositoryError(error);
  }
  if (!result.success) mapRpcFailure(result.errorCode);
  return { linked: true as const };
}

export async function withdrawResearchSession(input: ResearchWithdrawalInput = {}) {
  const parsed = parseOrThrow(researchWithdrawalSchema, input);
  const credentials = await getResearchSessionCredentials();
  if (!credentials) throw serviceError("SESSION_NOT_FOUND");

  let result: Awaited<ReturnType<typeof withdrawResearchSessionRpc>>;
  try {
    result = await withdrawResearchSessionRpc({
      publicSessionCode: credentials.publicSessionCode,
      withdrawalTokenHash: hashResearchToken(credentials.withdrawalToken),
      reason: parsed.reason,
      source: parsed.source ?? "tourist_withdrawal",
    });
  } catch (error) {
    return mapRepositoryError(error);
  }
  if (!result.success) mapRpcFailure(result.errorCode);

  await clearResearchSessionCredentials();
  return { withdrawn: true as const, alreadyWithdrawn: result.alreadyWithdrawn };
}
