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
  attractionId: 7,
  evidenceScope: "all_records" as const,
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
    scope,
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

  it("keeps the supported satisfaction scope and labels saved issues as historical", () => {
    renderWorkspace({ scope: { ...scope, evidenceScope: "pilot_only", entryChannel: "nfc", campaignId: 7, checkinCodeId: 10 } });
    expect(screen.getByRole("link", { name: /ดูภาพรวมความพึงพอใจ/ })).toHaveAttribute(
      "href",
      "/admin/dashboard/satisfaction?attraction_id=7&date_from=2026-01-01&date_to=2026-01-31&evidence_scope=pilot_only",
    );
    expect(screen.getByText(/ประเด็นที่บันทึกไว้ทั้งหมดของสถานที่นี้/)).toBeInTheDocument();
    expect(screen.getByText(/ปลายทางไม่รองรับตัวกรองช่องทาง/)).toBeInTheDocument();
  });

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

  it("shows baseline, ownership, deadline, follow-up, and outcome in one timeline", () => {
    renderWorkspace({ workspace: {
      candidate: qualifyFeedbackCandidate(metrics()),
      issues: [issue()],
      actions: [{ ...action("verified"), completionEvidenceNote: "Installed bilingual signs." }],
      history: [
        ...history(),
        {
          historyId: "00000000-0000-4000-8000-000000000005",
          feedbackIssueId: ids.issue,
          improvementActionId: ids.action,
          fromStatus: "completed",
          toStatus: "verified",
          changedBy: ids.owner,
          note: "Follow-up score improved and was reviewed.",
          createdAt: "2026-04-01T00:00:00.000Z",
        },
      ],
      owners,
      rules: FEEDBACK_RULES,
    } });

    const timeline = screen.getByRole("region", { name: "ไทม์ไลน์การปรับปรุง ภาพรวม" });
    expect(within(timeline).getByText("Baseline")).toBeInTheDocument();
    expect(within(timeline).getAllByText(/ผู้รับผิดชอบทดสอบ/).length).toBeGreaterThan(0);
    expect(within(timeline).getByText(/ช่วงติดตามผล/)).toBeInTheDocument();
    expect(within(timeline).getByText(/Installed bilingual signs/)).toBeInTheDocument();
    expect(within(timeline).getByText(/Follow-up score improved and was reviewed/)).toBeInTheDocument();
  });

  it("shows an immutable follow-up snapshot with denominators and a non-causal interpretation", () => {
    const verified = {
      ...action("verified"),
      verificationSnapshot: {
        schemaVersion: 1 as const,
        capturedAt: "2026-04-01T00:00:00.000Z",
        sourceIssueId: ids.issue,
        sourceIssueSnapshotVersion: 2 as const,
        attractionId: 7,
        issueDimension: "overall" as const,
        metric: "overall_score" as const,
        population: { evidenceScope: "all_records" as const, entryChannel: null, campaignId: null, checkinCodeId: null },
        baseline: { start: "2026-01-01", end: "2026-01-31", visits: 120, validResponses: 30, value: 2.8 },
        followUp: { start: "2026-03-01", end: "2026-03-31", visits: 95, validResponses: 40, value: 3.6 },
        comparisonState: "comparable" as const,
      },
    };
    renderWorkspace({ workspace: {
      candidate: qualifyFeedbackCandidate(metrics()),
      issues: [issue()], actions: [verified], history: [], owners, rules: FEEDBACK_RULES,
    } });

    const timeline = screen.getByRole("region", { name: "ไทม์ไลน์การปรับปรุง ภาพรวม" });
    expect(within(timeline).getByText(/ก่อนดำเนินการ: 2.80/)).toBeInTheDocument();
    expect(within(timeline).getByText(/ช่วงติดตาม: 3.60/)).toBeInTheDocument();
    expect(within(timeline).getByText(/คำตอบ 40 \/ Visits 95/)).toBeInTheDocument();
    expect(within(timeline).getByText(/ไม่ได้พิสูจน์ว่าเกิดจากแผนนี้/)).toBeInTheDocument();
  });

  it("warns that recurrence counts with different response bases are descriptive, not directly comparable", () => {
    renderWorkspace({ workspace: {
      candidate: qualifyFeedbackCandidate(metrics()),
      issues: [issue()],
      actions: [{
        ...action("verified"),
        followUpMetric: "structured_recurrence_count",
        verificationSnapshot: {
          schemaVersion: 1,
          capturedAt: "2026-04-01T00:00:00.000Z",
          sourceIssueId: ids.issue,
          sourceIssueSnapshotVersion: 2,
          attractionId: 7,
          issueDimension: "overall",
          metric: "structured_recurrence_count",
          population: { evidenceScope: "all_records", entryChannel: null, campaignId: null, checkinCodeId: null },
          baseline: { start: "2026-01-01", end: "2026-01-31", visits: 120, validResponses: 30, value: 5 },
          followUp: { start: "2026-03-01", end: "2026-03-31", visits: 80, validResponses: 50, value: 3 },
          comparisonState: "descriptive_count",
        },
      }],
      history: [], owners, rules: FEEDBACK_RULES,
    } });

    expect(screen.getByText(/จำนวนดิบ.*ไม่ควรเปรียบเทียบตรง ๆ/)).toBeInTheDocument();
  });

  it("identifies overlapping historical periods explicitly", () => {
    renderWorkspace({ workspace: {
      candidate: qualifyFeedbackCandidate(metrics()),
      issues: [issue()],
      actions: [{
        ...action("verified"),
        verificationSnapshot: {
          schemaVersion: 1,
          capturedAt: "2026-04-01T00:00:00.000Z",
          sourceIssueId: ids.issue,
          sourceIssueSnapshotVersion: 2,
          attractionId: 7,
          issueDimension: "overall",
          metric: "overall_score",
          population: { evidenceScope: "all_records", entryChannel: null, campaignId: null, checkinCodeId: null },
          baseline: { start: "2026-01-01", end: "2026-01-31", visits: 120, validResponses: 30, value: 2.8 },
          followUp: { start: "2026-01-20", end: "2026-02-20", visits: 90, validResponses: 40, value: 3.2 },
          comparisonState: "overlapping_period",
        },
      }],
      history: [], owners, rules: FEEDBACK_RULES,
    } });

    expect(screen.getByText(/ช่วงติดตามซ้อนกับ baseline/)).toBeInTheDocument();
  });

  it("limits new score metrics to the reviewed dimension", () => {
    renderWorkspace({ workspace: {
      candidate: qualifyFeedbackCandidate(metrics()),
      issues: [issue()], actions: [], history: [], owners, rules: FEEDBACK_RULES,
    } });
    const metric = screen.getByLabelText("ตัวชี้วัดติดตาม");
    expect(within(metric).getAllByRole("option")).toHaveLength(3);
    expect(metric).toHaveValue("overall_score");
  });

  it("prefills a reviewed issue draft from aggregate analytics context", () => {
    renderWorkspace({
      draft: {
        source: "low_score",
        category: "safety",
        note: "ร่างจากคะแนนความปลอดภัยเฉลี่ย 2.80 / 5 (ข้อมูลรวมเท่านั้น)",
        sourceContext: "ขอบเขตต้นทางจากลิงก์: Pilot เท่านั้น · ช่องทาง: nfc",
      },
    });

    expect(screen.getByText(/ร่างจากข้อมูลวิเคราะห์รวม/)).toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveTextContent("Pilot เท่านั้น");
    expect(screen.getByRole("note")).toHaveTextContent("ชุดหลักฐานที่เลือก");
    expect(screen.getByLabelText("จัดหมวดประเด็น")).toHaveValue("safety");
    expect(screen.getByLabelText("ผลการพิจารณา")).toHaveValue("");
    expect(screen.getByLabelText("เหตุผลการพิจารณา")).toHaveValue("ร่างจากคะแนนความปลอดภัยเฉลี่ย 2.80 / 5 (ข้อมูลรวมเท่านั้น)");
  });

  it("keeps draft provenance visible when the local candidate does not qualify", () => {
    renderWorkspace({
      draft: {
        source: "low_score",
        category: "service",
        note: "ร่างจากกราฟ",
        sourceContext: "ขอบเขตต้นทางจากลิงก์: ภาคสนาม",
      },
      workspace: {
        candidate: { ...qualifyFeedbackCandidate(metrics()), qualifies: false },
        issues: [],
        actions: [],
        history: [],
        owners,
        rules: FEEDBACK_RULES,
      },
    });

    expect(screen.getByRole("note")).toHaveTextContent("ภาคสนาม");
    expect(screen.queryByRole("button", { name: thai.review })).not.toBeInTheDocument();
  });

  it("carries reviewed population filters into the issue and follow-up analytics link", () => {
    const selectedScope = { ...scope, evidenceScope: "pilot_only" as const, entryChannel: "nfc" as const, campaignId: 3, checkinCodeId: 9 };
    const selectedIssue = {
      ...issue(),
      evidenceSnapshot: buildEvidenceSnapshot({ ...metrics(), scope: selectedScope }),
    };
    const { container } = renderWorkspace({
      scope: selectedScope,
      workspace: {
        candidate: qualifyFeedbackCandidate({ ...metrics(), scope: selectedScope }),
        issues: [selectedIssue],
        actions: [action()],
        history: [],
        owners,
        rules: FEEDBACK_RULES,
      },
    });

    expect(container.querySelector('input[name="evidenceScope"]')).toHaveValue("pilot_only");
    expect(container.querySelector('input[name="entryChannel"]')).toHaveValue("nfc");
    expect(container.querySelector('input[name="campaignId"]')).toHaveValue("3");
    expect(screen.getByText(/ประชากรหลักฐาน: Pilot · ช่องทาง nfc · แคมเปญ 3 · จุดเช็กอิน 9/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ดูข้อมูลช่วงติดตาม/ })).toHaveAttribute(
      "href",
      expect.stringContaining("evidenceScope=pilot_only&entryChannel=nfc&campaignId=3&checkinCodeId=9"),
    );
  });

  it("suppresses partial candidate numbers when the bounded source read is incomplete", () => {
    renderWorkspace({ workspace: {
      candidate: qualifyFeedbackCandidate({ ...metrics(), isTruncated: true }),
      issues: [], actions: [], history: [], owners, rules: FEEDBACK_RULES,
    } });
    expect(screen.getByRole("alert")).toHaveTextContent("อ่านข้อมูลช่วงนี้ได้ไม่ครบ");
    expect(screen.getAllByText("ข้อมูลไม่ครบ")).toHaveLength(5);
    expect(screen.queryByRole("button", { name: thai.review })).not.toBeInTheDocument();
  });
});
