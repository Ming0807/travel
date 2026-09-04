import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { asRecord, booleanValue, nullableNumber, nullableString, numberValue, stringValue } from "@/lib/utils/record";

export type ResearchStudyStatus = "draft" | "active" | "paused" | "closed" | "archived";
export type ResearchStudyKind = "pilot" | "final_collection";
export type ResearchParticipantType = "tourist" | "operator" | "attraction_manager";
export type ResearchCollectionMode = "field_observation" | "simulated_usability" | "pilot_internal";

export type AdminResearchStudy = {
  researchStudyId: string;
  studyCode: string;
  titleTh: string;
  titleEn: string | null;
  protocolVersion: string;
  consentVersion: string;
  noticeVersion: string;
  purposeTh: string;
  participationTh: string;
  privacyTh: string;
  withdrawalTh: string;
  contactEmail: string;
  scopeCode: string;
  studyKind: ResearchStudyKind;
  sourcePilotStudyId: string | null;
  status: ResearchStudyStatus;
  startsAt: string | null;
  endsAt: string | null;
  retentionUntil: string | null;
  advisorApprovedAt: string | null;
  ethicsReviewStatus: "pending" | "not_required" | "approved";
  ethicsApprovedAt: string | null;
  approvalReference: string | null;
  approvalRecordedBy: string | null;
  approvedTitleTh: string | null;
  approvedGeographicBoundary: string | null;
  approvedObjectives: string[];
  approvedResearchQuestions: string[];
  analysisWording: "exploratory" | "descriptive_associational" | "confirmatory" | null;
  frozenAt: string | null;
  ownerAdminId: string;
  createdAt: string;
  updatedAt: string | null;
};

export type AdminResearchActivationEvidence = {
  evidenceId: string;
  studyId: string;
  evidenceType: "expert_review" | "cognitive_pretest" | "mobile_flow_qa";
  versionNumber: number;
  status: "passed" | "failed" | "not_required";
  evidenceDate: string;
  reference: string;
  summary: string;
  participantCount: number | null;
  medianCompletionSeconds: number | null;
  abandonmentRate: number | null;
  missingnessRate: number | null;
  recordedAt: string;
};

export type AdminResearchFreezeSnapshot = {
  snapshotId: string;
  studyId: string;
  scoringVersion: string;
  retentionVersion: string;
  withdrawalVersion: string;
  languageVersion: string;
  inclusionVersion: string;
  applicationRevision: string;
  databaseRevision: string;
  frozenAt: string;
};

export type AdminResearchPilotReview = {
  pilotReviewId: string;
  pilotStudyId: string;
  decision: "revise" | "repeat_pilot" | "ready_for_field";
  reviewedSessionCount: number;
  medianCompletionSeconds: number | null;
  abandonmentRate: number | null;
  missingnessRate: number | null;
  reliabilityNote: string;
  decisionRationale: string;
  reviewedAt: string;
};

export type AdminResearchStudySummary = AdminResearchStudy & {
  instrumentCount: number;
  activeDeploymentCount: number;
  sessionCount: number;
};

export type AdminResearchInstrument = {
  researchInstrumentId: string;
  studyId: string;
  instrumentKey: string;
  versionNumber: number;
  audience: ResearchParticipantType;
  status: "draft" | "published" | "retired";
  titleTh: string;
  titleEn: string | null;
  descriptionTh: string | null;
  descriptionEn: string | null;
  estimatedMinutes: number | null;
  publishedAt: string | null;
  frozenAt: string | null;
  createdAt: string;
};

export type AdminResearchItem = {
  researchItemId: string;
  instrumentId: string;
  itemCode: string;
  constructKey: string;
  promptTh: string;
  promptEn: string | null;
  answerType: "agreement_5" | "rating_5" | "boolean" | "integer" | "single_choice" | "short_text" | "long_text";
  options: unknown;
  displayOrder: number;
  isRequired: boolean;
  reverseScore: boolean;
};

export type AdminResearchDeployment = {
  studyId: string;
  checkinCodeId: number;
  code: string;
  label: string | null;
  attractionNameTh: string | null;
  collectionMode: ResearchCollectionMode;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

export type AdminResearchOperatorTask = {
  researchOperatorTaskId: string;
  studyId: string;
  taskCode: string;
  versionNumber: number;
  audience: "operator" | "attraction_manager";
  titleTh: string;
  instructionTh: string;
  expectedEvidence: string;
  scoringRule: unknown;
  displayOrder: number;
  maximumMinutes: number | null;
  status: "draft" | "published" | "retired";
  frozenAt: string | null;
};

export type AdminResearchStudyDetail = {
  study: AdminResearchStudy;
  instruments: AdminResearchInstrument[];
  items: AdminResearchItem[];
  deployments: AdminResearchDeployment[];
  operatorTasks: AdminResearchOperatorTask[];
  activationEvidence: AdminResearchActivationEvidence[];
  freezeSnapshot: AdminResearchFreezeSnapshot | null;
  pilotReviews: AdminResearchPilotReview[];
  sourcePilotReadyForField: boolean;
};

export type ResearchAnalyticsSessionRow = {
  researchSessionId: string;
  participantCode: string;
  participantType: ResearchParticipantType;
  collectionMode: ResearchCollectionMode;
  status: string;
  inclusionStatus: string;
  consentedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  withdrawnAt: string | null;
  createdAt: string;
  visitId: string | null;
};

export type ResearchAnalyticsResponseRow = {
  researchResponseId: string;
  researchSessionId: string;
  instrumentId: string;
  status: string;
  startedAt: string;
  submittedAt: string | null;
  durationSeconds: number | null;
};

export type ResearchAnalyticsAnswerRow = {
  responseId: string;
  itemId: string;
  integerValue: number | null;
  textValue: string | null;
  booleanValue: boolean | null;
};

export type ResearchAnalyticsFunnelRow = {
  researchSessionId: string;
  eventType: string;
  eventTime: string;
};

export type ResearchAnalyticsOperatorAttemptRow = {
  researchSessionId: string;
  researchOperatorTaskId: string;
  status: string;
  outcome: string | null;
  confidence: number | null;
  evidenceQuality: number | null;
  startedAt: string | null;
  completedAt: string | null;
};

export type ResearchAnalyticsTourismRow = {
  visitId: string;
  visitDate: string;
  attractionNameTh: string | null;
  travelCompanion: string | null;
  groupSize: number | null;
  transportMode: string | null;
  travelPurpose: string | null;
  overnightStatus: string | null;
  nights: number | null;
  expenseCategory: string | null;
  spendingRange: string | null;
  overallScore: number | null;
  facilityScore: number | null;
  cleanlinessScore: number | null;
  safetyScore: number | null;
  accessibilityScore: number | null;
  informationScore: number | null;
  valueScore: number | null;
  revisitIntention: string | null;
  recommendIntention: string | null;
};

export type AdminResearchOperatorAssessment = {
  attemptId: string;
  participantCode: string;
  participantType: "operator" | "attraction_manager";
  taskId: string;
  taskCode: string;
  taskTitleTh: string;
  status: string;
  outcome: string | null;
  confidence: number | null;
  evidenceQuality: number | null;
  rationale: string | null;
  reviewNote: string | null;
  completedAt: string | null;
};

export type ResearchAnalyticsRows = {
  sessions: ResearchAnalyticsSessionRow[];
  instruments: AdminResearchInstrument[];
  items: AdminResearchItem[];
  responses: ResearchAnalyticsResponseRow[];
  answers: ResearchAnalyticsAnswerRow[];
  funnelEvents: ResearchAnalyticsFunnelRow[];
  operatorTasks: AdminResearchOperatorTask[];
  operatorAttempts: ResearchAnalyticsOperatorAttemptRow[];
  tourismRows: ResearchAnalyticsTourismRow[];
  truncated: boolean;
  governance?: {
    studyKind: ResearchStudyKind;
    studyStatus: ResearchStudyStatus;
    freezeSnapshotId: string | null;
    activationEvidence: Array<Pick<AdminResearchActivationEvidence, "evidenceId" | "evidenceType" | "status" | "reference">>;
  };
};

export type ResearchAnalyticsQuery = {
  studyId: string;
  collectionModes: ResearchCollectionMode[];
  participantType?: ResearchParticipantType;
  dateStart?: string;
  dateEnd?: string;
};

export type ResearchStudyDraftPayload = Omit<AdminResearchStudy,
  "researchStudyId" | "status" | "advisorApprovedAt" | "ethicsReviewStatus" |
  "ethicsApprovedAt" | "approvalReference" | "approvalRecordedBy" | "frozenAt" |
  "approvedTitleTh" | "approvedGeographicBoundary" | "approvedObjectives" |
  "approvedResearchQuestions" | "analysisWording" |
  "createdAt" | "updatedAt"
>;

const STUDY_COLUMNS = "research_study_id, study_code, title_th, title_en, protocol_version, consent_version, notice_version, purpose_th, participation_th, privacy_th, withdrawal_th, contact_email, scope_code, study_kind, source_pilot_study_id, status, starts_at, ends_at, retention_until, advisor_approved_at, ethics_review_status, ethics_approved_at, approval_reference, approval_recorded_by, approved_title_th, approved_geographic_boundary, approved_objectives, approved_research_questions, analysis_wording, frozen_at, owner_admin_id, created_at, updated_at";

function mapStudy(raw: unknown): AdminResearchStudy {
  const row = asRecord(raw);
  return {
    researchStudyId: stringValue(row.research_study_id),
    studyCode: stringValue(row.study_code),
    titleTh: stringValue(row.title_th),
    titleEn: nullableString(row.title_en),
    protocolVersion: stringValue(row.protocol_version),
    consentVersion: stringValue(row.consent_version),
    noticeVersion: stringValue(row.notice_version),
    purposeTh: stringValue(row.purpose_th),
    participationTh: stringValue(row.participation_th),
    privacyTh: stringValue(row.privacy_th),
    withdrawalTh: stringValue(row.withdrawal_th),
    contactEmail: stringValue(row.contact_email),
    scopeCode: stringValue(row.scope_code),
    studyKind: stringValue(row.study_kind) as ResearchStudyKind,
    sourcePilotStudyId: nullableString(row.source_pilot_study_id),
    status: stringValue(row.status) as AdminResearchStudy["status"],
    startsAt: nullableString(row.starts_at),
    endsAt: nullableString(row.ends_at),
    retentionUntil: nullableString(row.retention_until),
    advisorApprovedAt: nullableString(row.advisor_approved_at),
    ethicsReviewStatus: stringValue(row.ethics_review_status) as AdminResearchStudy["ethicsReviewStatus"],
    ethicsApprovedAt: nullableString(row.ethics_approved_at),
    approvalReference: nullableString(row.approval_reference),
    approvalRecordedBy: nullableString(row.approval_recorded_by),
    approvedTitleTh: nullableString(row.approved_title_th),
    approvedGeographicBoundary: nullableString(row.approved_geographic_boundary),
    approvedObjectives: Array.isArray(row.approved_objectives) ? row.approved_objectives.filter((value): value is string => typeof value === "string") : [],
    approvedResearchQuestions: Array.isArray(row.approved_research_questions) ? row.approved_research_questions.filter((value): value is string => typeof value === "string") : [],
    analysisWording: nullableString(row.analysis_wording) as AdminResearchStudy["analysisWording"],
    frozenAt: nullableString(row.frozen_at),
    ownerAdminId: stringValue(row.owner_admin_id),
    createdAt: stringValue(row.created_at),
    updatedAt: nullableString(row.updated_at),
  };
}

function mapActivationEvidence(raw: unknown): AdminResearchActivationEvidence {
  const row = asRecord(raw);
  return {
    evidenceId: stringValue(row.research_activation_evidence_id),
    studyId: stringValue(row.study_id),
    evidenceType: stringValue(row.evidence_type) as AdminResearchActivationEvidence["evidenceType"],
    versionNumber: numberValue(row.version_number),
    status: stringValue(row.status) as AdminResearchActivationEvidence["status"],
    evidenceDate: stringValue(row.evidence_date),
    reference: stringValue(row.reference),
    summary: stringValue(row.summary),
    participantCount: nullableNumber(row.participant_count),
    medianCompletionSeconds: nullableNumber(row.median_completion_seconds),
    abandonmentRate: nullableNumber(row.abandonment_rate),
    missingnessRate: nullableNumber(row.missingness_rate),
    recordedAt: stringValue(row.recorded_at),
  };
}

function mapFreezeSnapshot(raw: unknown): AdminResearchFreezeSnapshot {
  const row = asRecord(raw);
  return {
    snapshotId: stringValue(row.research_freeze_snapshot_id),
    studyId: stringValue(row.study_id),
    scoringVersion: stringValue(row.scoring_version),
    retentionVersion: stringValue(row.retention_version),
    withdrawalVersion: stringValue(row.withdrawal_version),
    languageVersion: stringValue(row.language_version),
    inclusionVersion: stringValue(row.inclusion_version),
    applicationRevision: stringValue(row.application_revision),
    databaseRevision: stringValue(row.database_revision),
    frozenAt: stringValue(row.frozen_at),
  };
}

function mapPilotReview(raw: unknown): AdminResearchPilotReview {
  const row = asRecord(raw);
  return {
    pilotReviewId: stringValue(row.research_pilot_review_id),
    pilotStudyId: stringValue(row.pilot_study_id),
    decision: stringValue(row.decision) as AdminResearchPilotReview["decision"],
    reviewedSessionCount: numberValue(row.reviewed_session_count),
    medianCompletionSeconds: nullableNumber(row.median_completion_seconds),
    abandonmentRate: nullableNumber(row.abandonment_rate),
    missingnessRate: nullableNumber(row.missingness_rate),
    reliabilityNote: stringValue(row.reliability_note),
    decisionRationale: stringValue(row.decision_rationale),
    reviewedAt: stringValue(row.reviewed_at),
  };
}

function mapInstrument(raw: unknown): AdminResearchInstrument {
  const row = asRecord(raw);
  return {
    researchInstrumentId: stringValue(row.research_instrument_id),
    studyId: stringValue(row.study_id),
    instrumentKey: stringValue(row.instrument_key),
    versionNumber: numberValue(row.version_number),
    audience: stringValue(row.audience) as ResearchParticipantType,
    status: stringValue(row.status) as AdminResearchInstrument["status"],
    titleTh: stringValue(row.title_th),
    titleEn: nullableString(row.title_en),
    descriptionTh: nullableString(row.description_th),
    descriptionEn: nullableString(row.description_en),
    estimatedMinutes: nullableNumber(row.estimated_minutes),
    publishedAt: nullableString(row.published_at),
    frozenAt: nullableString(row.frozen_at),
    createdAt: stringValue(row.created_at),
  };
}

function mapItem(raw: unknown): AdminResearchItem {
  const row = asRecord(raw);
  return {
    researchItemId: stringValue(row.research_item_id),
    instrumentId: stringValue(row.instrument_id),
    itemCode: stringValue(row.item_code),
    constructKey: stringValue(row.construct_key),
    promptTh: stringValue(row.prompt_th),
    promptEn: nullableString(row.prompt_en),
    answerType: stringValue(row.answer_type) as AdminResearchItem["answerType"],
    options: row.options_json ?? null,
    displayOrder: numberValue(row.display_order),
    isRequired: booleanValue(row.is_required),
    reverseScore: booleanValue(row.reverse_score),
  };
}

function mapOperatorTask(raw: unknown): AdminResearchOperatorTask {
  const row = asRecord(raw);
  return {
    researchOperatorTaskId: stringValue(row.research_operator_task_id),
    studyId: stringValue(row.study_id),
    taskCode: stringValue(row.task_code),
    versionNumber: numberValue(row.version_number),
    audience: stringValue(row.audience) as AdminResearchOperatorTask["audience"],
    titleTh: stringValue(row.title_th),
    instructionTh: stringValue(row.instruction_th),
    expectedEvidence: stringValue(row.expected_evidence),
    scoringRule: row.scoring_rule,
    displayOrder: numberValue(row.display_order),
    maximumMinutes: nullableNumber(row.maximum_minutes),
    status: stringValue(row.status) as AdminResearchOperatorTask["status"],
    frozenAt: nullableString(row.frozen_at),
  };
}

function chunks<T>(values: T[], size = 150): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
}

async function loadByIds<T>(ids: string[], loader: (idsChunk: string[]) => PromiseLike<{ data: T[] | null; error: { message?: string } | null }>, code: string): Promise<T[]> {
  if (ids.length === 0) return [];
  const results = await Promise.all(chunks(ids).map((idsChunk) => loader(idsChunk)));
  if (results.some((result) => result.error)) throw new Error(code);
  return results.flatMap((result) => result.data ?? []);
}

export async function listAdminResearchStudies(): Promise<AdminResearchStudySummary[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("research_studies").select(STUDY_COLUMNS).order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error("ADMIN_RESEARCH_STUDY_LIST_FAILED");
  const studies = (data ?? []).map(mapStudy);
  const ids = studies.map((study) => study.researchStudyId);
  if (ids.length === 0) return [];
  const [instruments, deployments, sessions] = await Promise.all([
    loadByIds(ids, (part) => supabase.from("research_instruments").select("study_id").in("study_id", part), "ADMIN_RESEARCH_INSTRUMENT_COUNT_FAILED"),
    loadByIds(ids, (part) => supabase.from("research_checkin_codes").select("study_id, is_active").in("study_id", part), "ADMIN_RESEARCH_DEPLOYMENT_COUNT_FAILED"),
    loadByIds(ids, (part) => supabase.from("research_sessions").select("study_id").in("study_id", part), "ADMIN_RESEARCH_SESSION_COUNT_FAILED"),
  ]);
  return studies.map((study) => ({
    ...study,
    instrumentCount: instruments.filter((row) => stringValue(asRecord(row).study_id) === study.researchStudyId).length,
    activeDeploymentCount: deployments.filter((row) => stringValue(asRecord(row).study_id) === study.researchStudyId && booleanValue(asRecord(row).is_active)).length,
    sessionCount: sessions.filter((row) => stringValue(asRecord(row).study_id) === study.researchStudyId).length,
  }));
}

export async function getAdminResearchStudyDetail(studyId: string): Promise<AdminResearchStudyDetail | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data: studyData, error: studyError } = await supabase.from("research_studies").select(STUDY_COLUMNS).eq("research_study_id", studyId).maybeSingle();
  if (studyError) throw new Error("ADMIN_RESEARCH_STUDY_READ_FAILED");
  if (!studyData) return null;
  const mappedStudy = mapStudy(studyData);
  const [
    { data: instrumentData, error: instrumentError },
    { data: deploymentData, error: deploymentError },
    { data: taskData, error: taskError },
    { data: evidenceData, error: evidenceError },
    { data: freezeData, error: freezeError },
    { data: pilotReviewData, error: pilotReviewError },
  ] = await Promise.all([
    supabase.from("research_instruments").select("*").eq("study_id", studyId).order("version_number", { ascending: false }),
    supabase.from("research_checkin_codes").select("study_id, checkin_code_id, default_collection_mode, is_active, starts_at, ends_at, checkin_codes(code, label, attractions(name_th))").eq("study_id", studyId).order("created_at", { ascending: false }),
    supabase.from("research_operator_tasks").select("*").eq("study_id", studyId).order("display_order", { ascending: true }),
    supabase.from("research_activation_evidence").select("*").eq("study_id", studyId).order("recorded_at", { ascending: false }),
    supabase.from("research_freeze_snapshots").select("*").eq("study_id", studyId).maybeSingle(),
    supabase.from("research_pilot_reviews").select("*").eq("pilot_study_id", studyId).order("reviewed_at", { ascending: false }),
  ]);
  if (instrumentError || deploymentError || taskError || evidenceError || freezeError || pilotReviewError) throw new Error("ADMIN_RESEARCH_CONFIGURATION_READ_FAILED");
  let sourcePilotReadyForField = false;
  if (mappedStudy.sourcePilotStudyId) {
    const { data: sourceReview, error: sourceReviewError } = await supabase
      .from("research_pilot_reviews")
      .select("decision")
      .eq("pilot_study_id", mappedStudy.sourcePilotStudyId)
      .order("reviewed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (sourceReviewError) throw new Error("ADMIN_RESEARCH_SOURCE_PILOT_READ_FAILED");
    sourcePilotReadyForField = asRecord(sourceReview).decision === "ready_for_field";
  }
  const instruments = (instrumentData ?? []).map(mapInstrument);
  const items = await loadByIds(
    instruments.map((instrument) => instrument.researchInstrumentId),
    (part) => supabase.from("research_items").select("*").in("instrument_id", part).order("display_order", { ascending: true }),
    "ADMIN_RESEARCH_ITEMS_READ_FAILED",
  );
  const deployments = (deploymentData ?? []).map((raw) => {
    const row = asRecord(raw);
    const codeJoin = Array.isArray(row.checkin_codes) ? asRecord(row.checkin_codes[0]) : asRecord(row.checkin_codes);
    const attractionJoin = Array.isArray(codeJoin.attractions) ? asRecord(codeJoin.attractions[0]) : asRecord(codeJoin.attractions);
    return {
      studyId: stringValue(row.study_id),
      checkinCodeId: numberValue(row.checkin_code_id),
      code: stringValue(codeJoin.code),
      label: nullableString(codeJoin.label),
      attractionNameTh: nullableString(attractionJoin.name_th),
      collectionMode: stringValue(row.default_collection_mode) as ResearchCollectionMode,
      isActive: booleanValue(row.is_active),
      startsAt: nullableString(row.starts_at),
      endsAt: nullableString(row.ends_at),
    } satisfies AdminResearchDeployment;
  });
  return {
    study: mappedStudy,
    instruments,
    items: items.map(mapItem),
    deployments,
    operatorTasks: (taskData ?? []).map(mapOperatorTask),
    activationEvidence: (evidenceData ?? []).map(mapActivationEvidence),
    freezeSnapshot: freezeData ? mapFreezeSnapshot(freezeData) : null,
    pilotReviews: (pilotReviewData ?? []).map(mapPilotReview),
    sourcePilotReadyForField,
  };
}

export async function listAvailableResearchCheckinCodes() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("checkin_codes").select("checkin_code_id, code, label, is_active, attractions(name_th)").eq("is_active", true).order("code").limit(500);
  if (error) throw new Error("ADMIN_RESEARCH_CHECKIN_LIST_FAILED");
  return (data ?? []).map((raw) => {
    const row = asRecord(raw);
    const attraction = Array.isArray(row.attractions) ? asRecord(row.attractions[0]) : asRecord(row.attractions);
    return {
      checkinCodeId: numberValue(row.checkin_code_id),
      code: stringValue(row.code),
      label: nullableString(row.label),
      attractionNameTh: nullableString(attraction.name_th),
    };
  });
}

export async function createResearchStudyDraft(input: ResearchStudyDraftPayload): Promise<AdminResearchStudy> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("research_studies").insert({
    study_code: input.studyCode,
    title_th: input.titleTh,
    title_en: input.titleEn,
    protocol_version: input.protocolVersion,
    consent_version: input.consentVersion,
    notice_version: input.noticeVersion,
    purpose_th: input.purposeTh,
    participation_th: input.participationTh,
    privacy_th: input.privacyTh,
    withdrawal_th: input.withdrawalTh,
    contact_email: input.contactEmail,
    scope_code: input.scopeCode,
    study_kind: input.studyKind,
    source_pilot_study_id: input.sourcePilotStudyId,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    retention_until: input.retentionUntil,
    owner_admin_id: input.ownerAdminId,
  }).select(STUDY_COLUMNS).single();
  if (error) throw new Error(error.code === "23505" ? "RESEARCH_STUDY_CODE_DUPLICATE" : "ADMIN_RESEARCH_STUDY_CREATE_FAILED");
  return mapStudy(data);
}

export async function updateResearchStudyDraft(studyId: string, input: Omit<ResearchStudyDraftPayload, "ownerAdminId">): Promise<AdminResearchStudy> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("research_studies").update({
    study_code: input.studyCode,
    title_th: input.titleTh,
    title_en: input.titleEn,
    protocol_version: input.protocolVersion,
    consent_version: input.consentVersion,
    notice_version: input.noticeVersion,
    purpose_th: input.purposeTh,
    participation_th: input.participationTh,
    privacy_th: input.privacyTh,
    withdrawal_th: input.withdrawalTh,
    contact_email: input.contactEmail,
    scope_code: input.scopeCode,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    retention_until: input.retentionUntil,
  }).eq("research_study_id", studyId).eq("status", "draft").select(STUDY_COLUMNS).single();
  if (error) throw new Error("ADMIN_RESEARCH_STUDY_UPDATE_FAILED");
  return mapStudy(data);
}

export async function recordResearchApproval(input: { studyId: string; advisorApprovedAt: string; ethicsReviewStatus: "not_required" | "approved"; ethicsApprovedAt: string | null; approvalReference: string; approvedTitleTh: string; approvedGeographicBoundary: string; approvedObjectives: string[]; approvedResearchQuestions: string[]; analysisWording: "exploratory" | "descriptive_associational" | "confirmatory"; recordedBy: string }) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("research_studies").update({
    advisor_approved_at: input.advisorApprovedAt,
    ethics_review_status: input.ethicsReviewStatus,
    ethics_approved_at: input.ethicsApprovedAt,
    approval_reference: input.approvalReference,
    approval_recorded_by: input.recordedBy,
    approved_title_th: input.approvedTitleTh,
    approved_geographic_boundary: input.approvedGeographicBoundary,
    approved_objectives: input.approvedObjectives,
    approved_research_questions: input.approvedResearchQuestions,
    analysis_wording: input.analysisWording,
  }).eq("research_study_id", input.studyId).eq("status", "draft").select("research_study_id").maybeSingle();
  if (error || !data) throw new Error("ADMIN_RESEARCH_APPROVAL_UPDATE_FAILED");
}

export async function createResearchInstrumentDraft(input: { studyId: string; instrumentKey: string; versionNumber: number; audience: ResearchParticipantType; titleTh: string; titleEn: string | null; descriptionTh: string | null; descriptionEn: string | null; estimatedMinutes: number | null; createdBy: string }) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("research_instruments").insert({
    study_id: input.studyId,
    instrument_key: input.instrumentKey,
    version_number: input.versionNumber,
    audience: input.audience,
    title_th: input.titleTh,
    title_en: input.titleEn,
    description_th: input.descriptionTh,
    description_en: input.descriptionEn,
    estimated_minutes: input.estimatedMinutes,
    created_by: input.createdBy,
  }).select("*").single();
  if (error) throw new Error(error.code === "23505" ? "RESEARCH_INSTRUMENT_VERSION_DUPLICATE" : "ADMIN_RESEARCH_INSTRUMENT_CREATE_FAILED");
  return mapInstrument(data);
}

export async function createResearchItem(input: Omit<AdminResearchItem, "researchItemId">): Promise<AdminResearchItem> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("research_items").insert({
    instrument_id: input.instrumentId,
    item_code: input.itemCode,
    construct_key: input.constructKey,
    prompt_th: input.promptTh,
    prompt_en: input.promptEn,
    answer_type: input.answerType,
    options_json: input.options,
    display_order: input.displayOrder,
    is_required: input.isRequired,
    reverse_score: input.reverseScore,
  }).select("*").single();
  if (error) throw new Error(error.code === "23505" ? "RESEARCH_ITEM_ORDER_OR_CODE_DUPLICATE" : "ADMIN_RESEARCH_ITEM_CREATE_FAILED");
  return mapItem(data);
}

export async function getResearchInstrumentForManagement(instrumentId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("research_instruments").select("*").eq("research_instrument_id", instrumentId).maybeSingle();
  if (error) throw new Error("ADMIN_RESEARCH_INSTRUMENT_READ_FAILED");
  if (!data) return null;
  const { data: itemData, error: itemError } = await supabase.from("research_items").select("*").eq("instrument_id", instrumentId).order("display_order", { ascending: true });
  if (itemError) throw new Error("ADMIN_RESEARCH_ITEMS_READ_FAILED");
  return { instrument: mapInstrument(data), items: (itemData ?? []).map(mapItem) };
}

export async function publishResearchInstrument(instrumentId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase.from("research_instruments").update({ status: "published", published_at: now, frozen_at: now }).eq("research_instrument_id", instrumentId).eq("status", "draft").select("research_instrument_id").maybeSingle();
  if (error || !data) throw new Error("ADMIN_RESEARCH_INSTRUMENT_PUBLISH_FAILED");
}

export async function createResearchOperatorTaskDraft(input: {
  studyId: string;
  taskCode: string;
  versionNumber: number;
  audience: "operator" | "attraction_manager";
  titleTh: string;
  titleEn: string | null;
  instructionTh: string;
  instructionEn: string | null;
  expectedEvidence: string;
  scoringRule: Record<string, unknown>;
  displayOrder: number;
  maximumMinutes: number | null;
  createdBy: string;
}) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("research_operator_tasks").insert({
    study_id: input.studyId,
    task_code: input.taskCode,
    version_number: input.versionNumber,
    audience: input.audience,
    title_th: input.titleTh,
    title_en: input.titleEn,
    instruction_th: input.instructionTh,
    instruction_en: input.instructionEn,
    expected_evidence: input.expectedEvidence,
    scoring_rule: input.scoringRule,
    display_order: input.displayOrder,
    maximum_minutes: input.maximumMinutes,
    created_by: input.createdBy,
  }).select("*").single();
  if (error) throw new Error(error.code === "23505" ? "RESEARCH_OPERATOR_TASK_VERSION_DUPLICATE" : "ADMIN_RESEARCH_OPERATOR_TASK_CREATE_FAILED");
  return mapOperatorTask(data);
}

export async function publishResearchOperatorTask(taskId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase.from("research_operator_tasks").update({ status: "published", published_at: now, frozen_at: now }).eq("research_operator_task_id", taskId).eq("status", "draft").select("research_operator_task_id").maybeSingle();
  if (error || !data) throw new Error("ADMIN_RESEARCH_OPERATOR_TASK_PUBLISH_FAILED");
}

export async function listResearchOperatorAssessments(
  studyId: string,
): Promise<AdminResearchOperatorAssessment[]> {
  const supabase = createSupabaseServiceRoleClient();
  const detail = await getAdminResearchStudyDetail(studyId);
  if (!detail || detail.operatorTasks.length === 0) return [];
  const taskById = new Map(detail.operatorTasks.map((task) => [task.researchOperatorTaskId, task]));
  const { data: attemptData, error: attemptError } = await supabase
    .from("research_operator_task_attempts")
    .select("research_operator_task_attempt_id, research_session_id, research_operator_task_id, status, outcome, confidence, evidence_quality, rationale, coded_notes, completed_at")
    .in("research_operator_task_id", [...taskById.keys()])
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(500);
  if (attemptError) throw new Error("ADMIN_RESEARCH_OPERATOR_ASSESSMENT_READ_FAILED");

  const attempts = (attemptData ?? []).map(asRecord);
  const sessionIds = [...new Set(attempts.map((row) => stringValue(row.research_session_id)).filter(Boolean))];
  if (sessionIds.length === 0) return [];
  const { data: sessionData, error: sessionError } = await supabase
    .from("research_sessions")
    .select("research_session_id, participant_code, participant_type, status, inclusion_status, withdrawn_at")
    .in("research_session_id", sessionIds)
    .neq("status", "withdrawn")
    .neq("inclusion_status", "excluded")
    .is("withdrawn_at", null);
  if (sessionError) throw new Error("ADMIN_RESEARCH_OPERATOR_SESSION_READ_FAILED");
  const sessionById = new Map((sessionData ?? []).map((raw) => {
    const row = asRecord(raw);
    return [stringValue(row.research_session_id), row] as const;
  }));

  return attempts.flatMap((row) => {
    const taskId = stringValue(row.research_operator_task_id);
    const task = taskById.get(taskId);
    const session = sessionById.get(stringValue(row.research_session_id));
    if (!task || !session) return [];
    const participantType = stringValue(session.participant_type);
    if (participantType !== "operator" && participantType !== "attraction_manager") return [];
    return [{
      attemptId: stringValue(row.research_operator_task_attempt_id),
      participantCode: stringValue(session.participant_code),
      participantType,
      taskId,
      taskCode: task.taskCode,
      taskTitleTh: task.titleTh,
      status: stringValue(row.status),
      outcome: nullableString(row.outcome),
      confidence: nullableNumber(row.confidence),
      evidenceQuality: nullableNumber(row.evidence_quality),
      rationale: nullableString(row.rationale),
      reviewNote: (() => {
        const notes = row.coded_notes && typeof row.coded_notes === "object" && !Array.isArray(row.coded_notes) ? row.coded_notes as Record<string, unknown> : null;
        return notes && typeof notes.review_note === "string" ? notes.review_note : null;
      })(),
      completedAt: nullableString(row.completed_at),
    }];
  });
}

export async function assessResearchOperatorAttempt(input: {
  attemptId: string;
  outcome: "passed" | "partial" | "failed";
  evidenceQuality: number;
  reviewNote?: string;
}) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("research_operator_task_attempts")
    .update({
      outcome: input.outcome,
      evidence_quality: input.evidenceQuality,
      coded_notes: input.reviewNote ? { review_note: input.reviewNote } : null,
      updated_at: new Date().toISOString(),
    })
    .eq("research_operator_task_attempt_id", input.attemptId)
    .eq("status", "completed")
    .select("research_operator_task_attempt_id")
    .maybeSingle();
  if (error) throw new Error("ADMIN_RESEARCH_OPERATOR_ASSESSMENT_UPDATE_FAILED");
  return Boolean(data);
}

export async function upsertResearchDeployment(input: { studyId: string; checkinCodeId: number; collectionMode: ResearchCollectionMode; isActive: boolean; startsAt: string | null; endsAt: string | null; createdBy: string }) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.from("research_checkin_codes").upsert({
    study_id: input.studyId,
    checkin_code_id: input.checkinCodeId,
    default_collection_mode: input.collectionMode,
    is_active: input.isActive,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    created_by: input.createdBy,
  }, { onConflict: "study_id,checkin_code_id" });
  if (error) throw new Error(error.code === "23505" ? "RESEARCH_CHECKIN_ALREADY_ACTIVE" : "ADMIN_RESEARCH_DEPLOYMENT_SAVE_FAILED");
}

export async function insertResearchActivationEvidence(input: {
  studyId: string;
  evidenceType: AdminResearchActivationEvidence["evidenceType"];
  versionNumber: number;
  status: AdminResearchActivationEvidence["status"];
  evidenceDate: string;
  reference: string;
  summary: string;
  participantCount: number | null;
  medianCompletionSeconds: number | null;
  abandonmentRate: number | null;
  missingnessRate: number | null;
  recordedBy: string;
}) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("research_activation_evidence").insert({
    study_id: input.studyId,
    evidence_type: input.evidenceType,
    version_number: input.versionNumber,
    status: input.status,
    evidence_date: input.evidenceDate,
    reference: input.reference,
    summary: input.summary,
    participant_count: input.participantCount,
    median_completion_seconds: input.medianCompletionSeconds,
    abandonment_rate: input.abandonmentRate,
    missingness_rate: input.missingnessRate,
    recorded_by: input.recordedBy,
  }).select("*").single();
  if (error) throw new Error(error.code === "23505" ? "RESEARCH_EVIDENCE_VERSION_DUPLICATE" : "ADMIN_RESEARCH_EVIDENCE_CREATE_FAILED");
  return mapActivationEvidence(data);
}

export async function insertResearchFreezeSnapshot(input: {
  studyId: string;
  protocolVersion: string;
  consentVersion: string;
  noticeVersion: string;
  instrumentManifest: unknown[];
  taskManifest: unknown[];
  scoringVersion: string;
  retentionVersion: string;
  withdrawalVersion: string;
  languageVersion: string;
  inclusionVersion: string;
  applicationRevision: string;
  databaseRevision: string;
  frozenBy: string;
}) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("research_freeze_snapshots").insert({
    study_id: input.studyId,
    protocol_version: input.protocolVersion,
    consent_version: input.consentVersion,
    notice_version: input.noticeVersion,
    instrument_manifest: input.instrumentManifest,
    task_manifest: input.taskManifest,
    scoring_version: input.scoringVersion,
    retention_version: input.retentionVersion,
    withdrawal_version: input.withdrawalVersion,
    language_version: input.languageVersion,
    inclusion_version: input.inclusionVersion,
    application_revision: input.applicationRevision,
    database_revision: input.databaseRevision,
    frozen_by: input.frozenBy,
  }).select("*").single();
  if (error) throw new Error(error.code === "23505" ? "RESEARCH_FREEZE_ALREADY_EXISTS" : "ADMIN_RESEARCH_FREEZE_CREATE_FAILED");
  return mapFreezeSnapshot(data);
}

export async function insertResearchPilotReview(input: {
  pilotStudyId: string;
  decision: AdminResearchPilotReview["decision"];
  reviewedSessionCount: number;
  medianCompletionSeconds: number | null;
  abandonmentRate: number | null;
  missingnessRate: number | null;
  reliabilityNote: string;
  decisionRationale: string;
  reviewedBy: string;
}) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("research_pilot_reviews").insert({
    pilot_study_id: input.pilotStudyId,
    decision: input.decision,
    reviewed_session_count: input.reviewedSessionCount,
    median_completion_seconds: input.medianCompletionSeconds,
    abandonment_rate: input.abandonmentRate,
    missingness_rate: input.missingnessRate,
    reliability_note: input.reliabilityNote,
    decision_rationale: input.decisionRationale,
    reviewed_by: input.reviewedBy,
  }).select("*").single();
  if (error) throw new Error("ADMIN_RESEARCH_PILOT_REVIEW_CREATE_FAILED");
  return mapPilotReview(data);
}

export async function activateResearchStudy(studyId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("research_studies").update({ status: "active", frozen_at: new Date().toISOString() }).eq("research_study_id", studyId).eq("status", "draft").select("research_study_id").maybeSingle();
  if (error || !data) throw new Error("ADMIN_RESEARCH_STUDY_ACTIVATE_FAILED");
}

export async function transitionResearchStudy(studyId: string, fromStatus: ResearchStudyStatus, toStatus: ResearchStudyStatus) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("research_studies").update({ status: toStatus }).eq("research_study_id", studyId).eq("status", fromStatus).select("research_study_id").maybeSingle();
  if (error || !data) throw new Error("ADMIN_RESEARCH_STUDY_TRANSITION_FAILED");
}

export async function getResearchAnalyticsRows(query: ResearchAnalyticsQuery): Promise<ResearchAnalyticsRows> {
  const supabase = createSupabaseServiceRoleClient();
  let sessionQuery = supabase.from("research_sessions").select("research_session_id, participant_code, participant_type, collection_mode, status, inclusion_status, consented_at, started_at, completed_at, withdrawn_at, created_at, visit_id").eq("study_id", query.studyId).in("collection_mode", query.collectionModes).order("created_at", { ascending: true }).limit(5001);
  if (query.participantType) sessionQuery = sessionQuery.eq("participant_type", query.participantType);
  if (query.dateStart) sessionQuery = sessionQuery.gte("created_at", `${query.dateStart}T00:00:00.000Z`);
  if (query.dateEnd) sessionQuery = sessionQuery.lte("created_at", `${query.dateEnd}T23:59:59.999Z`);
  const { data: sessionData, error: sessionError } = await sessionQuery;
  if (sessionError) throw new Error("ADMIN_RESEARCH_ANALYTICS_SESSION_FAILED");
  const truncated = (sessionData?.length ?? 0) > 5000;
  const sessions = (sessionData ?? []).slice(0, 5000).map((raw) => {
    const row = asRecord(raw);
    return {
      researchSessionId: stringValue(row.research_session_id),
      participantCode: stringValue(row.participant_code),
      participantType: stringValue(row.participant_type) as ResearchParticipantType,
      collectionMode: stringValue(row.collection_mode) as ResearchCollectionMode,
      status: stringValue(row.status),
      inclusionStatus: stringValue(row.inclusion_status),
      consentedAt: stringValue(row.consented_at),
      startedAt: nullableString(row.started_at),
      completedAt: nullableString(row.completed_at),
      withdrawnAt: nullableString(row.withdrawn_at),
      createdAt: stringValue(row.created_at),
      visitId: nullableString(row.visit_id),
    };
  });
  const study = await getAdminResearchStudyDetail(query.studyId);
  if (!study) throw new Error("ADMIN_RESEARCH_STUDY_NOT_FOUND");
  const sessionIds = sessions.map((session) => session.researchSessionId);
  const responseData = await loadByIds(sessionIds, (part) => supabase.from("research_responses").select("research_response_id, research_session_id, instrument_id, status, started_at, submitted_at, duration_seconds").in("research_session_id", part), "ADMIN_RESEARCH_ANALYTICS_RESPONSE_FAILED");
  const responses = responseData.map((raw) => {
    const row = asRecord(raw);
    return {
      researchResponseId: stringValue(row.research_response_id),
      researchSessionId: stringValue(row.research_session_id),
      instrumentId: stringValue(row.instrument_id),
      status: stringValue(row.status),
      startedAt: stringValue(row.started_at),
      submittedAt: nullableString(row.submitted_at),
      durationSeconds: nullableNumber(row.duration_seconds),
    };
  });
  const answerData = await loadByIds(responses.map((response) => response.researchResponseId), (part) => supabase.from("research_answers").select("response_id, item_id, integer_value, text_value, boolean_value").in("response_id", part), "ADMIN_RESEARCH_ANALYTICS_ANSWER_FAILED");
  const funnelData = await loadByIds(sessionIds, (part) => supabase.from("funnel_events").select("research_session_id, event_type, event_time").in("research_session_id", part).order("event_time", { ascending: true }), "ADMIN_RESEARCH_ANALYTICS_FUNNEL_FAILED");
  const attemptData = await loadByIds(sessionIds, (part) => supabase.from("research_operator_task_attempts").select("research_session_id, research_operator_task_id, status, outcome, confidence, evidence_quality, started_at, completed_at").in("research_session_id", part), "ADMIN_RESEARCH_ANALYTICS_OPERATOR_FAILED");
  const visitData = await loadByIds(
    sessions.map((session) => session.visitId).filter((visitId): visitId is string => Boolean(visitId)),
    (part) => supabase.from("visits").select("visit_id, visit_date, group_size, overnight_status, nights, attractions(name_th), travel_companions(name_th), transport_modes(name_th), travel_purposes(name_th), visit_expenses(expense_categories(name_th), spending_ranges(range_label_th)), satisfaction_surveys(overall_score, facility_score, cleanliness_score, safety_score, accessibility_score, information_score, value_score, revisit_intention, recommend_intention)").in("visit_id", part),
    "ADMIN_RESEARCH_ANALYTICS_TOURISM_FAILED",
  );
  return {
    sessions,
    instruments: study.instruments,
    items: study.items,
    responses,
    answers: answerData.map((raw) => {
      const row = asRecord(raw);
      return { responseId: stringValue(row.response_id), itemId: stringValue(row.item_id), integerValue: nullableNumber(row.integer_value), textValue: nullableString(row.text_value), booleanValue: typeof row.boolean_value === "boolean" ? row.boolean_value : null };
    }),
    funnelEvents: funnelData.map((raw) => {
      const row = asRecord(raw);
      return { researchSessionId: stringValue(row.research_session_id), eventType: stringValue(row.event_type), eventTime: stringValue(row.event_time) };
    }),
    operatorTasks: study.operatorTasks,
    operatorAttempts: attemptData.map((raw) => {
      const row = asRecord(raw);
      return { researchSessionId: stringValue(row.research_session_id), researchOperatorTaskId: stringValue(row.research_operator_task_id), status: stringValue(row.status), outcome: nullableString(row.outcome), confidence: nullableNumber(row.confidence), evidenceQuality: nullableNumber(row.evidence_quality), startedAt: nullableString(row.started_at), completedAt: nullableString(row.completed_at) };
    }),
    tourismRows: visitData.map((raw) => {
      const row = asRecord(raw);
      const attraction = Array.isArray(row.attractions) ? asRecord(row.attractions[0]) : asRecord(row.attractions);
      const companion = Array.isArray(row.travel_companions) ? asRecord(row.travel_companions[0]) : asRecord(row.travel_companions);
      const transport = Array.isArray(row.transport_modes) ? asRecord(row.transport_modes[0]) : asRecord(row.transport_modes);
      const purpose = Array.isArray(row.travel_purposes) ? asRecord(row.travel_purposes[0]) : asRecord(row.travel_purposes);
      const expense = Array.isArray(row.visit_expenses) ? asRecord(row.visit_expenses[0]) : asRecord(row.visit_expenses);
      const category = Array.isArray(expense.expense_categories) ? asRecord(expense.expense_categories[0]) : asRecord(expense.expense_categories);
      const spending = Array.isArray(expense.spending_ranges) ? asRecord(expense.spending_ranges[0]) : asRecord(expense.spending_ranges);
      const survey = Array.isArray(row.satisfaction_surveys) ? asRecord(row.satisfaction_surveys[0]) : asRecord(row.satisfaction_surveys);
      return {
        visitId: stringValue(row.visit_id),
        visitDate: stringValue(row.visit_date),
        attractionNameTh: nullableString(attraction.name_th),
        travelCompanion: nullableString(companion.name_th),
        groupSize: nullableNumber(row.group_size),
        transportMode: nullableString(transport.name_th),
        travelPurpose: nullableString(purpose.name_th),
        overnightStatus: nullableString(row.overnight_status),
        nights: nullableNumber(row.nights),
        expenseCategory: nullableString(category.name_th),
        spendingRange: nullableString(spending.range_label_th),
        overallScore: nullableNumber(survey.overall_score),
        facilityScore: nullableNumber(survey.facility_score),
        cleanlinessScore: nullableNumber(survey.cleanliness_score),
        safetyScore: nullableNumber(survey.safety_score),
        accessibilityScore: nullableNumber(survey.accessibility_score),
        informationScore: nullableNumber(survey.information_score),
        valueScore: nullableNumber(survey.value_score),
        revisitIntention: nullableString(survey.revisit_intention),
        recommendIntention: nullableString(survey.recommend_intention),
      };
    }),
    truncated,
    governance: {
      studyKind: study.study.studyKind,
      studyStatus: study.study.status,
      freezeSnapshotId: study.freezeSnapshot?.snapshotId ?? null,
      activationEvidence: study.activationEvidence.map((evidence) => ({
        evidenceId: evidence.evidenceId,
        evidenceType: evidence.evidenceType,
        status: evidence.status,
        reference: evidence.reference,
      })),
    },
  };
}
