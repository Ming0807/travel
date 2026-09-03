import {
  ACTION_STATUSES,
  FEEDBACK_RULES,
  type CandidateMetrics,
  type FeedbackScope,
  AttractionFeedbackService,
  assertActionTransition,
  qualifyFeedbackCandidate,
} from "@/lib/services/attraction-feedback.service";
import { describe, expect, it, vi } from "vitest";

const ISSUE_ID = "00000000-0000-4000-8000-000000000001";
const ACTION_ID = "00000000-0000-4000-8000-000000000002";
const OWNER_ID = "00000000-0000-4000-8000-000000000003";

const scope: FeedbackScope = {
  attractionId: 7,
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
    readCandidateMetrics: vi.fn().mockResolvedValue(metrics()),
    listEvidenceRows: vi.fn().mockResolvedValue([]),
    insertIssue: vi.fn().mockResolvedValue({ feedbackIssueId: ISSUE_ID, status: "open" }),
    findIssue: vi.fn().mockResolvedValue({ feedbackIssueId: ISSUE_ID, status: "open" }),
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
      followUpMetric: "information_score",
      followUpStart: "2026-03-01",
      followUpEnd: "2026-03-31",
    });
    await service.transitionAction({ actionId: ACTION_ID, toStatus: "verified", note: "Follow-up reviewed." });

    expect(requested).toEqual(["attraction_improvement.manage", "attraction_improvement.verify"]);
    expect(repo.isActiveAdmin).toHaveBeenCalledWith(OWNER_ID);
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
      followUpMetric: "information_score",
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
