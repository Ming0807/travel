import {
  ACTION_STATUSES,
  FEEDBACK_RULES,
  type CandidateMetrics,
  type FeedbackScope,
  AttractionFeedbackService,
  assertActionTransition,
  buildEvidenceSnapshot,
  qualifyFeedbackCandidate,
} from "@/lib/services/attraction-feedback.service";
import { describe, expect, it, vi } from "vitest";

const ISSUE_ID = "00000000-0000-4000-8000-000000000001";
const ACTION_ID = "00000000-0000-4000-8000-000000000002";
const OWNER_ID = "00000000-0000-4000-8000-000000000003";

const scope: FeedbackScope = {
  attractionId: 7,
  evidenceScope: "all_records",
  dateStart: "2026-01-01",
  dateEnd: "2026-01-31",
  comparisonStart: "2025-12-01",
  comparisonEnd: "2025-12-31",
};

function metrics(overrides: Partial<CandidateMetrics> = {}): CandidateMetrics {
  return {
    attractionId: scope.attractionId,
    issueDimension: "overall",
    scope,
    sourceTypes: ["satisfaction_surveys", "visits"],
    validResponseCount: 30,
    visitCount: 30,
    currentScore: 2.9,
    comparisonScore: 3.1,
    structuredLowScoreRecurrence: 3,
    isTruncated: false,
    ...overrides,
  };
}

function repository() {
  return {
    readCandidateMetrics: vi.fn().mockImplementation(async (requestedScope: FeedbackScope) => metrics({ scope: requestedScope })),
    listEvidenceRows: vi.fn().mockResolvedValue([]),
    insertIssue: vi.fn().mockResolvedValue({ feedbackIssueId: ISSUE_ID, status: "open" }),
    findIssue: vi.fn().mockResolvedValue({
      feedbackIssueId: ISSUE_ID,
      attractionId: scope.attractionId,
      issueDimension: "overall",
      status: "open",
      baselineStart: scope.dateStart,
      baselineEnd: scope.dateEnd,
      evidenceSnapshot: buildEvidenceSnapshot(metrics()),
    }),
    transitionIssue: vi.fn().mockResolvedValue({ feedbackIssueId: ISSUE_ID, status: "closed" }),
    insertAction: vi.fn().mockResolvedValue({
      improvementActionId: ACTION_ID,
      feedbackIssueId: ISSUE_ID,
      status: "planned",
      followUpEnd: "2026-03-31",
      completionEvidenceNote: null,
    }),
    findAction: vi.fn().mockResolvedValue({
      improvementActionId: ACTION_ID,
      feedbackIssueId: ISSUE_ID,
      status: "completed",
      followUpMetric: "overall_score",
      followUpStart: "2026-03-01",
      followUpEnd: "2026-03-31",
      completionEvidenceNote: "Work completed and photographed by site staff.",
    }),
    transitionAction: vi.fn().mockResolvedValue({ improvementActionId: ACTION_ID, status: "verified" }),
    isActiveAdmin: vi.fn().mockResolvedValue(true),
    hasVerifiedAction: vi.fn().mockResolvedValue(true),
  };
}

describe("attraction feedback qualification", () => {
  it("qualifies a low-score candidate without creating a production issue", () => {
    const result = qualifyFeedbackCandidate(metrics());

    expect(result.qualifies).toBe(true);
    expect(result.reasons).toEqual(expect.arrayContaining([
      "current_score_at_or_below_threshold",
      "structured_recurrence_threshold_met",
    ]));
    expect(FEEDBACK_RULES).toMatchObject({
      ruleVersion: "feedback-rules-v1",
      minimumValidResponses: 30,
      minimumVisits: 30,
      lowScoreThreshold: 3,
      structuredLowScoreThreshold: 2,
      comparableDeclineThreshold: 0.25,
      minimumStructuredRecurrence: 3,
    });
  });

  it("qualifies a comparable decline when the current score is above 3", () => {
    const result = qualifyFeedbackCandidate(metrics({ currentScore: 3.4, comparisonScore: 3.65 }));

    expect(result.qualifies).toBe(true);
    expect(result.reasons).toContain("comparable_decline_at_or_above_threshold");
  });

  it.each([
    ["fewer than 30 valid responses", { validResponseCount: 29 }],
    ["fewer than 30 visits", { visitCount: 29 }],
    ["fewer than three low-score responses", { structuredLowScoreRecurrence: 2 }],
    ["missing score", { currentScore: null, comparisonScore: null }],
    ["truncated data", { isTruncated: true }],
  ])("does not qualify with %s", (_label: string, override: Partial<CandidateMetrics>) => {
    expect(qualifyFeedbackCandidate(metrics(override)).qualifies).toBe(false);
  });
});

describe("AttractionFeedbackService permissions and workflow", () => {
  it("reads candidates with aggregate feedback permission and does not auto-create issues", async () => {
    const repo = repository();
    const requested: string[] = [];
    const service = new AttractionFeedbackService(repo, async (permission) => {
      requested.push(permission);
      return { actor: { adminId: "admin-1" } };
    });

    await service.getCandidate(scope);

    expect(requested).toEqual(["attraction_feedback.read"]);
    expect(repo.insertIssue).not.toHaveBeenCalled();
  });

  it("requires issue-review permission and a decision before creating a reviewed issue", async () => {
    const repo = repository();
    const requested: string[] = [];
    const service = new AttractionFeedbackService(repo, async (permission) => {
      requested.push(permission);
      return { actor: { adminId: "admin-1" } };
    });

    await service.reviewCandidate({
      ...scope,
      issueDimension: "overall",
      issueCategory: "service",
      decision: "accept",
      reviewNote: "Reviewed against the current period.",
    });

    expect(requested).toEqual(["attraction_feedback.issue_review"]);
    expect(repo.insertIssue).toHaveBeenCalledWith(expect.objectContaining({ status: "open", reviewedBy: "admin-1" }));
  });

  it("stores the filtered population in the reviewed snapshot", async () => {
    const repo = repository();
    const selected = { ...scope, evidenceScope: "pilot_only" as const, entryChannel: "nfc" as const, campaignId: 3, checkinCodeId: 9 };
    repo.readCandidateMetrics.mockResolvedValue(metrics({ scope: selected }));
    const service = new AttractionFeedbackService(repo, async () => ({ actor: { adminId: "admin-1" } }));

    await service.reviewCandidate({ ...selected, issueDimension: "overall", issueCategory: "service", decision: "accept", reviewNote: "Pilot cohort only." });

    expect(repo.insertIssue).toHaveBeenCalledWith(expect.objectContaining({
      evidenceSnapshot: expect.objectContaining({
        schemaVersion: 2,
        population: { evidenceScope: "pilot_only", entryChannel: "nfc", campaignId: 3, checkinCodeId: 9 },
      }),
    }));
  });

  it("rejects metrics from a different evidence population before saving", async () => {
    const repo = repository();
    repo.readCandidateMetrics.mockResolvedValueOnce(metrics());
    const service = new AttractionFeedbackService(repo, async () => ({ actor: { adminId: "admin-1" } }));

    await expect(service.reviewCandidate({ ...scope, evidenceScope: "field_claim", issueDimension: "overall", issueCategory: "service", decision: "accept", reviewNote: "" }))
      .rejects.toMatchObject({ code: "FEEDBACK_SCOPE_MISMATCH" });
    expect(repo.insertIssue).not.toHaveBeenCalled();
  });

  it("requires a note when dismissing a candidate", async () => {
    const repo = repository();
    const service = new AttractionFeedbackService(repo, async () => ({ actor: { adminId: "admin-1" } }));

    await expect(service.reviewCandidate({
      ...scope,
      issueDimension: "overall",
      issueCategory: "service",
      decision: "dismiss",
      reviewNote: "",
    })).rejects.toMatchObject({
      code: "DISMISS_NOTE_REQUIRED",
    });
  });

  it("requires management permission to create an action and verification permission to verify it", async () => {
    const repo = repository();
    const requested: string[] = [];
    const service = new AttractionFeedbackService(repo, async (permission) => {
      requested.push(permission);
      return { actor: { adminId: "admin-1" } };
    }, () => new Date("2026-04-01T00:00:00.000Z"));

    await service.createAction({
      issueId: ISSUE_ID,
      title: "Improve visitor information",
      proposedAction: "Replace the entrance sign and add bilingual guidance.",
      ownerAdminId: OWNER_ID,
      priority: "high",
      dueDate: "2026-02-28",
      followUpMetric: "overall_score",
      followUpStart: "2026-03-01",
      followUpEnd: "2026-03-31",
    });
    await service.transitionAction({ actionId: ACTION_ID, toStatus: "verified", note: "Follow-up reviewed." });

    expect(requested).toEqual(["attraction_improvement.manage", "attraction_improvement.verify"]);
    expect(repo.isActiveAdmin).toHaveBeenCalledWith(OWNER_ID);
    expect(repo.transitionAction).toHaveBeenCalledWith(
      ACTION_ID,
      "completed",
      "verified",
      "admin-1",
      "Follow-up reviewed.",
      "Work completed and photographed by site staff.",
      expect.objectContaining({
        schemaVersion: 1,
        metric: "overall_score",
        baseline: expect.objectContaining({ value: 2.9, validResponses: 30, visits: 30 }),
        followUp: expect.objectContaining({ value: 2.9, validResponses: 30, visits: 30 }),
        comparisonState: "comparable",
      }),
    );
  });

  it("rejects a new action whose score metric differs from the reviewed issue dimension", async () => {
    const repo = repository();
    const service = new AttractionFeedbackService(repo, async () => ({ actor: { adminId: "admin-1" } }));

    await expect(service.createAction({
      issueId: ISSUE_ID,
      title: "Improve visitor information",
      proposedAction: "Replace the entrance sign.",
      ownerAdminId: OWNER_ID,
      priority: "high",
      dueDate: "2026-02-28",
      followUpMetric: "information_score",
      followUpStart: "2026-03-01",
      followUpEnd: "2026-03-31",
    })).rejects.toMatchObject({ code: "FOLLOW_UP_METRIC_MISMATCH" });
    expect(repo.insertAction).not.toHaveBeenCalled();
  });

  it("rejects a follow-up period that overlaps its reviewed baseline", async () => {
    const repo = repository();
    const service = new AttractionFeedbackService(repo, async () => ({ actor: { adminId: "admin-1" } }));
    await expect(service.createAction({
      issueId: ISSUE_ID,
      title: "Improve visitor information",
      proposedAction: "Replace the entrance sign.",
      ownerAdminId: OWNER_ID,
      priority: "high",
      dueDate: "2026-01-01",
      followUpMetric: "overall_score",
      followUpStart: "2026-01-31",
      followUpEnd: "2026-02-28",
    })).rejects.toMatchObject({ code: "FOLLOW_UP_OVERLAPS_BASELINE" });
    expect(repo.insertAction).not.toHaveBeenCalled();
  });

  it("refuses verification when the follow-up read is incomplete or from another population", async () => {
    const repo = repository();
    const service = new AttractionFeedbackService(repo, async () => ({ actor: { adminId: "admin-1" } }), () => new Date("2026-04-01T00:00:00.000Z"));
    repo.readCandidateMetrics.mockResolvedValueOnce(metrics({ isTruncated: true }));
    await expect(service.transitionAction({ actionId: ACTION_ID, toStatus: "verified", note: "Read incomplete." }))
      .rejects.toMatchObject({ code: "FOLLOW_UP_READ_INCOMPLETE" });
    repo.readCandidateMetrics.mockResolvedValueOnce(metrics({ scope: { ...scope, evidenceScope: "field_claim" } }));
    await expect(service.transitionAction({ actionId: ACTION_ID, toStatus: "verified", note: "Wrong scope." }))
      .rejects.toMatchObject({ code: "FOLLOW_UP_SCOPE_MISMATCH" });
    expect(repo.transitionAction).not.toHaveBeenCalled();
  });

  it("stores low-sample follow-up without a visible score or improvement claim", async () => {
    const repo = repository();
    const service = new AttractionFeedbackService(repo, async () => ({ actor: { adminId: "admin-1" } }), () => new Date("2026-04-01T00:00:00.000Z"));
    repo.readCandidateMetrics.mockImplementationOnce(async (requestedScope: FeedbackScope) => metrics({ scope: requestedScope, validResponseCount: 2, visitCount: 8, currentScore: 4.5 }));

    await service.transitionAction({ actionId: ACTION_ID, toStatus: "verified", note: "Insufficient follow-up." });

    expect(repo.transitionAction).toHaveBeenCalledWith(
      ACTION_ID, "completed", "verified", "admin-1", "Insufficient follow-up.",
      "Work completed and photographed by site staff.",
      expect.objectContaining({
        followUp: expect.objectContaining({ value: null, validResponses: 2, visits: 8 }),
        comparisonState: "low_sample",
      }),
    );
  });

  it("marks legacy issue evidence as non-comparable instead of fabricating a baseline value", async () => {
    const repo = repository();
    const source = buildEvidenceSnapshot(metrics());
    if (source.schemaVersion !== 2) throw new Error("Expected a version-two test snapshot.");
    const { population: _population, ...legacy } = source;
    repo.findIssue.mockResolvedValueOnce({
      feedbackIssueId: ISSUE_ID,
      attractionId: scope.attractionId,
      issueDimension: "overall",
      status: "open",
      baselineStart: scope.dateStart,
      baselineEnd: scope.dateEnd,
      evidenceSnapshot: { ...legacy, schemaVersion: 1 },
    });
    const service = new AttractionFeedbackService(repo, async () => ({ actor: { adminId: "admin-1" } }), () => new Date("2026-04-01T00:00:00.000Z"));

    await service.transitionAction({ actionId: ACTION_ID, toStatus: "verified", note: "Legacy review." });

    expect(repo.transitionAction).toHaveBeenCalledWith(
      ACTION_ID, "completed", "verified", "admin-1", "Legacy review.",
      "Work completed and photographed by site staff.",
      expect.objectContaining({
        sourceIssueSnapshotVersion: 1,
        baseline: expect.objectContaining({ value: null }),
        comparisonState: "legacy_or_mismatch",
      }),
    );
  });

  it("keeps raw low-score recurrence counts descriptive across different time windows", async () => {
    const repo = repository();
    repo.findAction.mockResolvedValueOnce({
      improvementActionId: ACTION_ID,
      feedbackIssueId: ISSUE_ID,
      status: "completed",
      followUpMetric: "structured_recurrence_count",
      followUpStart: "2026-03-01",
      followUpEnd: "2026-03-31",
      completionEvidenceNote: "Work completed and photographed by site staff.",
    });
    repo.readCandidateMetrics.mockImplementationOnce(async (requestedScope: FeedbackScope) => metrics({
      scope: requestedScope,
      validResponseCount: 50,
      visitCount: 80,
      structuredLowScoreRecurrence: 5,
    }));
    const service = new AttractionFeedbackService(repo, async () => ({ actor: { adminId: "admin-1" } }), () => new Date("2026-04-01T00:00:00.000Z"));

    await service.transitionAction({ actionId: ACTION_ID, toStatus: "verified", note: "Reviewed raw recurrence." });

    expect(repo.transitionAction).toHaveBeenCalledWith(
      ACTION_ID, "completed", "verified", "admin-1", "Reviewed raw recurrence.",
      "Work completed and photographed by site staff.",
      expect.objectContaining({
        metric: "structured_recurrence_count",
        baseline: expect.objectContaining({ value: 3, validResponses: 30 }),
        followUp: expect.objectContaining({ value: 5, validResponses: 50 }),
        comparisonState: "descriptive_count",
      }),
    );
  });

  it("rejects an inactive action owner and refuses to close before verified follow-up", async () => {
    const repo = repository();
    repo.isActiveAdmin.mockResolvedValue(false);
    repo.hasVerifiedAction.mockResolvedValue(false);
    const service = new AttractionFeedbackService(
      repo,
      async () => ({ actor: { adminId: "admin-1" } }),
    );

    await expect(service.createAction({
      issueId: ISSUE_ID,
      title: "Improve visitor information",
      proposedAction: "Replace the entrance sign.",
      ownerAdminId: OWNER_ID,
      priority: "high",
      dueDate: "2026-02-28",
      followUpMetric: "overall_score",
      followUpStart: "2026-03-01",
      followUpEnd: "2026-03-31",
    })).rejects.toMatchObject({ code: "ACTION_OWNER_INACTIVE" });

    await expect(service.closeIssue(ISSUE_ID, "Ready to close."))
      .rejects.toMatchObject({ code: "VERIFIED_ACTION_REQUIRED" });
    expect(repo.transitionIssue).not.toHaveBeenCalled();
  });

  it("rejects verification before the follow-up period ends", async () => {
    const repo = repository();
    const service = new AttractionFeedbackService(repo, async () => ({ actor: { adminId: "admin-1" } }), () => new Date("2026-03-01T00:00:00.000Z"));

    await expect(service.transitionAction({ actionId: ACTION_ID, toStatus: "verified", note: "Too early." })).rejects.toMatchObject({
      code: "FOLLOW_UP_NOT_COMPLETE",
    });
    expect(repo.transitionAction).not.toHaveBeenCalled();
  });

  it("rejects verification on the follow-up period end date", async () => {
    const repo = repository();
    const service = new AttractionFeedbackService(repo, async () => ({ actor: { adminId: "admin-1" } }), () => new Date("2026-03-31T23:59:59.000Z"));

    await expect(service.transitionAction({ actionId: ACTION_ID, toStatus: "verified", note: "Still in follow-up." })).rejects.toMatchObject({
      code: "FOLLOW_UP_NOT_COMPLETE",
    });
    expect(repo.transitionAction).not.toHaveBeenCalled();
  });

  it("requires completion evidence and accepts only supported transitions", () => {
    expect(() => assertActionTransition("planned", "verified", "evidence", "note")).toThrow(/Cannot transition action/);
    expect(() => assertActionTransition("in_progress", "completed", "", "note")).toThrow(/Completion evidence/);
    expect(() => assertActionTransition("completed", "verified", "evidence", "")).toThrow(/verification outcome/i);
    expect(ACTION_STATUSES).toEqual(["planned", "in_progress", "completed", "verified", "cancelled"]);
  });
});
