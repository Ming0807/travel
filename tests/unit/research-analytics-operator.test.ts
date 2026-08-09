import { describe, expect, it } from "vitest";

import type { ResearchAnalyticsRows } from "@/lib/repositories/admin-research.repository";
import { summarizeResearchAnalytics } from "@/lib/services/admin-research.service";

function rowsWithOperatorAttempts(count: number, confidence: number | null, outcome: string | null): ResearchAnalyticsRows {
  const sessions = Array.from({ length: count }, (_, index) => ({
    researchSessionId: `session-${index}`,
    participantCode: `participant-${index}`,
    participantType: "operator" as const,
    collectionMode: "field_observation" as const,
    status: "completed",
    inclusionStatus: "included",
    consentedAt: "2026-09-01T00:00:00.000Z",
    startedAt: "2026-09-01T00:00:00.000Z",
    completedAt: "2026-09-01T00:05:00.000Z",
    withdrawnAt: null,
    createdAt: "2026-09-01T00:00:00.000Z",
    visitId: null,
  }));
  return {
    sessions,
    instruments: [],
    items: [],
    responses: [],
    answers: [],
    funnelEvents: [],
    operatorTasks: [],
    operatorAttempts: sessions.map((session) => ({
      researchSessionId: session.researchSessionId,
      researchOperatorTaskId: "task-1",
      status: "completed",
      outcome,
      confidence,
      evidenceQuality: null,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
    })),
    tourismRows: [],
    truncated: false,
  };
}

describe("research operator analytics", () => {
  const filters = {
    studyId: "11111111-1111-4111-8111-111111111111",
    dateFrom: "2026-09-01",
    dateTo: "2026-09-30",
    collectionModes: ["field_observation" as const],
    minCellThreshold: 10 as const,
  };

  it("does not emit NaN when completed attempts have no confidence or assessment", () => {
    const summary = summarizeResearchAnalytics(rowsWithOperatorAttempts(10, null, "not_assessed"), filters);
    expect(summary.operator.completedAttempts).toBe(10);
    expect(summary.operator.assessedAttempts).toBe(0);
    expect(summary.operator.meanConfidence).toBeNull();
    expect(summary.operator.successRate).toBeNull();
    expect(summary.operator.confidenceSuppressed).toBe(true);
    expect(summary.operator.successSuppressed).toBe(true);
  });

  it("calculates outcome and confidence only after the privacy threshold is met", () => {
    const summary = summarizeResearchAnalytics(rowsWithOperatorAttempts(10, 4, "passed"), filters);
    expect(summary.operator.assessedAttempts).toBe(10);
    expect(summary.operator.successRate).toBe(100);
    expect(summary.operator.meanConfidence).toBe(4);
    expect(summary.operator.durationSuppressed).toBe(false);
  });

  it("uses certificate recipients as the denominator for optional-data follow-through", () => {
    const source = rowsWithOperatorAttempts(12, null, null);
    source.sessions = source.sessions.map((session) => ({ ...session, participantType: "tourist" as const }));
    source.instruments = [{
      researchInstrumentId: "instrument-2",
      studyId: filters.studyId,
      instrumentKey: "tourist_evaluation",
      versionNumber: 2,
      audience: "tourist",
      status: "published",
      titleTh: "แบบประเมินระบบ",
      titleEn: null,
      descriptionTh: null,
      descriptionEn: null,
      estimatedMinutes: 4,
      publishedAt: "2026-09-01T00:00:00.000Z",
      frozenAt: "2026-09-01T00:00:00.000Z",
      createdAt: "2026-08-01T00:00:00.000Z",
    }];
    source.responses = source.sessions.slice(0, 6).map((session, index) => ({
      researchResponseId: `response-${index}`,
      researchSessionId: session.researchSessionId,
      instrumentId: "instrument-2",
      status: "submitted",
      startedAt: "2026-09-01T00:03:00.000Z",
      submittedAt: "2026-09-01T00:05:00.000Z",
      durationSeconds: 120,
    }));
    source.funnelEvents = [
      ...source.sessions.slice(0, 10).map((session) => ({ researchSessionId: session.researchSessionId, eventType: "certificate_generated", eventTime: "2026-09-01T00:02:00.000Z" })),
      ...source.sessions.slice(0, 8).map((session) => ({ researchSessionId: session.researchSessionId, eventType: "survey_completed", eventTime: "2026-09-01T00:04:00.000Z" })),
      ...source.sessions.slice(0, 4).map((session) => ({ researchSessionId: session.researchSessionId, eventType: "passport_saved", eventTime: "2026-09-01T00:06:00.000Z" })),
    ];

    const summary = summarizeResearchAnalytics(source, filters);

    expect(summary.scope.instrumentVersions).toEqual(["tourist_evaluation v2 (tourist)"]);
    expect(summary.incentives).toMatchObject({
      certificateRecipients: 10,
      tourismSurveyCompleters: 8,
      evaluationCompleters: 6,
      passportSavers: 4,
      tourismSurveyRate: 80,
      evaluationRate: 60,
      passportSaveRate: 40,
      suppressed: false,
    });
  });

  it("suppresses optional-data rates when fewer than ten sessions reach the incentive", () => {
    const source = rowsWithOperatorAttempts(9, null, null);
    source.sessions = source.sessions.map((session) => ({ ...session, participantType: "tourist" as const }));
    source.funnelEvents = source.sessions.map((session) => ({ researchSessionId: session.researchSessionId, eventType: "certificate_generated", eventTime: "2026-09-01T00:02:00.000Z" }));

    const summary = summarizeResearchAnalytics(source, filters);

    expect(summary.incentives.suppressed).toBe(true);
    expect(summary.incentives.tourismSurveyRate).toBeNull();
    expect(summary.incentives.evaluationRate).toBeNull();
    expect(summary.incentives.passportSaveRate).toBeNull();
  });
});
