import "server-only";

import { requirePermission } from "@/lib/auth/guards";
import * as repository from "@/lib/repositories/admin-research.repository";
import type {
  AdminResearchItem,
  AdminResearchStudyDetail,
  ResearchAnalyticsRows,
  ResearchCollectionMode,
  ResearchParticipantType,
  ResearchStudyStatus,
} from "@/lib/repositories/admin-research.repository";
import { logAuditAction } from "@/lib/services/audit-log.service";
import {
  adminResearchAnalyticsFiltersSchema,
  adminResearchApprovalSchema,
  adminResearchDeploymentSchema,
  adminResearchInstrumentDraftSchema,
  adminResearchItemCreateSchema,
  adminResearchOperatorTaskDraftSchema,
  adminResearchOperatorAssessmentSchema,
  adminResearchStudyActivationSchema,
  adminResearchStudyDraftCreateSchema,
  type AdminResearchAnalyticsFilters,
  type AdminResearchApprovalInput,
  type AdminResearchDeploymentInput,
  type AdminResearchInstrumentDraftInput,
  type AdminResearchItemCreateInput,
  type AdminResearchOperatorTaskDraftInput,
  type AdminResearchOperatorAssessmentInput,
  type AdminResearchStudyDraftCreateInput,
} from "@/lib/validation/admin-research";
import { redactResearchFreeText } from "@/lib/validation/research";

export const RESEARCH_SMALL_CELL_THRESHOLD = 10 as const;

export class AdminResearchServiceError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "AdminResearchServiceError";
  }
}

function fail(code: string, message: string): never {
  throw new AdminResearchServiceError(code, message);
}

function nullable(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export type ResearchReadinessItem = {
  key: string;
  label: string;
  ready: boolean;
  blockingReason: string;
};

export function assessResearchReadiness(detail: AdminResearchStudyDetail): ResearchReadinessItem[] {
  const study = detail.study;
  const touristInstruments = detail.instruments.filter((instrument) => instrument.audience === "tourist");
  const publishedTourist = touristInstruments.some((instrument) => instrument.status === "published" && instrument.frozenAt);
  const hasDraftConfiguration = detail.instruments.some((instrument) => instrument.status === "draft")
    || detail.operatorTasks.some((task) => task.status === "draft");
  const stakeholderAudiences = (["operator", "attraction_manager"] as const).filter((audience) =>
    detail.instruments.some((instrument) => instrument.audience === audience)
    || detail.operatorTasks.some((task) => task.audience === audience),
  );
  const stakeholderReady = stakeholderAudiences.length > 0 && stakeholderAudiences.every((audience) =>
    detail.instruments.some((instrument) => instrument.audience === audience && instrument.status === "published" && instrument.frozenAt)
    && detail.operatorTasks.some((task) => task.audience === audience && task.status === "published" && task.frozenAt),
  );
  return [
    {
      key: "advisor",
      label: "หลักฐานอนุมัติจากอาจารย์ที่ปรึกษา",
      ready: Boolean(study.advisorApprovedAt && study.approvalReference && study.approvalRecordedBy),
      blockingReason: "ต้องบันทึกวันที่และเลขอ้างอิงหลักฐานอนุมัติ",
    },
    {
      key: "ethics",
      label: "ข้อกำหนดด้านจริยธรรมการวิจัย",
      ready: study.ethicsReviewStatus === "not_required" || (study.ethicsReviewStatus === "approved" && Boolean(study.ethicsApprovedAt)),
      blockingReason: "ต้องระบุว่าไม่ต้องขอ หรือบันทึกวันที่อนุมัติจริยธรรม",
    },
    {
      key: "notice",
      label: "ประกาศความเป็นส่วนตัวและการถอนตัว",
      ready: [study.purposeTh, study.participationTh, study.privacyTh, study.withdrawalTh, study.contactEmail].every((value) => value.trim().length > 0),
      blockingReason: "รายละเอียดสำหรับผู้เข้าร่วมยังไม่ครบ",
    },
    {
      key: "retention",
      label: "วันสิ้นสุดการเก็บรักษาข้อมูล",
      ready: Boolean(study.retentionUntil),
      blockingReason: "ต้องระบุวันสิ้นสุดการเก็บรักษา",
    },
    {
      key: "instrument",
      label: "แบบประเมินนักท่องเที่ยวที่เผยแพร่และล็อกรุ่นแล้ว",
      ready: Boolean(publishedTourist),
      blockingReason: "ต้องมีแบบประเมินกลุ่มนักท่องเที่ยวที่เผยแพร่แล้วอย่างน้อย 1 รุ่น",
    },
    {
      key: "deployment",
      label: "จุด QR สำหรับเก็บข้อมูลที่เปิดใช้งาน",
      ready: detail.deployments.some((deployment) => deployment.isActive),
      blockingReason: "ต้องผูกจุด QR อย่างน้อย 1 จุดและเปิดใช้งาน",
    },
    {
      key: "stakeholder",
      label: "แบบประเมินและโจทย์ตัดสินใจสำหรับผู้มีส่วนได้ส่วนเสีย",
      ready: stakeholderReady,
      blockingReason: "ต้องมีอย่างน้อยหนึ่งกลุ่มระหว่างผู้ประกอบการหรือผู้ดูแลสถานที่ พร้อมทั้งแบบประเมินและโจทย์ที่เผยแพร่แล้ว",
    },
    {
      key: "drafts",
      label: "ไม่มีแบบประเมินหรืองานทดสอบฉบับร่างค้างอยู่",
      ready: !hasDraftConfiguration,
      blockingReason: "เผยแพร่หรือยกเลิกฉบับร่างทั้งหมดก่อนเริ่มเก็บข้อมูล",
    },
  ];
}

export async function getAdminResearchStudies() {
  await requirePermission("research.read");
  return repository.listAdminResearchStudies();
}

export function assertResearchStudyScope(studyId: string, filterStudyId: string) {
  if (studyId !== filterStudyId) fail("STUDY_SCOPE_MISMATCH", "ขอบเขตการวิเคราะห์ไม่ตรงกับโครงการวิจัย");
}

export async function getAdminResearchStudyWorkspace(studyId: string, filters?: AdminResearchAnalyticsFilters) {
  const guard = await requirePermission("research.read");
  if (filters) assertResearchStudyScope(studyId, filters.studyId);
  const detail = await repository.getAdminResearchStudyDetail(studyId);
  if (!detail) return null;
  const readiness = assessResearchReadiness(detail);
  const canManage = guard.actor.permissions.includes("research.manage");
  const [checkinCodes, operatorAssessments, analytics] = await Promise.all([
    canManage ? repository.listAvailableResearchCheckinCodes() : Promise.resolve([]),
    canManage ? repository.listResearchOperatorAssessments(studyId) : Promise.resolve([]),
    filters ? getResearchAnalytics(filters) : Promise.resolve(null),
  ]);
  return { detail, readiness, canActivate: readiness.every((item) => item.ready), canManage, checkinCodes, operatorAssessments, analytics };
}

export async function getAdminResearchOperatorStart(
  studyId: string,
  participantType: "operator" | "attraction_manager",
) {
  await requirePermission("research.manage");
  const detail = await repository.getAdminResearchStudyDetail(studyId);
  if (!detail || detail.study.status !== "active") return null;
  const instrument = detail.instruments.find((entry) => entry.audience === participantType && entry.status === "published" && entry.frozenAt);
  const tasks = detail.operatorTasks.filter((entry) => entry.audience === participantType && entry.status === "published" && entry.frozenAt);
  if (!instrument || tasks.length === 0) return null;
  return {
    studyId,
    studyCode: detail.study.studyCode,
    titleTh: detail.study.titleTh,
    purposeTh: detail.study.purposeTh,
    participationTh: detail.study.participationTh,
    privacyTh: detail.study.privacyTh,
    withdrawalTh: detail.study.withdrawalTh,
    contactEmail: detail.study.contactEmail,
    retentionUntil: detail.study.retentionUntil,
    participantType,
    estimatedMinutes: (instrument.estimatedMinutes ?? 4) + tasks.reduce((sum, task) => sum + (task.maximumMinutes ?? 5), 0),
    taskCount: tasks.length,
  };
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function intersectionCount(left: Set<string>, right: Set<string>): number {
  let count = 0;
  for (const value of left) {
    if (right.has(value)) count += 1;
  }
  return count;
}

function buildConstructMetrics(rows: ResearchAnalyticsRows, eligibleSessionIds: Set<string>) {
  const submittedResponses = rows.responses.filter((response) => response.status === "submitted" && eligibleSessionIds.has(response.researchSessionId));
  const responseById = new Map(submittedResponses.map((response) => [response.researchResponseId, response]));
  const itemById = new Map(rows.items.map((item) => [item.researchItemId, item]));
  const valuesByConstruct = new Map<string, Array<{ sessionId: string; value: number }>>();
  for (const answer of rows.answers) {
    const response = responseById.get(answer.responseId);
    const item = itemById.get(answer.itemId);
    if (!response || !item || answer.integerValue === null || !["agreement_5", "rating_5"].includes(item.answerType)) continue;
    const value = item.reverseScore ? 6 - answer.integerValue : answer.integerValue;
    const values = valuesByConstruct.get(item.constructKey) ?? [];
    values.push({ sessionId: response.researchSessionId, value });
    valuesByConstruct.set(item.constructKey, values);
  }
  return [...valuesByConstruct.entries()].map(([constructKey, values]) => {
    const sampleSize = new Set(values.map((entry) => entry.sessionId)).size;
    return {
      constructKey,
      sampleSize,
      suppressed: sampleSize < RESEARCH_SMALL_CELL_THRESHOLD,
      mean: sampleSize < RESEARCH_SMALL_CELL_THRESHOLD ? null : round(values.reduce((sum, entry) => sum + entry.value, 0) / values.length),
    };
  }).sort((a, b) => a.constructKey.localeCompare(b.constructKey));
}

const FUNNEL_STEPS = [
  { key: "consented", label: "ยินยอมเข้าร่วม" },
  { key: "minimal_form_completed", label: "กรอกข้อมูลพื้นฐาน" },
  { key: "photo_uploaded", label: "อัปโหลดรูป" },
  { key: "certificate_generated", label: "สร้างใบประกาศ" },
  { key: "survey_completed", label: "ตอบแบบสำรวจท่องเที่ยว" },
  { key: "evaluation_submitted", label: "ส่งแบบประเมินระบบ" },
] as const;

export function summarizeResearchAnalytics(rows: ResearchAnalyticsRows, filters: AdminResearchAnalyticsFilters) {
  const eligible = rows.sessions.filter((session) => session.inclusionStatus !== "excluded" && !["withdrawn", "excluded", "expired"].includes(session.status));
  const eligibleIds = new Set(eligible.map((session) => session.researchSessionId));
  const submitted = rows.responses.filter((response) => response.status === "submitted" && eligibleIds.has(response.researchSessionId));
  const submittedSessionIds = new Set(submitted.map((response) => response.researchSessionId));
  const eventSessions = new Map<string, Set<string>>();
  for (const event of rows.funnelEvents) {
    if (!eligibleIds.has(event.researchSessionId)) continue;
    const sessions = eventSessions.get(event.eventType) ?? new Set<string>();
    sessions.add(event.researchSessionId);
    eventSessions.set(event.eventType, sessions);
  }
  const funnel = FUNNEL_STEPS.map((step) => {
    const count = step.key === "consented"
      ? eligible.length
      : step.key === "evaluation_submitted"
        ? submittedSessionIds.size
        : eventSessions.get(step.key)?.size ?? 0;
    return {
      ...step,
      count,
      rate: eligible.length > 0 ? round((count / eligible.length) * 100, 1) : 0,
    };
  });
  const publishedRequiredItems = rows.items.filter((item) => item.isRequired && rows.instruments.some((instrument) => instrument.researchInstrumentId === item.instrumentId && instrument.status === "published"));
  const requiredByInstrument = new Map<string, number>();
  publishedRequiredItems.forEach((item) => requiredByInstrument.set(item.instrumentId, (requiredByInstrument.get(item.instrumentId) ?? 0) + 1));
  const answerCount = new Map<string, number>();
  rows.answers.forEach((answer) => answerCount.set(answer.responseId, (answerCount.get(answer.responseId) ?? 0) + 1));
  const expectedAnswers = submitted.reduce((sum, response) => sum + (requiredByInstrument.get(response.instrumentId) ?? 0), 0);
  const observedAnswers = submitted.reduce((sum, response) => sum + Math.min(answerCount.get(response.researchResponseId) ?? 0, requiredByInstrument.get(response.instrumentId) ?? 0), 0);
  const operatorCompleted = rows.operatorAttempts.filter((attempt) => attempt.status === "completed" && eligibleIds.has(attempt.researchSessionId));
  const operatorAssessed = operatorCompleted.filter((attempt) => ["passed", "partial", "failed"].includes(attempt.outcome ?? ""));
  const operatorPassed = operatorAssessed.filter((attempt) => attempt.outcome === "passed");
  const operatorConfidence = operatorCompleted.filter((attempt) => attempt.confidence !== null);
  const certificateSessions = eventSessions.get("certificate_generated") ?? new Set<string>();
  const surveySessions = eventSessions.get("survey_completed") ?? new Set<string>();
  const passportSessions = eventSessions.get("passport_saved") ?? new Set<string>();
  const incentiveSuppressed = certificateSessions.size < RESEARCH_SMALL_CELL_THRESHOLD;
  const rateAfterCertificate = (sessions: Set<string>) => incentiveSuppressed
    ? null
    : round((intersectionCount(certificateSessions, sessions) / certificateSessions.size) * 100, 1);
  const submittedInstrumentIds = new Set(submitted.map((response) => response.instrumentId));
  const instrumentVersions = rows.instruments
    .filter((instrument) => submittedInstrumentIds.has(instrument.researchInstrumentId))
    .map((instrument) => `${instrument.instrumentKey} v${instrument.versionNumber} (${instrument.audience})`)
    .sort();
  const evaluationDurations = submitted
    .map((response) => response.durationSeconds)
    .filter((value): value is number => value !== null);
  return {
    scope: {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      collectionModes: filters.collectionModes,
      participantType: filters.participantType ?? "all",
      smallCellThreshold: RESEARCH_SMALL_CELL_THRESHOLD,
      unit: "research_session",
      instrumentVersions,
    },
    kpis: {
      consented: rows.sessions.length,
      eligible: eligible.length,
      completed: submittedSessionIds.size,
      completionRate: eligible.length > 0 ? round((submittedSessionIds.size / eligible.length) * 100, 1) : 0,
      withdrawn: rows.sessions.filter((session) => session.status === "withdrawn").length,
      excluded: rows.sessions.filter((session) => session.inclusionStatus === "excluded" && session.status !== "withdrawn").length,
      medianEvaluationSeconds: median(evaluationDurations),
      evaluationDurationCount: evaluationDurations.length,
      requiredAnswerCompleteness: expectedAnswers > 0 ? round((observedAnswers / expectedAnswers) * 100, 1) : null,
      requiredResponseCount: submitted.length,
    },
    funnel,
    constructs: buildConstructMetrics(rows, eligibleIds),
    incentives: {
      certificateRecipients: certificateSessions.size,
      tourismSurveyCompleters: intersectionCount(certificateSessions, surveySessions),
      evaluationCompleters: intersectionCount(certificateSessions, submittedSessionIds),
      passportSavers: intersectionCount(certificateSessions, passportSessions),
      tourismSurveyRate: rateAfterCertificate(surveySessions),
      evaluationRate: rateAfterCertificate(submittedSessionIds),
      passportSaveRate: rateAfterCertificate(passportSessions),
      suppressed: incentiveSuppressed,
      denominator: "research sessions ที่สร้างใบประกาศสำเร็จ",
    },
    operator: {
      completedAttempts: operatorCompleted.length,
      assessedAttempts: operatorAssessed.length,
      passedAttempts: operatorPassed.length,
      successRate: operatorAssessed.length >= RESEARCH_SMALL_CELL_THRESHOLD ? round((operatorPassed.length / operatorAssessed.length) * 100, 1) : null,
      successSuppressed: operatorAssessed.length < RESEARCH_SMALL_CELL_THRESHOLD,
      durationSuppressed: operatorCompleted.length < RESEARCH_SMALL_CELL_THRESHOLD,
      confidenceSuppressed: operatorConfidence.length < RESEARCH_SMALL_CELL_THRESHOLD,
      medianSeconds: operatorCompleted.length >= RESEARCH_SMALL_CELL_THRESHOLD
        ? median(operatorCompleted.map((attempt) => attempt.startedAt && attempt.completedAt ? Math.max(0, (Date.parse(attempt.completedAt) - Date.parse(attempt.startedAt)) / 1000) : null).filter((value): value is number => value !== null))
        : null,
      meanConfidence: operatorConfidence.length >= RESEARCH_SMALL_CELL_THRESHOLD
        ? round(operatorConfidence.reduce((sum, attempt) => sum + (attempt.confidence ?? 0), 0) / operatorConfidence.length)
        : null,
    },
    truncated: rows.truncated,
    interpretation: "ผลเป็นสถิติเชิงพรรณนาและความสัมพันธ์ภายในกลุ่มตัวอย่าง ไม่ใช่หลักฐานเชิงเหตุและผลหรือค่าตัวแทนประชากรทั้งจังหวัด",
  };
}

export async function getResearchAnalytics(input: AdminResearchAnalyticsFilters) {
  const parsed = adminResearchAnalyticsFiltersSchema.safeParse(input);
  if (!parsed.success) fail("VALIDATION_ERROR", "ตัวกรองงานวิจัยไม่ถูกต้อง");
  const rows = await repository.getResearchAnalyticsRows({
    studyId: parsed.data.studyId,
    collectionModes: parsed.data.collectionModes,
    participantType: parsed.data.participantType,
    dateStart: parsed.data.dateFrom,
    dateEnd: parsed.data.dateTo,
  });
  return summarizeResearchAnalytics(rows, parsed.data);
}

export async function createAdminResearchStudy(input: AdminResearchStudyDraftCreateInput) {
  const guard = await requirePermission("research.manage");
  const parsed = adminResearchStudyDraftCreateSchema.safeParse(input);
  if (!parsed.success) fail("VALIDATION_ERROR", "ข้อมูลโครงการวิจัยไม่ถูกต้อง");
  const study = await repository.createResearchStudyDraft({
    ...parsed.data,
    titleEn: nullable(parsed.data.titleEn),
    startsAt: parsed.data.startsAt ?? null,
    endsAt: parsed.data.endsAt ?? null,
    retentionUntil: parsed.data.retentionUntil ?? null,
    ownerAdminId: guard.actor.adminId,
  });
  await logAuditAction({ actor: guard.actor, action: "research.study.create", entityType: "research_study", entityId: study.researchStudyId, newValues: { studyCode: study.studyCode, protocolVersion: study.protocolVersion } });
  return study;
}

export async function recordAdminResearchApproval(input: AdminResearchApprovalInput) {
  const guard = await requirePermission("research.manage");
  const parsed = adminResearchApprovalSchema.safeParse(input);
  if (!parsed.success) fail("VALIDATION_ERROR", "หลักฐานอนุมัติไม่ครบถ้วน");
  await repository.recordResearchApproval({
    studyId: parsed.data.studyId,
    advisorApprovedAt: parsed.data.advisorApprovedAt,
    ethicsReviewStatus: parsed.data.ethicsReviewStatus,
    ethicsApprovedAt: parsed.data.ethicsApprovedAt ?? null,
    approvalReference: parsed.data.approvalReference,
    recordedBy: guard.actor.adminId,
  });
  await logAuditAction({ actor: guard.actor, action: "research.study.approval_record", entityType: "research_study", entityId: parsed.data.studyId, metadata: { ethicsReviewStatus: parsed.data.ethicsReviewStatus } });
}

export async function createAdminResearchInstrument(input: AdminResearchInstrumentDraftInput) {
  const guard = await requirePermission("research.manage");
  const parsed = adminResearchInstrumentDraftSchema.safeParse(input);
  if (!parsed.success) fail("VALIDATION_ERROR", "ข้อมูลแบบประเมินไม่ถูกต้อง");
  const instrument = await repository.createResearchInstrumentDraft({
    ...parsed.data,
    titleEn: nullable(parsed.data.titleEn),
    descriptionTh: nullable(parsed.data.descriptionTh),
    descriptionEn: nullable(parsed.data.descriptionEn),
    estimatedMinutes: parsed.data.estimatedMinutes ?? null,
    createdBy: guard.actor.adminId,
  });
  await logAuditAction({ actor: guard.actor, action: "research.instrument.create", entityType: "research_instrument", entityId: instrument.researchInstrumentId, metadata: { version: instrument.versionNumber, audience: instrument.audience } });
  return instrument;
}

export async function createAdminResearchItem(input: AdminResearchItemCreateInput) {
  const guard = await requirePermission("research.manage");
  const parsed = adminResearchItemCreateSchema.safeParse(input);
  if (!parsed.success) fail("VALIDATION_ERROR", "ข้อมูลข้อคำถามไม่ถูกต้อง");
  const item = await repository.createResearchItem({
    instrumentId: parsed.data.instrumentId,
    itemCode: parsed.data.itemCode,
    constructKey: parsed.data.constructKey,
    promptTh: parsed.data.promptTh,
    promptEn: nullable(parsed.data.promptEn),
    answerType: parsed.data.answerType,
    options: parsed.data.answerType === "single_choice" ? parsed.data.options : null,
    displayOrder: parsed.data.displayOrder,
    isRequired: parsed.data.isRequired,
    reverseScore: parsed.data.reverseScore,
  });
  await logAuditAction({ actor: guard.actor, action: "research.item.create", entityType: "research_item", entityId: item.researchItemId, metadata: { itemCode: item.itemCode, constructKey: item.constructKey } });
  return item;
}

export async function publishAdminResearchInstrument(instrumentId: string) {
  const guard = await requirePermission("research.manage");
  const target = await repository.getResearchInstrumentForManagement(instrumentId);
  if (!target) fail("NOT_FOUND", "ไม่พบแบบประเมิน");
  const detail = await repository.getAdminResearchStudyDetail(target.instrument.studyId);
  if (!detail || detail.study.status !== "draft") fail("STUDY_FROZEN", "โครงการถูกล็อกรุ่นแล้ว");
  if (target.items.length === 0) fail("ITEMS_REQUIRED", "ต้องมีข้อคำถามอย่างน้อย 1 ข้อก่อนเผยแพร่");
  await repository.publishResearchInstrument(instrumentId);
  await logAuditAction({ actor: guard.actor, action: "research.instrument.publish", entityType: "research_instrument", entityId: instrumentId, metadata: { itemCount: target.items.length } });
}

export async function saveAdminResearchDeployment(input: AdminResearchDeploymentInput) {
  const guard = await requirePermission("research.manage");
  const parsed = adminResearchDeploymentSchema.safeParse(input);
  if (!parsed.success) fail("VALIDATION_ERROR", "ข้อมูลจุดเก็บข้อมูลไม่ถูกต้อง");
  await repository.upsertResearchDeployment({
    studyId: parsed.data.studyId,
    checkinCodeId: parsed.data.checkinCodeId,
    collectionMode: parsed.data.collectionMode,
    isActive: parsed.data.isActive,
    startsAt: parsed.data.startsAt ?? null,
    endsAt: parsed.data.endsAt ?? null,
    createdBy: guard.actor.adminId,
  });
  await logAuditAction({ actor: guard.actor, action: "research.deployment.save", entityType: "research_study", entityId: parsed.data.studyId, metadata: { checkinCodeId: parsed.data.checkinCodeId, collectionMode: parsed.data.collectionMode, isActive: parsed.data.isActive } });
}

export async function createAdminResearchOperatorTask(input: AdminResearchOperatorTaskDraftInput) {
  const guard = await requirePermission("research.manage");
  const parsed = adminResearchOperatorTaskDraftSchema.safeParse(input);
  if (!parsed.success) fail("VALIDATION_ERROR", "ข้อมูลงานประเมินการตัดสินใจไม่ถูกต้อง");
  const task = await repository.createResearchOperatorTaskDraft({
    ...parsed.data,
    titleEn: nullable(parsed.data.titleEn),
    instructionEn: nullable(parsed.data.instructionEn),
    maximumMinutes: parsed.data.maximumMinutes ?? null,
    createdBy: guard.actor.adminId,
  });
  await logAuditAction({ actor: guard.actor, action: "research.operator_task.create", entityType: "research_operator_task", entityId: task.researchOperatorTaskId, metadata: { taskCode: task.taskCode, version: task.versionNumber, audience: task.audience } });
  return task;
}

export async function publishAdminResearchOperatorTask(input: { studyId: string; taskId: string; confirmFreeze: true }) {
  const guard = await requirePermission("research.manage");
  const detail = await repository.getAdminResearchStudyDetail(input.studyId);
  const task = detail?.operatorTasks.find((entry) => entry.researchOperatorTaskId === input.taskId);
  if (!detail || !task) fail("NOT_FOUND", "ไม่พบงานประเมิน");
  if (detail.study.status !== "draft" || task.status !== "draft") fail("TASK_FROZEN", "งานประเมินถูกล็อกรุ่นแล้ว");
  await repository.publishResearchOperatorTask(input.taskId);
  await logAuditAction({ actor: guard.actor, action: "research.operator_task.publish", entityType: "research_operator_task", entityId: input.taskId, metadata: { taskCode: task.taskCode, version: task.versionNumber } });
}

export async function assessAdminResearchOperatorAttempt(input: AdminResearchOperatorAssessmentInput) {
  const parsed = adminResearchOperatorAssessmentSchema.safeParse(input);
  if (!parsed.success) fail("VALIDATION_ERROR", "ผลการตรวจงานไม่ถูกต้อง");
  const guard = await requirePermission("research.manage");
  const queue = await repository.listResearchOperatorAssessments(parsed.data.studyId);
  const attempt = queue.find((entry) => entry.attemptId === parsed.data.attemptId);
  if (!attempt) fail("NOT_FOUND", "ไม่พบงานที่ต้องการตรวจ");
  const updated = await repository.assessResearchOperatorAttempt({
    ...parsed.data,
    reviewNote: parsed.data.reviewNote ? redactResearchFreeText(parsed.data.reviewNote) : undefined,
  });
  if (!updated) fail("UPDATE_FAILED", "ยังบันทึกผลการตรวจไม่ได้");
  await logAuditAction({
    actor: guard.actor,
    action: "research.operator_attempt.assess",
    entityType: "research_operator_task_attempt",
    entityId: parsed.data.attemptId,
    metadata: { outcome: parsed.data.outcome, evidenceQuality: parsed.data.evidenceQuality, taskCode: attempt.taskCode },
  });
  return { assessed: true as const };
}

export async function activateAdminResearchStudy(input: { studyId: string; confirmFreeze: true }) {
  const guard = await requirePermission("research.manage");
  const parsed = adminResearchStudyActivationSchema.safeParse(input);
  if (!parsed.success) fail("VALIDATION_ERROR", "ต้องยืนยันการล็อกรุ่นก่อนเริ่มเก็บข้อมูล");
  const detail = await repository.getAdminResearchStudyDetail(parsed.data.studyId);
  if (!detail) fail("NOT_FOUND", "ไม่พบโครงการวิจัย");
  const readiness = assessResearchReadiness(detail);
  const blockers = readiness.filter((item) => !item.ready);
  if (blockers.length > 0) fail("NOT_READY", blockers.map((item) => item.blockingReason).join("; "));
  await repository.activateResearchStudy(parsed.data.studyId);
  await logAuditAction({ actor: guard.actor, action: "research.study.activate", entityType: "research_study", entityId: parsed.data.studyId, metadata: { protocolVersion: detail.study.protocolVersion, frozen: true } });
}

export async function transitionAdminResearchStudy(input: { studyId: string; fromStatus: ResearchStudyStatus; toStatus: ResearchStudyStatus }) {
  const guard = await requirePermission("research.manage");
  const allowed = new Set(["active:paused", "active:closed", "paused:active", "paused:closed", "closed:archived"]);
  if (!allowed.has(`${input.fromStatus}:${input.toStatus}`)) fail("INVALID_TRANSITION", "ลำดับสถานะไม่ถูกต้อง");
  await repository.transitionResearchStudy(input.studyId, input.fromStatus, input.toStatus);
  await logAuditAction({ actor: guard.actor, action: "research.study.transition", entityType: "research_study", entityId: input.studyId, metadata: { fromStatus: input.fromStatus, toStatus: input.toStatus } });
}

export type ResearchAnalyticsViewModel = ReturnType<typeof summarizeResearchAnalytics>;
export type { ResearchCollectionMode, ResearchParticipantType, AdminResearchItem };
