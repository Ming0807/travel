import { describe, expect, it } from "vitest";

import type { ResearchAnalyticsRows } from "@/lib/repositories/admin-research.repository";
import { summarizeResearchAnalytics } from "@/lib/services/admin-research.service";

const filters = {
  studyId: "11111111-1111-4111-8111-111111111111",
  dateFrom: "2026-09-01",
  dateTo: "2026-09-30",
  collectionModes: ["pilot_internal" as const, "simulated_usability" as const],
  minCellThreshold: 10 as const,
};

function pilotRows(count = 12): ResearchAnalyticsRows {
  const sessions = Array.from({ length: count }, (_, index) => ({
    researchSessionId: `session-${index}`,
    participantCode: `participant-${index}`,
    participantType: index < 10 ? "tourist" as const : "operator" as const,
    collectionMode: index % 2 === 0 ? "pilot_internal" as const : "simulated_usability" as const,
    status: "in_progress",
    inclusionStatus: "included",
    consentedAt: "2026-09-01T00:00:00.000Z",
    startedAt: "2026-09-01T00:00:00.000Z",
    completedAt: null,
    withdrawnAt: null,
    createdAt: "2026-09-01T00:00:00.000Z",
    visitId: null,
  }));
  const items = [
    { id: "item-sq", code: "SQ1", construct: "system_quality", order: 1 },
    { id: "item-iu", code: "IU1", construct: "information_quality", order: 2 },
    { id: "item-pe", code: "PE1", construct: "perceived_ease_of_use", order: 3 },
  ];
  const responses = sessions.map((session, index) => ({
    researchResponseId: `response-${index}`,
    researchSessionId: session.researchSessionId,
    instrumentId: "instrument-2",
    status: index < 10 ? "submitted" : "draft",
    startedAt: "2026-09-01T00:01:00.000Z",
    submittedAt: index < 10 ? "2026-09-01T00:04:30.000Z" : null,
    durationSeconds: index < 10 ? 210 : null,
  }));
  const answers = responses.flatMap((response, responseIndex) => items.flatMap((item, itemIndex) => {
    if (responseIndex >= 10 && itemIndex > 0) return [];
    return [{ responseId: response.researchResponseId, itemId: item.id, integerValue: 4, textValue: null, booleanValue: null }];
  }));

  return {
    sessions,
    instruments: [{
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
      publishedAt: "2026-08-30T00:00:00.000Z",
      frozenAt: "2026-08-31T00:00:00.000Z",
      createdAt: "2026-08-01T00:00:00.000Z",
    }],
    items: items.map((item) => ({
      researchItemId: item.id,
      instrumentId: "instrument-2",
      itemCode: item.code,
      constructKey: item.construct,
      promptTh: item.code,
      promptEn: null,
      answerType: "agreement_5",
      options: null,
      displayOrder: item.order,
      isRequired: true,
      reverseScore: false,
    })),
    responses,
    answers,
    funnelEvents: [],
    operatorTasks: [],
    operatorAttempts: [],
    tourismRows: [],
    truncated: false,
    governance: {
      studyKind: "pilot",
      studyStatus: "paused",
      freezeSnapshotId: "freeze-1",
      activationEvidence: [
        { evidenceType: "expert_review", status: "passed", reference: "DOC-EXPERT-1", evidenceId: "evidence-1" },
        { evidenceType: "cognitive_pretest", status: "passed", reference: "DOC-PRETEST-1", evidenceId: "evidence-2" },
        { evidenceType: "mobile_flow_qa", status: "passed", reference: "DOC-MOBILE-1", evidenceId: "evidence-3" },
      ],
    },
  };
}

describe("research pilot monitoring", () => {
  it("measures abandonment through saved evaluation sections and approved burden gates", () => {
    const summary = summarizeResearchAnalytics(pilotRows(), filters);

    expect(summary.evaluationFlow.started).toBe(12);
    expect(summary.scope.studyKind).toBe("pilot");
    expect(summary.evaluationFlow.submitted).toBe(10);
    expect(summary.evaluationFlow.completionRate).toBe(83.3);
    expect(summary.evaluationFlow.medianSeconds).toBe(210);
    expect(summary.evaluationFlow.thresholds).toEqual({
      completionRatePercent: 80,
      medianSeconds: 240,
      maximumRequiredItemMissingnessPercent: 5,
    });
    expect(summary.evaluationFlow.stages.map((stage) => [stage.key, stage.count, stage.dropoffFromPrevious])).toEqual([
      ["evaluation_started", 12, null],
      ["system_quality", 12, 0],
      ["information_quality", 10, 16.7],
      ["perceived_ease_of_use", 10, 0],
      ["evaluation_submitted", 10, 0],
    ]);
    expect(summary.evaluationFlow.gates).toMatchObject({
      completion: "pass",
      duration: "pass",
      requiredItemMissingness: "pass",
    });
  });

  it("suppresses descriptive mode and participant comparisons below n=10", () => {
    const summary = summarizeResearchAnalytics(pilotRows(), filters);

    expect(summary.comparisons.participantTypes.find((group) => group.key === "tourist")).toMatchObject({
      suppressed: false,
      sampleSize: 10,
      completionRate: 100,
    });
    expect(summary.comparisons.participantTypes.find((group) => group.key === "operator")).toMatchObject({
      suppressed: true,
      sampleSize: null,
      completionRate: null,
      medianSeconds: null,
    });
    expect(summary.comparisons.collectionModes.every((group) => group.suppressed)).toBe(true);
    expect(summary.comparisons.interpretation).toContain("เชิงพรรณนา");
  });

  it("does not add evaluation steps from instruments unused in the selected scope", () => {
    const source = pilotRows();
    source.instruments.push({ ...source.instruments[0], researchInstrumentId: "operator-instrument", instrumentKey: "operator_evaluation", audience: "operator" });
    source.items.push({ ...source.items[0], researchItemId: "operator-item", instrumentId: "operator-instrument", constructKey: "operator_decision_support" });

    const summary = summarizeResearchAnalytics(source, filters);

    expect(summary.evaluationFlow.stages.some((stage) => stage.key === "operator_decision_support")).toBe(false);
  });

  it("keeps distinct audience instruments aligned but disables cross-instrument section drop-off", () => {
    const source = pilotRows();
    source.instruments.push({ ...source.instruments[0], researchInstrumentId: "operator-instrument", instrumentKey: "operator_evaluation", versionNumber: 1, audience: "operator" });
    source.items.push({ ...source.items[0], researchItemId: "operator-item", instrumentId: "operator-instrument", constructKey: "operator_decision_support" });
    source.responses[10] = { ...source.responses[10], instrumentId: "operator-instrument", status: "submitted", submittedAt: "2026-09-01T00:05:00.000Z", durationSeconds: 240 };
    source.answers.push({ responseId: source.responses[10].researchResponseId, itemId: "operator-item", integerValue: 4, textValue: null, booleanValue: null });

    const summary = summarizeResearchAnalytics(source, filters);

    expect(summary.instrumentControl).toMatchObject({ status: "aligned", mixedVersions: false });
    expect(summary.evaluationFlow.stageAnalysisAvailable).toBe(false);
    expect(summary.evaluationFlow.stages.map((stage) => stage.key)).toEqual(["evaluation_started", "evaluation_submitted"]);
    expect(summary.evaluationFlow.stageAnalysisLimitation).toContain("ประเภทผู้เข้าร่วม");
  });

  it("detects mixed instrument versions and blocks a field-ready decision", () => {
    const source = pilotRows();
    source.instruments.push({ ...source.instruments[0], researchInstrumentId: "instrument-3", versionNumber: 3 });
    source.responses[0] = { ...source.responses[0], instrumentId: "instrument-3" };

    const summary = summarizeResearchAnalytics(source, filters);

    expect(summary.instrumentControl).toMatchObject({
      freezeStatus: "frozen",
      mixedVersions: true,
      status: "mixed",
    });
    expect(summary.pilotReadiness.decision).toBe("not_ready");
    expect(summary.pilotReadiness.items.find((item) => item.key === "instrument_alignment")).toMatchObject({
      ready: false,
      evidenceHref: "#research-instrument-control",
    });
    expect(summary.pilotReadiness.items.every((item) => item.evidenceLabel.length > 0)).toBe(true);
  });
});
