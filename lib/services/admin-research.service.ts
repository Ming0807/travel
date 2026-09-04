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
  adminResearchActivationEvidenceSchema,
  adminResearchApprovalSchema,
  adminResearchDeploymentSchema,
  adminResearchInstrumentDraftSchema,
  adminResearchFreezeSnapshotSchema,
  adminResearchItemCreateSchema,
  adminResearchOperatorTaskDraftSchema,
  adminResearchOperatorAssessmentSchema,
  adminResearchPilotReviewSchema,
  adminResearchStudyActivationSchema,
  adminResearchStudyDraftCreateSchema,
  type AdminResearchAnalyticsFilters,
  type AdminResearchActivationEvidenceInput,
  type AdminResearchApprovalInput,
  type AdminResearchDeploymentInput,
  type AdminResearchInstrumentDraftInput,
  type AdminResearchFreezeSnapshotInput,
  type AdminResearchItemCreateInput,
  type AdminResearchOperatorTaskDraftInput,
  type AdminResearchOperatorAssessmentInput,
  type AdminResearchPilotReviewInput,
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
  const stakeholderAudiences = ["operator", "attraction_manager"] as const;
  const stakeholderReady = stakeholderAudiences.every((audience) =>
    detail.instruments.some((instrument) => instrument.audience === audience && instrument.status === "published" && instrument.frozenAt)
    && detail.operatorTasks.some((task) => task.audience === audience && task.status === "published" && task.frozenAt),
  );
  const evidenceReady = (evidenceType: "expert_review" | "cognitive_pretest" | "mobile_flow_qa") => {
    const latest = detail.activationEvidence
      .filter((evidence) => evidence.evidenceType === evidenceType)
      .sort((left, right) => right.versionNumber - left.versionNumber || right.recordedAt.localeCompare(left.recordedAt))[0];
    return Boolean(latest && ["passed", "not_required"].includes(latest.status));
  };
  const pilotDeploymentReady = detail.deployments.some((deployment) =>
    deployment.isActive && ["pilot_internal", "simulated_usability"].includes(deployment.collectionMode),
  ) && !detail.deployments.some((deployment) => deployment.isActive && deployment.collectionMode === "field_observation");
  const finalDeploymentReady = detail.deployments.some((deployment) => deployment.isActive && deployment.collectionMode === "field_observation");
  return [
    {
      key: "advisor",
      label: "หลักฐานอนุมัติจากอาจารย์ที่ปรึกษา",
      ready: Boolean(study.advisorApprovedAt && study.approvalReference && study.approvalRecordedBy && study.approvedTitleTh && study.approvedGeographicBoundary && study.approvedObjectives.length > 0 && study.approvedResearchQuestions.length > 0 && study.analysisWording),
      blockingReason: "ต้องบันทึกวันที่ หลักฐาน ชื่อ ขอบเขต วัตถุประสงค์ RQ และระดับถ้อยคำที่อนุมัติ",
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
      label: detail.study.studyKind === "pilot" ? "จุดทดสอบแบบควบคุม" : "จุดเก็บข้อมูลภาคสนาม",
      ready: detail.study.studyKind === "pilot" ? pilotDeploymentReady : finalDeploymentReady,
      blockingReason: detail.study.studyKind === "pilot"
        ? "Pilot เปิดได้เฉพาะ pilot_internal หรือ simulated_usability และห้ามเปิด field_observation"
        : "ต้องมีจุดเก็บข้อมูล field_observation อย่างน้อย 1 จุด",
    },
    {
      key: "stakeholder",
      label: "แบบประเมินและโจทย์ตัดสินใจสำหรับผู้มีส่วนได้ส่วนเสีย",
      ready: stakeholderReady,
      blockingReason: "ต้องมีแบบประเมินและโจทย์ที่เผยแพร่แล้วครบทั้งผู้ประกอบการและผู้ดูแลสถานที่",
    },
    {
      key: "drafts",
      label: "ไม่มีแบบประเมินหรืองานทดสอบฉบับร่างค้างอยู่",
      ready: !hasDraftConfiguration,
      blockingReason: "เผยแพร่หรือยกเลิกฉบับร่างทั้งหมดก่อนเริ่มเก็บข้อมูล",
    },
    {
      key: "expert_review",
      label: "ผู้เชี่ยวชาญตรวจเครื่องมือ",
      ready: detail.study.studyKind === "final_collection" || evidenceReady("expert_review"),
      blockingReason: "ต้องบันทึกผล expert review รุ่นที่ใช้ใน Pilot",
    },
    {
      key: "cognitive_pretest",
      label: "Cognitive pretest และภาระผู้เข้าร่วม",
      ready: detail.study.studyKind === "final_collection" || evidenceReady("cognitive_pretest"),
      blockingReason: "ต้องบันทึกผล pretest รวมเวลาและปัญหาความเข้าใจ",
    },
    {
      key: "mobile_qa",
      label: "Mobile E2E: ยินยอม ปฏิเสธ ทำต่อ ส่งซ้ำ และถอนตัว",
      ready: detail.study.studyKind === "final_collection" || evidenceReady("mobile_flow_qa"),
      blockingReason: "ต้องบันทึกผลทดสอบ flow บนอุปกรณ์มือถือก่อนเปิด Pilot",
    },
    {
      key: "freeze_snapshot",
      label: "Version freeze snapshot แบบแก้ไขย้อนหลังไม่ได้",
      ready: Boolean(detail.freezeSnapshot),
      blockingReason: "ต้องบันทึก manifest ของ protocol, consent, instrument, task และเวอร์ชันระบบ",
    },
    {
      key: "pilot_decision",
      label: "ผล Pilot อนุมัติให้เก็บข้อมูลภาคสนาม",
      ready: detail.study.studyKind === "pilot" || detail.sourcePilotReadyForField,
      blockingReason: "ต้องเชื่อม Pilot ที่มีผล ready_for_field ก่อนเปิด final collection",
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

export async function getAdminResearchStudyWorkspace(
  studyId: string,
  filters?: AdminResearchAnalyticsFilters,
  useStudyDefaultCollectionMode = false,
) {
  const guard = await requirePermission("research.read");
  if (filters) assertResearchStudyScope(studyId, filters.studyId);
  const detail = await repository.getAdminResearchStudyDetail(studyId);
  if (!detail) return null;
  const analyticsFilters: AdminResearchAnalyticsFilters | undefined = filters && useStudyDefaultCollectionMode
    ? {
      ...filters,
      collectionModes: detail.study.studyKind === "pilot"
        ? ["pilot_internal", "simulated_usability"]
        : ["field_observation"],
    }
    : filters;
  const readiness = assessResearchReadiness(detail);
  const canManage = guard.actor.permissions.includes("research.manage");
  const [checkinCodes, operatorAssessments, analytics] = await Promise.all([
    canManage ? repository.listAvailableResearchCheckinCodes() : Promise.resolve([]),
    canManage ? repository.listResearchOperatorAssessments(studyId) : Promise.resolve([]),
    analyticsFilters ? getResearchAnalytics(analyticsFilters) : Promise.resolve(null),
  ]);
  return { detail, readiness, canActivate: readiness.every((item) => item.ready), canManage, checkinCodes, operatorAssessments, analytics, analyticsFilters };
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
    studyKind: detail.study.studyKind,
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

const EVALUATION_THRESHOLDS = {
  completionRatePercent: 80,
  medianSeconds: 240,
  maximumRequiredItemMissingnessPercent: 5,
} as const;

const EVALUATION_SECTION_LABELS: Record<string, string> = {
  system_quality: "คุณภาพระบบ",
  information_quality: "คุณภาพข้อมูล",
  perceived_ease_of_use: "ความง่ายในการใช้งาน",
  perceived_usefulness: "ประโยชน์ที่รับรู้",
  engagement: "ประสบการณ์และแรงจูงใจ",
  privacy_trust: "ความเป็นส่วนตัวและความเชื่อมั่น",
  user_satisfaction: "ความพึงพอใจต่อระบบ",
  behavioral_intention: "ความตั้งใจใช้งานต่อ",
  incentive_engagement: "แรงจูงใจจากรางวัล",
  incentive: "ใบประกาศ ตราประทับ และอันดับ",
  comment: "ความคิดเห็นเพิ่มเติม",
};

type PilotGateStatus = "pass" | "fail" | "insufficient_sample" | "no_data";

function percentage(numerator: number, denominator: number) {
  return denominator > 0 ? round((numerator / denominator) * 100, 1) : null;
}

function dropoff(previous: number, current: number) {
  return previous > 0 ? round((Math.max(0, previous - current) / previous) * 100, 1) : null;
}

function thresholdGate(value: number | null, sampleSize: number, comparator: (candidate: number) => boolean): PilotGateStatus {
  if (value === null) return "no_data";
  if (sampleSize < RESEARCH_SMALL_CELL_THRESHOLD) return "insufficient_sample";
  return comparator(value) ? "pass" : "fail";
}

function buildEvaluationFlow(rows: ResearchAnalyticsRows, eligibleIds: Set<string>) {
  const responses = rows.responses.filter((response) => eligibleIds.has(response.researchSessionId));
  const submitted = responses.filter((response) => response.status === "submitted");
  const startedSessionIds = new Set(responses.map((response) => response.researchSessionId));
  const submittedSessionIds = new Set(submitted.map((response) => response.researchSessionId));
  const responseById = new Map(responses.map((response) => [response.researchResponseId, response]));
  const observedInstrumentIds = new Set(responses.map((response) => response.instrumentId));
  const instrumentsById = new Map(rows.instruments.map((instrument) => [instrument.researchInstrumentId, instrument]));
  const observedContracts = new Set([...observedInstrumentIds].flatMap((id) => {
    const instrument = instrumentsById.get(id);
    return instrument ? [`${instrument.instrumentKey}:${instrument.audience}`] : [];
  }));
  const stageAnalysisAvailable = observedContracts.size <= 1;
  const answeredItemIdsByResponse = new Map<string, Set<string>>();

  rows.answers.forEach((answer) => {
    if (!responseById.has(answer.responseId)) return;
    const answered = answeredItemIdsByResponse.get(answer.responseId) ?? new Set<string>();
    answered.add(answer.itemId);
    answeredItemIdsByResponse.set(answer.responseId, answered);
  });

  const sectionOrder = new Map<string, number>();
  rows.items.forEach((item) => {
    if (!observedInstrumentIds.has(item.instrumentId)) return;
    sectionOrder.set(item.constructKey, Math.min(sectionOrder.get(item.constructKey) ?? Number.POSITIVE_INFINITY, item.displayOrder));
  });
  const sections = [...sectionOrder.entries()].sort((left, right) => left[1] - right[1] || left[0].localeCompare(right[0]));
  const reachedBySection = new Map(sections.map(([key]) => [key, new Set<string>()]));

  responses.forEach((response) => {
    const instrumentSections = sections.filter(([key]) => rows.items.some((item) => item.instrumentId === response.instrumentId && item.constructKey === key));
    const answeredIds = answeredItemIdsByResponse.get(response.researchResponseId) ?? new Set<string>();
    const answeredSectionIndexes = instrumentSections.flatMap(([key], index) =>
      rows.items.some((item) => item.instrumentId === response.instrumentId && item.constructKey === key && answeredIds.has(item.researchItemId)) ? [index] : [],
    );
    const furthestIndex = response.status === "submitted"
      ? instrumentSections.length - 1
      : answeredSectionIndexes.length > 0
        ? Math.max(...answeredSectionIndexes)
        : -1;
    instrumentSections.forEach(([key], index) => {
      if (index <= furthestIndex) reachedBySection.get(key)?.add(response.researchSessionId);
    });
  });

  const stageCounts = stageAnalysisAvailable
    ? [
      { key: "evaluation_started", label: "เริ่มแบบประเมิน", count: startedSessionIds.size },
      ...sections.map(([key]) => ({ key, label: EVALUATION_SECTION_LABELS[key] ?? key, count: reachedBySection.get(key)?.size ?? 0 })),
      { key: "evaluation_submitted", label: "ส่งแบบประเมินสำเร็จ", count: submittedSessionIds.size },
    ]
    : [
      { key: "evaluation_started", label: "เริ่มแบบประเมิน", count: startedSessionIds.size },
      { key: "evaluation_submitted", label: "ส่งแบบประเมินสำเร็จ", count: submittedSessionIds.size },
    ];
  const stages = stageCounts.map((stage, index) => ({
    ...stage,
    rateFromStarted: percentage(stage.count, startedSessionIds.size),
    dropoffFromPrevious: index === 0 ? null : dropoff(stageCounts[index - 1].count, stage.count),
    suppressed: index > 0 && stageCounts[index - 1].count < RESEARCH_SMALL_CELL_THRESHOLD,
  }));

  const durations = submitted.map((response) => response.durationSeconds).filter((value): value is number => value !== null);
  const medianSeconds = median(durations);
  const completionRate = percentage(submittedSessionIds.size, startedSessionIds.size);
  const requiredMissingness = rows.items
    .filter((item) => item.isRequired)
    .flatMap((item) => {
      const instrumentResponses = submitted.filter((response) => response.instrumentId === item.instrumentId);
      if (instrumentResponses.length === 0) return [];
      const answered = instrumentResponses.filter((response) => answeredItemIdsByResponse.get(response.researchResponseId)?.has(item.researchItemId)).length;
      return [{ itemCode: item.itemCode, rate: round(((instrumentResponses.length - answered) / instrumentResponses.length) * 100, 1) }];
    });
  const worstRequiredItem = requiredMissingness.sort((left, right) => right.rate - left.rate || left.itemCode.localeCompare(right.itemCode))[0] ?? null;

  return {
    started: startedSessionIds.size,
    submitted: submittedSessionIds.size,
    completionRate,
    medianSeconds,
    durationSampleSize: durations.length,
    worstRequiredItemMissingness: worstRequiredItem?.rate ?? null,
    worstRequiredItemCode: worstRequiredItem?.itemCode ?? null,
    thresholds: EVALUATION_THRESHOLDS,
    gates: {
      completion: thresholdGate(completionRate, startedSessionIds.size, (value) => value >= EVALUATION_THRESHOLDS.completionRatePercent),
      duration: thresholdGate(medianSeconds, durations.length, (value) => value <= EVALUATION_THRESHOLDS.medianSeconds),
      requiredItemMissingness: thresholdGate(worstRequiredItem?.rate ?? null, submittedSessionIds.size, (value) => value <= EVALUATION_THRESHOLDS.maximumRequiredItemMissingnessPercent),
    },
    stageAnalysisAvailable,
    stageAnalysisLimitation: stageAnalysisAvailable
      ? null
      : "ขอบเขตนี้มีแบบประเมินมากกว่าหนึ่งประเภท โปรดกรองประเภทผู้เข้าร่วมก่อนตีความ drop-off รายส่วน",
    stages,
  };
}

function buildDescriptiveGroups(
  rows: ResearchAnalyticsRows,
  eligible: ResearchAnalyticsRows["sessions"],
  submittedSessionIds: Set<string>,
  dimension: "collectionMode" | "participantType",
) {
  const keys = [...new Set(eligible.map((session) => session[dimension]))].sort();
  return keys.map((key) => {
    const groupSessions = eligible.filter((session) => session[dimension] === key);
    const groupIds = new Set(groupSessions.map((session) => session.researchSessionId));
    const submittedCount = [...groupIds].filter((id) => submittedSessionIds.has(id)).length;
    const durations = rows.responses
      .filter((response) => groupIds.has(response.researchSessionId) && response.status === "submitted" && response.durationSeconds !== null)
      .map((response) => response.durationSeconds as number);
    const suppressed = groupSessions.length < RESEARCH_SMALL_CELL_THRESHOLD;
    return {
      key,
      suppressed,
      sampleSize: suppressed ? null : groupSessions.length,
      completionRate: suppressed ? null : percentage(submittedCount, groupSessions.length),
      medianSeconds: suppressed || durations.length < RESEARCH_SMALL_CELL_THRESHOLD ? null : median(durations),
      durationSampleSize: suppressed ? null : durations.length,
    };
  });
}

function instrumentLabel(instrument: ResearchAnalyticsRows["instruments"][number]) {
  return `${instrument.instrumentKey} v${instrument.versionNumber} (${instrument.audience})`;
}

function buildInstrumentControl(rows: ResearchAnalyticsRows) {
  const instrumentById = new Map(rows.instruments.map((instrument) => [instrument.researchInstrumentId, instrument]));
  const scopedAudiences = new Set(rows.sessions.map((session) => session.participantType));
  const expected = rows.instruments.filter((instrument) => instrument.status === "published" && Boolean(instrument.frozenAt) && (scopedAudiences.size === 0 || scopedAudiences.has(instrument.audience)));
  const observedIds = new Set(rows.responses.map((response) => response.instrumentId));
  const observed = [...observedIds].map((id) => instrumentById.get(id)).filter((instrument): instrument is NonNullable<typeof instrument> => Boolean(instrument));
  const expectedIds = new Set(expected.map((instrument) => instrument.researchInstrumentId));
  const versionsByContract = new Map<string, Set<number>>();
  observed.forEach((instrument) => {
    const key = `${instrument.instrumentKey}:${instrument.audience}`;
    const versions = versionsByContract.get(key) ?? new Set<number>();
    versions.add(instrument.versionNumber);
    versionsByContract.set(key, versions);
  });
  const mixedVersions = [...versionsByContract.values()].some((versions) => versions.size > 1);
  const hasUnexpectedVersion = observed.some((instrument) => !expectedIds.has(instrument.researchInstrumentId));
  const freezeStatus = rows.governance?.freezeSnapshotId ? "frozen" as const : "not_frozen" as const;
  const status = observed.length === 0
    ? "no_responses" as const
    : freezeStatus === "not_frozen"
      ? "not_frozen" as const
      : mixedVersions
        ? "mixed" as const
        : hasUnexpectedVersion
          ? "mismatch" as const
          : "aligned" as const;
  return {
    freezeStatus,
    freezeSnapshotId: rows.governance?.freezeSnapshotId ?? null,
    expectedVersions: expected.map(instrumentLabel).sort(),
    observedVersions: observed.map(instrumentLabel).sort(),
    mixedVersions,
    hasUnexpectedVersion,
    status,
  };
}

function buildPilotReadiness(
  rows: ResearchAnalyticsRows,
  eligibleCount: number,
  evaluationFlow: ReturnType<typeof buildEvaluationFlow>,
  instrumentControl: ReturnType<typeof buildInstrumentControl>,
  operatorAssessedCount: number,
) {
  const evidenceByType = new Map(rows.governance?.activationEvidence.map((evidence) => [evidence.evidenceType, evidence]) ?? []);
  const evidenceItem = (key: "expert_review" | "cognitive_pretest" | "mobile_flow_qa", label: string) => {
    const evidence = evidenceByType.get(key);
    const ready = Boolean(evidence && ["passed", "not_required"].includes(evidence.status));
    return {
      key,
      label,
      ready,
      evidenceLabel: evidence ? `${evidence.reference} · ${evidence.status}` : "ยังไม่มีหลักฐานที่บันทึก",
      evidenceHref: `#research-evidence-${key}`,
    };
  };
  const configuredOperatorTasks = rows.operatorTasks.length > 0;
  const items = [
    {
      key: "bounded_read",
      label: "ชุดข้อมูลไม่ถูกตัดทอน",
      ready: !rows.truncated,
      evidenceLabel: rows.truncated ? "เกินขีดจำกัด 5,000 sessions" : "อ่านข้อมูลในขอบเขตครบ",
      evidenceHref: "#research-scope",
    },
    {
      key: "sample_size",
      label: "ขนาดกลุ่มผ่านเกณฑ์เปิดเผย",
      ready: eligibleCount >= RESEARCH_SMALL_CELL_THRESHOLD,
      evidenceLabel: eligibleCount >= RESEARCH_SMALL_CELL_THRESHOLD ? `n=${eligibleCount} sessions` : `n<${RESEARCH_SMALL_CELL_THRESHOLD} ยังสรุปไม่ได้`,
      evidenceHref: "#research-participant-sequence",
    },
    {
      key: "instrument_alignment",
      label: "ใช้เครื่องมือรุ่นเดียวและตรงกับ Freeze",
      ready: instrumentControl.status === "aligned",
      evidenceLabel: instrumentControl.status === "aligned" ? instrumentControl.observedVersions.join(", ") : `สถานะ ${instrumentControl.status}`,
      evidenceHref: "#research-instrument-control",
    },
    {
      key: "evaluation_completion",
      label: "ผู้เริ่มตอบส่งสำเร็จอย่างน้อย 80%",
      ready: evaluationFlow.gates.completion === "pass",
      evidenceLabel: evaluationFlow.completionRate === null ? "ยังไม่มีตัวหาร" : `${evaluationFlow.completionRate}% จาก ${evaluationFlow.started} sessions`,
      evidenceHref: "#research-evaluation-flow",
    },
    {
      key: "evaluation_burden",
      label: "เวลามัธยฐานไม่เกิน 4 นาที",
      ready: evaluationFlow.gates.duration === "pass",
      evidenceLabel: evaluationFlow.medianSeconds === null ? "ยังไม่มีข้อมูลเวลา" : `${evaluationFlow.medianSeconds} วินาที · n=${evaluationFlow.durationSampleSize}`,
      evidenceHref: "#research-evaluation-flow",
    },
    {
      key: "required_item_missingness",
      label: "ข้อบังคับขาดหายไม่เกิน 5%",
      ready: evaluationFlow.gates.requiredItemMissingness === "pass",
      evidenceLabel: evaluationFlow.worstRequiredItemMissingness === null ? "ยังไม่มี response ที่ตรวจได้" : `${evaluationFlow.worstRequiredItemCode}: ${evaluationFlow.worstRequiredItemMissingness}%`,
      evidenceHref: "#research-evaluation-flow",
    },
    ...(configuredOperatorTasks ? [{
      key: "operator_outcomes",
      label: "ผลโจทย์ตัดสินใจผ่านเกณฑ์เปิดเผย",
      ready: operatorAssessedCount >= RESEARCH_SMALL_CELL_THRESHOLD,
      evidenceLabel: operatorAssessedCount >= RESEARCH_SMALL_CELL_THRESHOLD ? `ตรวจแล้ว ${operatorAssessedCount} attempts` : `ตรวจแล้วน้อยกว่า ${RESEARCH_SMALL_CELL_THRESHOLD} attempts`,
      evidenceHref: "#research-operator-outcomes",
    }] : []),
    evidenceItem("expert_review", "ผู้เชี่ยวชาญตรวจเครื่องมือ"),
    evidenceItem("cognitive_pretest", "ผ่าน Cognitive pretest"),
    evidenceItem("mobile_flow_qa", "ผ่าน Mobile E2E"),
    {
      key: "review_state",
      label: "พักหรือปิด Pilot ก่อนตัดสิน",
      ready: ["paused", "closed"].includes(rows.governance?.studyStatus ?? ""),
      evidenceLabel: rows.governance?.studyStatus ? `สถานะโครงการ: ${rows.governance.studyStatus}` : "ไม่มีข้อมูลสถานะโครงการ",
      evidenceHref: "#research-activation-control",
    },
  ];
  const readyCount = items.filter((item) => item.ready).length;
  return {
    decision: readyCount === items.length ? "ready_for_review" as const : "not_ready" as const,
    readyCount,
    totalCount: items.length,
    items,
  };
}

export function summarizeResearchAnalytics(rows: ResearchAnalyticsRows, filters: AdminResearchAnalyticsFilters) {
  const eligible = rows.sessions.filter((session) => session.inclusionStatus !== "excluded" && !["withdrawn", "excluded", "expired"].includes(session.status));
  const eligibleIds = new Set(eligible.map((session) => session.researchSessionId));
  const submitted = rows.responses.filter((response) => response.status === "submitted" && eligibleIds.has(response.researchSessionId));
  const submittedSessionIds = new Set(submitted.map((response) => response.researchSessionId));
  const evaluationFlow = buildEvaluationFlow(rows, eligibleIds);
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
  const instrumentControl = buildInstrumentControl(rows);
  const evaluationDurations = submitted
    .map((response) => response.durationSeconds)
    .filter((value): value is number => value !== null);
  const pilotReadiness = buildPilotReadiness(rows, eligible.length, evaluationFlow, instrumentControl, operatorAssessed.length);
  const recruitment: { available: boolean; count: number | null; limitation: string } = {
    available: false,
    count: null,
    limitation: "ระบบยังไม่มีตัวหารจำนวนผู้ได้รับเชิญก่อน consent ที่เชื่อมแบบไม่ระบุตัวตน จึงไม่คำนวณ recruitment conversion",
  };
  return {
    scope: {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      collectionModes: filters.collectionModes,
      participantType: filters.participantType ?? "all",
      studyKind: rows.governance?.studyKind ?? null,
      studyStatus: rows.governance?.studyStatus ?? null,
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
    researchSequence: {
      recruitment,
      consented: rows.sessions.length,
      eligible: eligible.length,
      evaluationStarted: evaluationFlow.started,
      evaluationSubmitted: evaluationFlow.submitted,
      operatorAttemptsCompleted: operatorCompleted.length,
    },
    evaluationFlow,
    constructs: buildConstructMetrics(rows, eligibleIds),
    comparisons: {
      collectionModes: buildDescriptiveGroups(rows, eligible, submittedSessionIds, "collectionMode"),
      participantTypes: buildDescriptiveGroups(rows, eligible, submittedSessionIds, "participantType"),
      interpretation: "เปรียบเทียบเชิงพรรณนาภายในกลุ่มตัวอย่างเท่านั้น กลุ่ม n<10 ถูกปกปิดและไม่ใช้สรุปเหตุและผล",
    },
    instrumentControl,
    pilotReadiness,
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
    sourcePilotStudyId: parsed.data.sourcePilotStudyId ?? null,
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
    approvedTitleTh: parsed.data.approvedTitleTh,
    approvedGeographicBoundary: parsed.data.approvedGeographicBoundary,
    approvedObjectives: parsed.data.approvedObjectives,
    approvedResearchQuestions: parsed.data.approvedResearchQuestions,
    analysisWording: parsed.data.analysisWording,
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
  const detail = await repository.getAdminResearchStudyDetail(parsed.data.studyId);
  if (!detail || detail.study.status !== "draft") fail("STUDY_FROZEN", "แก้จุดเก็บข้อมูลได้เฉพาะโครงการฉบับร่าง");
  if (detail.study.studyKind === "pilot" && parsed.data.isActive && parsed.data.collectionMode === "field_observation") {
    fail("PILOT_FIELD_MODE_BLOCKED", "Pilot ห้ามเปิดจุดเก็บข้อมูลแบบ field_observation");
  }
  if (detail.study.studyKind === "final_collection" && parsed.data.isActive && parsed.data.collectionMode !== "field_observation") {
    fail("FINAL_NON_FIELD_MODE_BLOCKED", "Final collection เปิดได้เฉพาะ field_observation");
  }
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

export async function recordAdminResearchActivationEvidence(input: AdminResearchActivationEvidenceInput) {
  const guard = await requirePermission("research.manage");
  const parsed = adminResearchActivationEvidenceSchema.safeParse(input);
  if (!parsed.success) fail("VALIDATION_ERROR", "หลักฐานความพร้อมไม่ถูกต้อง");
  const detail = await repository.getAdminResearchStudyDetail(parsed.data.studyId);
  if (!detail || detail.study.status !== "draft" || detail.study.studyKind !== "pilot") {
    fail("EVIDENCE_NOT_EDITABLE", "บันทึกหลักฐานได้เฉพาะ Pilot ฉบับร่าง");
  }
  const evidence = await repository.insertResearchActivationEvidence({
    ...parsed.data,
    participantCount: parsed.data.participantCount ?? null,
    medianCompletionSeconds: parsed.data.medianCompletionSeconds ?? null,
    abandonmentRate: parsed.data.abandonmentRate ?? null,
    missingnessRate: parsed.data.missingnessRate ?? null,
    recordedBy: guard.actor.adminId,
  });
  await logAuditAction({
    actor: guard.actor,
    action: "research.activation_evidence.record",
    entityType: "research_activation_evidence",
    entityId: evidence.evidenceId,
    metadata: { studyId: parsed.data.studyId, evidenceType: parsed.data.evidenceType, version: parsed.data.versionNumber, status: parsed.data.status },
  });
  return evidence;
}

export async function freezeAdminResearchStudy(input: AdminResearchFreezeSnapshotInput) {
  const guard = await requirePermission("research.manage");
  const parsed = adminResearchFreezeSnapshotSchema.safeParse(input);
  if (!parsed.success) fail("VALIDATION_ERROR", "ข้อมูล version freeze ไม่ครบ");
  const detail = await repository.getAdminResearchStudyDetail(parsed.data.studyId);
  if (!detail || detail.study.status !== "draft") fail("STUDY_NOT_DRAFT", "ล็อกรุ่นได้เฉพาะโครงการฉบับร่าง");
  if (detail.freezeSnapshot) fail("FREEZE_EXISTS", "โครงการนี้มี freeze snapshot แล้ว");
  const preFreezeBlockers = assessResearchReadiness(detail).filter((item) =>
    !item.ready && !["freeze_snapshot", "pilot_decision"].includes(item.key),
  );
  if (preFreezeBlockers.length > 0) {
    fail("PRE_FREEZE_NOT_READY", preFreezeBlockers.map((item) => item.blockingReason).join("; "));
  }
  if (detail.instruments.some((instrument) => instrument.status === "draft") || detail.operatorTasks.some((task) => task.status === "draft")) {
    fail("DRAFT_CONFIGURATION_EXISTS", "ต้องเผยแพร่หรือยกเลิกฉบับร่างทั้งหมดก่อนล็อกรุ่น");
  }
  const snapshot = await repository.insertResearchFreezeSnapshot({
    studyId: parsed.data.studyId,
    protocolVersion: detail.study.protocolVersion,
    consentVersion: detail.study.consentVersion,
    noticeVersion: detail.study.noticeVersion,
    instrumentManifest: detail.instruments.filter((item) => item.status === "published").map((item) => ({
      instrumentKey: item.instrumentKey,
      versionNumber: item.versionNumber,
      audience: item.audience,
      itemCodes: detail.items.filter((question) => question.instrumentId === item.researchInstrumentId).map((question) => question.itemCode),
    })),
    taskManifest: detail.operatorTasks.filter((item) => item.status === "published").map((item) => ({ taskCode: item.taskCode, versionNumber: item.versionNumber, audience: item.audience })),
    scoringVersion: parsed.data.scoringVersion,
    retentionVersion: parsed.data.retentionVersion,
    withdrawalVersion: parsed.data.withdrawalVersion,
    languageVersion: parsed.data.languageVersion,
    inclusionVersion: parsed.data.inclusionVersion,
    applicationRevision: parsed.data.applicationRevision,
    databaseRevision: parsed.data.databaseRevision,
    frozenBy: guard.actor.adminId,
  });
  await logAuditAction({ actor: guard.actor, action: "research.study.freeze_snapshot", entityType: "research_freeze_snapshot", entityId: snapshot.snapshotId, metadata: { studyId: parsed.data.studyId, immutable: true } });
  return snapshot;
}

export async function recordAdminResearchPilotReview(input: AdminResearchPilotReviewInput) {
  const guard = await requirePermission("research.manage");
  const parsed = adminResearchPilotReviewSchema.safeParse(input);
  if (!parsed.success) fail("VALIDATION_ERROR", "ผลสรุป Pilot ไม่ถูกต้อง");
  const detail = await repository.getAdminResearchStudyDetail(parsed.data.studyId);
  if (!detail || detail.study.studyKind !== "pilot" || !["paused", "closed"].includes(detail.study.status)) {
    fail("PILOT_REVIEW_NOT_READY", "ต้องพักหรือปิด Pilot ก่อนสรุปผล");
  }
  const review = await repository.insertResearchPilotReview({
    pilotStudyId: parsed.data.studyId,
    decision: parsed.data.decision,
    reviewedSessionCount: parsed.data.reviewedSessionCount,
    medianCompletionSeconds: parsed.data.medianCompletionSeconds ?? null,
    abandonmentRate: parsed.data.abandonmentRate ?? null,
    missingnessRate: parsed.data.missingnessRate ?? null,
    reliabilityNote: parsed.data.reliabilityNote,
    decisionRationale: parsed.data.decisionRationale,
    reviewedBy: guard.actor.adminId,
  });
  await logAuditAction({ actor: guard.actor, action: "research.pilot.review", entityType: "research_pilot_review", entityId: review.pilotReviewId, metadata: { studyId: parsed.data.studyId, decision: parsed.data.decision, reviewedSessionCount: parsed.data.reviewedSessionCount } });
  return review;
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
