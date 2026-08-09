import "server-only";

import {
  getAdminResearchStudyDetail,
  getResearchAnalyticsRows,
  type AdminResearchStudyDetail,
  type ResearchAnalyticsRows,
  type ResearchAnalyticsSessionRow,
} from "@/lib/repositories/admin-research.repository";
import { RESEARCH_SMALL_CELL_THRESHOLD } from "@/lib/services/admin-research.service";
import type { AdminResearchExportFilters } from "@/lib/validation/admin-research";

export class ResearchExportError extends Error {
  constructor(
    public readonly code: "STUDY_NOT_FOUND" | "STUDY_NOT_APPROVED" | "SMALL_SAMPLE" | "TRUNCATED" | "UNSUPPORTED_DATASET",
    message: string,
  ) {
    super(message);
    this.name = "ResearchExportError";
  }
}

export function assertResearchStudyExportable(detail: AdminResearchStudyDetail): void {
  const { study } = detail;
  const advisorApproved = Boolean(study.advisorApprovedAt && study.approvalReference && study.approvalRecordedBy);
  const ethicsApproved = study.ethicsReviewStatus === "not_required"
    || (study.ethicsReviewStatus === "approved" && Boolean(study.ethicsApprovedAt));

  if (study.status === "draft" || !study.frozenAt || !advisorApproved || !ethicsApproved) {
    throw new ResearchExportError(
      "STUDY_NOT_APPROVED",
      "ส่งออกได้เฉพาะโครงการที่ตรึงเวอร์ชันและบันทึกการอนุมัติครบแล้ว",
    );
  }
}

function eligibleSessions(rows: ResearchAnalyticsRows) {
  return rows.sessions.filter((session) => session.inclusionStatus !== "excluded" && !["withdrawn", "excluded", "expired"].includes(session.status));
}

function participantMap(sessions: ResearchAnalyticsSessionRow[]) {
  return new Map(sessions.map((session) => [session.researchSessionId, session]));
}

function releasedSessionIdsForDataset(input: {
  dataset: AdminResearchExportFilters["dataset"];
  rows: ResearchAnalyticsRows;
  sessionsById: Map<string, ResearchAnalyticsSessionRow>;
}): Set<string> {
  const released = new Set<string>();
  const addIfEligible = (sessionId: string) => {
    if (input.sessionsById.has(sessionId)) released.add(sessionId);
  };

  if (input.dataset === "participants") {
    return new Set(input.sessionsById.keys());
  }
  if (input.dataset === "responses") {
    input.rows.responses.forEach((response) => addIfEligible(response.researchSessionId));
  } else if (input.dataset === "answers") {
    const responseById = new Map(input.rows.responses.map((response) => [response.researchResponseId, response]));
    for (const answer of input.rows.answers) {
      const response = responseById.get(answer.responseId);
      if (response) addIfEligible(response.researchSessionId);
    }
  } else if (input.dataset === "funnel") {
    input.rows.funnelEvents.forEach((event) => addIfEligible(event.researchSessionId));
  } else if (input.dataset === "tourism") {
    const sessionByVisit = new Map(
      [...input.sessionsById.values()]
        .filter((session) => session.visitId)
        .map((session) => [session.visitId as string, session.researchSessionId]),
    );
    for (const tourism of input.rows.tourismRows) {
      const sessionId = sessionByVisit.get(tourism.visitId);
      if (sessionId) released.add(sessionId);
    }
  } else if (input.dataset === "operator_tasks") {
    input.rows.operatorAttempts.forEach((attempt) => addIfEligible(attempt.researchSessionId));
  }

  return released;
}

function baseFields(detail: AdminResearchStudyDetail, exportedAt: string) {
  return {
    study_code: detail.study.studyCode,
    protocol_version: detail.study.protocolVersion,
    consent_version: detail.study.consentVersion,
    notice_version: detail.study.noticeVersion,
    exported_at: exportedAt,
  };
}

function assertMinimumCellSize(groups: Map<string, Set<string>>): void {
  if ([...groups.values()].some((sessionIds) => sessionIds.size < RESEARCH_SMALL_CELL_THRESHOLD)) {
    throw new ResearchExportError(
      "SMALL_SAMPLE",
      `ไม่สามารถส่งออกได้ เนื่องจากมีกลุ่มย่อยน้อยกว่า ${RESEARCH_SMALL_CELL_THRESHOLD} รายการ`,
    );
  }
}

function addToCell(groups: Map<string, Set<string>>, key: string, sessionId: string): void {
  const sessionIds = groups.get(key) ?? new Set<string>();
  sessionIds.add(sessionId);
  groups.set(key, sessionIds);
}

function assertReleasedSessionCells(sessions: ResearchAnalyticsSessionRow[]): void {
  const groups = new Map<string, Set<string>>();
  for (const session of sessions) {
    addToCell(groups, `participant:${session.participantType}`, session.researchSessionId);
    addToCell(groups, `mode:${session.collectionMode}`, session.researchSessionId);
    addToCell(groups, `participant-mode:${session.participantType}:${session.collectionMode}`, session.researchSessionId);
  }
  assertMinimumCellSize(groups);
}

function assertDatasetCells(input: {
  dataset: AdminResearchExportFilters["dataset"];
  rows: ResearchAnalyticsRows;
  sessionsById: Map<string, ResearchAnalyticsSessionRow>;
}): void {
  const groups = new Map<string, Set<string>>();

  if (input.dataset === "responses" || input.dataset === "answers") {
    const responseById = new Map(input.rows.responses.map((response) => [response.researchResponseId, response]));
    if (input.dataset === "responses") {
      for (const response of input.rows.responses) {
        if (input.sessionsById.has(response.researchSessionId)) {
          addToCell(groups, `instrument:${response.instrumentId}`, response.researchSessionId);
        }
      }
    } else {
      for (const answer of input.rows.answers) {
        const response = responseById.get(answer.responseId);
        if (response && input.sessionsById.has(response.researchSessionId)) {
          addToCell(groups, `item:${answer.itemId}`, response.researchSessionId);
        }
      }
    }
  } else if (input.dataset === "funnel") {
    for (const event of input.rows.funnelEvents) {
      if (input.sessionsById.has(event.researchSessionId)) {
        addToCell(groups, `event:${event.eventType}`, event.researchSessionId);
      }
    }
  } else if (input.dataset === "tourism") {
    const sessionByVisit = new Map(
      [...input.sessionsById.values()]
        .filter((session) => session.visitId)
        .map((session) => [session.visitId as string, session]),
    );
    for (const tourism of input.rows.tourismRows) {
      const session = sessionByVisit.get(tourism.visitId);
      if (session) addToCell(groups, `attraction:${tourism.attractionNameTh}`, session.researchSessionId);
    }
  } else if (input.dataset === "operator_tasks") {
    for (const attempt of input.rows.operatorAttempts) {
      if (input.sessionsById.has(attempt.researchSessionId)) {
        addToCell(groups, `task:${attempt.researchOperatorTaskId}`, attempt.researchSessionId);
      }
    }
  }

  assertMinimumCellSize(groups);
}

export function buildDeidentifiedResearchExportRows(input: {
  detail: AdminResearchStudyDetail;
  rows: ResearchAnalyticsRows;
  dataset: AdminResearchExportFilters["dataset"];
  exportedAt?: string;
}): Array<Record<string, unknown>> {
  const exportedAt = input.exportedAt ?? new Date().toISOString();
  const base = baseFields(input.detail, exportedAt);
  const sessions = eligibleSessions(input.rows);
  if (input.rows.truncated) throw new ResearchExportError("TRUNCATED", "ผลลัพธ์ถูกตัด กรุณาลดช่วงวันที่ก่อนส่งออก");
  const sessionsById = participantMap(sessions);
  if (input.dataset !== "codebook") {
    const releasedSessionIds = releasedSessionIdsForDataset({ dataset: input.dataset, rows: input.rows, sessionsById });
    const releasedSessions = sessions.filter((session) => releasedSessionIds.has(session.researchSessionId));
    if (releasedSessions.length < RESEARCH_SMALL_CELL_THRESHOLD) {
      throw new ResearchExportError("SMALL_SAMPLE", `ต้องมี research sessions ที่เข้าเกณฑ์อย่างน้อย ${RESEARCH_SMALL_CELL_THRESHOLD} รายการ`);
    }
    assertReleasedSessionCells(releasedSessions);
    assertDatasetCells({ dataset: input.dataset, rows: input.rows, sessionsById });
  }
  const instrumentById = new Map(input.rows.instruments.map((instrument) => [instrument.researchInstrumentId, instrument]));
  const itemById = new Map(input.rows.items.map((item) => [item.researchItemId, item]));
  const responseById = new Map(input.rows.responses.map((response) => [response.researchResponseId, response]));

  if (input.dataset === "participants") {
    return sessions.map((session) => ({ ...base, participant_code: session.participantCode, participant_type: session.participantType, collection_mode: session.collectionMode, session_status: session.status, inclusion_status: session.inclusionStatus, consented_at: session.consentedAt, started_at: session.startedAt, completed_at: session.completedAt }));
  }
  if (input.dataset === "responses") {
    return input.rows.responses.flatMap((response) => {
      const session = sessionsById.get(response.researchSessionId);
      const instrument = instrumentById.get(response.instrumentId);
      if (!session || !instrument) return [];
      return [{ ...base, participant_code: session.participantCode, participant_type: session.participantType, collection_mode: session.collectionMode, instrument_key: instrument.instrumentKey, instrument_version: instrument.versionNumber, instrument_audience: instrument.audience, response_status: response.status, started_at: response.startedAt, submitted_at: response.submittedAt, duration_seconds: response.durationSeconds }];
    });
  }
  if (input.dataset === "answers") {
    return input.rows.answers.flatMap((answer) => {
      const response = responseById.get(answer.responseId);
      const session = response ? sessionsById.get(response.researchSessionId) : null;
      const instrument = response ? instrumentById.get(response.instrumentId) : null;
      const item = itemById.get(answer.itemId);
      if (!response || !session || !instrument || !item) return [];
      const isFreeText = item.answerType === "short_text" || item.answerType === "long_text";
      return [{ ...base, participant_code: session.participantCode, participant_type: session.participantType, collection_mode: session.collectionMode, instrument_key: instrument.instrumentKey, instrument_version: instrument.versionNumber, item_code: item.itemCode, construct_key: item.constructKey, answer_type: item.answerType, integer_value: answer.integerValue, boolean_value: answer.booleanValue, text_value: isFreeText ? null : answer.textValue, text_response_present: isFreeText ? Boolean(answer.textValue?.trim()) : null, free_text_review_required: isFreeText }];
    });
  }
  if (input.dataset === "funnel") {
    return input.rows.funnelEvents.flatMap((event) => {
      const session = sessionsById.get(event.researchSessionId);
      if (!session) return [];
      return [{ ...base, participant_code: session.participantCode, participant_type: session.participantType, collection_mode: session.collectionMode, event_type: event.eventType, event_time: event.eventTime }];
    });
  }
  if (input.dataset === "tourism") {
    const sessionByVisit = new Map(sessions.filter((session) => session.visitId).map((session) => [session.visitId as string, session]));
    return input.rows.tourismRows.flatMap((tourism) => {
      const session = sessionByVisit.get(tourism.visitId);
      if (!session) return [];
      return [{ ...base, participant_code: session.participantCode, collection_mode: session.collectionMode, visit_date: tourism.visitDate, attraction_name_th: tourism.attractionNameTh, travel_companion: tourism.travelCompanion, group_size: tourism.groupSize, transport_mode: tourism.transportMode, travel_purpose: tourism.travelPurpose, overnight_status: tourism.overnightStatus, nights: tourism.nights, self_reported_expense_category: tourism.expenseCategory, self_reported_spending_range: tourism.spendingRange, overall_score: tourism.overallScore, facility_score: tourism.facilityScore, cleanliness_score: tourism.cleanlinessScore, safety_score: tourism.safetyScore, accessibility_score: tourism.accessibilityScore, information_score: tourism.informationScore, value_score: tourism.valueScore, revisit_intention: tourism.revisitIntention, recommend_intention: tourism.recommendIntention }];
    });
  }
  if (input.dataset === "operator_tasks") {
    const taskById = new Map(input.rows.operatorTasks.map((task) => [task.researchOperatorTaskId, task]));
    return input.rows.operatorAttempts.flatMap((attempt) => {
      const session = sessionsById.get(attempt.researchSessionId);
      const task = taskById.get(attempt.researchOperatorTaskId);
      if (!session || !task) return [];
      return [{ ...base, participant_code: session.participantCode, participant_type: session.participantType, collection_mode: session.collectionMode, task_code: task.taskCode, task_version: task.versionNumber, task_audience: task.audience, attempt_status: attempt.status, outcome: attempt.outcome, confidence: attempt.confidence, evidence_quality: attempt.evidenceQuality, started_at: attempt.startedAt, completed_at: attempt.completedAt }];
    });
  }
  if (input.dataset === "codebook") {
    return input.rows.items.map((item) => {
      const instrument = instrumentById.get(item.instrumentId);
      return { ...base, instrument_key: instrument?.instrumentKey ?? null, instrument_version: instrument?.versionNumber ?? null, instrument_audience: instrument?.audience ?? null, item_code: item.itemCode, construct_key: item.constructKey, prompt_th: item.promptTh, prompt_en: item.promptEn, answer_type: item.answerType, options_json: item.options ? JSON.stringify(item.options) : null, is_required: item.isRequired, reverse_score: item.reverseScore, display_order: item.displayOrder };
    });
  }
  throw new ResearchExportError("UNSUPPORTED_DATASET", "ไม่รองรับชุดข้อมูลนี้");
}

export async function loadDeidentifiedResearchExport(filters: AdminResearchExportFilters) {
  const detail = await getAdminResearchStudyDetail(filters.studyId);
  if (!detail) throw new ResearchExportError("STUDY_NOT_FOUND", "ไม่พบโครงการวิจัย");
  assertResearchStudyExportable(detail);
  const rows = await getResearchAnalyticsRows({
    studyId: filters.studyId,
    collectionModes: filters.collectionModes,
    participantType: filters.participantType,
    dateStart: filters.dateFrom,
    dateEnd: filters.dateTo,
  });
  return buildDeidentifiedResearchExportRows({ detail, rows, dataset: filters.dataset });
}
