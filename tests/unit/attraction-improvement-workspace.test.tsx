import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildEvidenceSnapshot, FEEDBACK_RULES, qualifyFeedbackCandidate, type AttractionFeedbackIssue, type CandidateMetrics, type ImprovementAction } from "@/lib/services/attraction-feedback.service";
import type { ImprovementHistory, ImprovementOwner } from "@/lib/repositories/attraction-feedback.repository";

const mocks = vi.hoisted(() => ({
  closeIssue: vi.fn(),
  createAction: vi.fn(),
  reviewIssue: vi.fn(),
  transitionAction: vi.fn(),
}));

vi.mock("@/app/actions/admin-attraction-feedback-actions", () => ({
  closeAttractionFeedbackIssueAction: mocks.closeIssue,
  createAttractionImprovementAction: mocks.createAction,
  reviewAttractionFeedbackAction: mocks.reviewIssue,
  transitionAttractionImprovementAction: mocks.transitionAction,
}));

import { AttractionImprovementWorkspace } from "@/components/admin/attractions/AttractionImprovementWorkspace";

const scope = {
  dateStart: "2026-01-01",
  dateEnd: "2026-01-31",
  comparisonStart: "2025-12-01",
  comparisonEnd: "2025-12-31",
};

const thai = {
  planned: "\u0e27\u0e32\u0e07\u0e41\u0e1c\u0e19\u0e41\u0e25\u0e49\u0e27",
  inProgress: "\u0e01\u0e33\u0e25\u0e31\u0e07\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e01\u0e32\u0e23",
  completed: "\u0e23\u0e2d\u0e15\u0e23\u0e27\u0e08\u0e1c\u0e25",
  verified: "\u0e15\u0e23\u0e27\u0e08\u0e1c\u0e25\u0e41\u0e25\u0e49\u0e27",
  cancelled: "\u0e22\u0e01\u0e40\u0e25\u0e34\u0e01",
  review: "\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e1c\u0e25\u0e01\u0e32\u0e23\u0e1e\u0e34\u0e08\u0e32\u0e23\u0e13\u0e32",
  save: "\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e41\u0e1c\u0e19\u0e1b\u0e23\u0e31\u0e1a\u0e1b\u0e23\u0e38\u0e07",
  verify: "\u0e22\u0e37\u0e19\u0e22\u0e31\u0e19\u0e1c\u0e25\u0e15\u0e34\u0e14\u0e15\u0e32\u0e21",
  close: "\u0e1b\u0e34\u0e14\u0e1b\u0e23\u0e30\u0e40\u0e14\u0e47\u0e19",
};

const ids = {
  issue: "00000000-0000-4000-8000-000000000001",
  action: "00000000-0000-4000-8000-000000000002",
  owner: "00000000-0000-4000-8000-000000000003",
};

function metrics(): CandidateMetrics {
  return {
    attractionId: 7,
    issueDimension: "overall",
    scope: { attractionId: 7, ...scope },
    sourceTypes: ["satisfaction_surveys", "visits"],
    validResponseCount: 30,
    visitCount: 120,
    currentScore: 2.8,
    comparisonScore: 3.2,
    structuredLowScoreRecurrence: 5,
    isTruncated: false,
  };
}

function issue(status: AttractionFeedbackIssue["status"] = "open"): AttractionFeedbackIssue {
  return {
    feedbackIssueId: ids.issue,
    attractionId: 7,
    issueDimension: "overall",
    issueCategory: "service",
    ruleVersion: FEEDBACK_RULES.ruleVersion,
    status,
    baselineStart: scope.dateStart,
    baselineEnd: scope.dateEnd,
    comparisonStart: scope.comparisonStart,
    comparisonEnd: scope.comparisonEnd,
    visitCount: 120,
    responseCount: 30,
    responseCoverage: 0.25,
    currentScore: 2.8,
    comparisonScore: 3.2,
    structuredRecurrenceCount: 5,
    evidenceSnapshot: buildEvidenceSnapshot(metrics()),
    reviewNote: null,
    reviewedBy: "admin-reviewer-test",
    reviewedAt: "2026-02-01T00:00:00.000Z",
  };
}

function action(status: ImprovementAction["status"] = "planned"): ImprovementAction {
  return {
    improvementActionId: ids.action,
    feedbackIssueId: ids.issue,
    title: "Test improvement plan",
    proposedAction: "Add bilingual visitor guidance.",
    ownerAdminId: ids.owner,
    priority: "medium",
    status,
    dueDate: "2026-02-28",
    followUpMetric: "overall_score",
    followUpStart: "2026-03-01",
    followUpEnd: "2026-03-31",
  };
}

const owners: ImprovementOwner[] = [{ adminId: ids.owner, displayName: "ผู้รับผิดชอบทดสอบ", email: "owner@example.test" }];

function history(): ImprovementHistory[] {
  return [{
    historyId: "00000000-0000-4000-8000-000000000004",
    feedbackIssueId: ids.issue,
    improvementActionId: ids.action,
    fromStatus: "planned",
    toStatus: "in_progress",
    changedBy: ids.owner,
    note: "Synthetic workflow history",
    createdAt: "2026-02-02T00:00:00.000Z",
  }];
}

function renderWorkspace(overrides: Partial<Parameters<typeof AttractionImprovementWorkspace>[0]> = {}) {
  return render(
    <AttractionImprovementWorkspace
      attractionId={7}
      scope={scope}
      dimension="overall"
      canReview
      canManage
      canVerify
      workspace={{
        candidate: qualifyFeedbackCandidate(metrics()),
        issues: [issue()],
        actions: [action()],
        history: history(),
        owners,
        rules: FEEDBACK_RULES,
      }}
      {...overrides}
    />,
  );
}

describe("AttractionImprovementWorkspace regressions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders Thai-first status labels and never exposes raw workflow codes in visible history/status UI", () => {
    const { container } = renderWorkspace();
    const text = container.textContent ?? "";

    expect(text).toContain(thai.planned);
    expect(text).toContain(thai.inProgress);
    for (const rawStatus of ["planned", "in_progress", "completed", "verified", "cancelled"]) {
      expect(text).not.toContain(rawStatus);
    }
  });

  it.each([
    ["qualified and authorized", true, true],
    ["unqualified", false, true],
    ["unauthorized", true, false],
  ])("shows the review form only when the candidate is %s", (_name, qualifies, canReview) => {
    renderWorkspace({
      canReview,
      workspace: {
        candidate: { ...qualifyFeedbackCandidate(metrics()), qualifies },
        issues: [],
        actions: [],
        history: [],
        owners,
        rules: FEEDBACK_RULES,
      },
    });

    if (qualifies && canReview) {
      expect(screen.getByRole("button", { name: thai.review })).toBeInTheDocument();
    } else {
      expect(screen.queryByRole("button", { name: thai.review })).not.toBeInTheDocument();
    }
  });

  it("offers action creation controls and a 44px save command when an open issue has no active action", () => {
    renderWorkspace({ workspace: {
      candidate: qualifyFeedbackCandidate(metrics()),
      issues: [issue()],
      actions: [],
      history: [],
      owners,
      rules: FEEDBACK_RULES,
    } });

    const save = screen.getByRole("button", { name: thai.save });
    expect(save).toHaveClass("min-h-11");
    expect(screen.getByLabelText(/\u0e0a\u0e37\u0e48\u0e2d\u0e41\u0e1c\u0e19/)).toBeRequired();
    expect(screen.getByLabelText(/\u0e2a\u0e34\u0e48\u0e07\u0e17\u0e35\u0e48\u0e08\u0e30\u0e14\u0e33\u0e40\u0e19\u0e34\u0e19\u0e01\u0e32\u0e23/)).toBeRequired();
  });

  it("offers closing only after at least one verified action", () => {
    const { rerender } = renderWorkspace({ workspace: {
      candidate: qualifyFeedbackCandidate(metrics()),
      issues: [issue()],
      actions: [action("completed")],
      history: [],
      owners,
      rules: FEEDBACK_RULES,
    } });
    expect(screen.queryByRole("button", { name: thai.close })).not.toBeInTheDocument();

    rerender(
      <AttractionImprovementWorkspace
        attractionId={7}
        scope={scope}
        dimension="overall"
        canReview
        canManage
        canVerify
        workspace={{ candidate: qualifyFeedbackCandidate(metrics()), issues: [issue()], actions: [action("verified")], history: [], owners, rules: FEEDBACK_RULES }}
      />,
    );
    expect(screen.getByRole("button", { name: thai.close })).toHaveClass("min-h-11");
  });

  it("does not reveal identity or private storage paths in the evidence summary", () => {
    const { container } = renderWorkspace({ workspace: {
      candidate: qualifyFeedbackCandidate(metrics()),
      issues: [issue()],
      actions: [{ ...action("completed"), completionEvidenceNote: "Visitor Name; storage/private/tourist-001/photo.jpg" }],
      history: [],
      owners,
      rules: FEEDBACK_RULES,
    } });
    const text = container.textContent ?? "";

    expect(text).not.toContain("Visitor Name");
    expect(text).not.toContain("storage/private/tourist-001/photo.jpg");
    expect(within(container).queryByText(/tourist-001|private\/photo/)).not.toBeInTheDocument();
  });
});
