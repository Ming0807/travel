import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/actions/admin-research-actions", () => ({
  freezeResearchStudyAction: vi.fn(),
  recordResearchActivationEvidenceAction: vi.fn(),
  recordResearchPilotReviewAction: vi.fn(),
}));

import { ResearchActivationControlCenter } from "@/components/admin/research/ResearchActivationControlCenter";
import type { AdminResearchStudyDetail } from "@/lib/repositories/admin-research.repository";

function detail(status: "passed" | "failed" | "not_required"): AdminResearchStudyDetail {
  return {
    study: {
      researchStudyId: "pilot-1",
      studyCode: "pilot-test",
      titleTh: "โครงการนำร่อง",
      titleEn: null,
      protocolVersion: "1",
      consentVersion: "1",
      noticeVersion: "1",
      purposeTh: "ทดสอบระบบ",
      participationTh: "สมัครใจ",
      privacyTh: "ข้อมูลรวม",
      withdrawalTh: "ถอนได้",
      contactEmail: "research@example.test",
      scopeCode: "pilot",
      studyKind: "pilot",
      sourcePilotStudyId: null,
      status: "paused",
      startsAt: null,
      endsAt: null,
      retentionUntil: null,
      advisorApprovedAt: null,
      ethicsReviewStatus: "pending",
      ethicsApprovedAt: null,
      approvalReference: null,
      approvalRecordedBy: null,
      approvedTitleTh: null,
      approvedGeographicBoundary: null,
      approvedObjectives: [],
      approvedResearchQuestions: [],
      analysisWording: null,
      frozenAt: null,
      ownerAdminId: "admin-1",
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: null,
    },
    instruments: [],
    items: [],
    deployments: [],
    operatorTasks: [],
    activationEvidence: [{
      evidenceId: "evidence-1",
      studyId: "pilot-1",
      evidenceType: "expert_review",
      versionNumber: 1,
      status,
      evidenceDate: "2026-09-01",
      reference: "REVIEW-1",
      summary: "ตรวจเครื่องมือ",
      participantCount: 3,
      medianCompletionSeconds: null,
      abandonmentRate: null,
      missingnessRate: null,
      recordedAt: "2026-09-01T00:00:00.000Z",
    }],
    freezeSnapshot: null,
    pilotReviews: [],
    sourcePilotReadyForField: false,
  };
}

describe("research activation control", () => {
  it.each([
    ["passed", "ผ่าน"],
    ["failed", "ไม่ผ่าน"],
    ["not_required", "ไม่จำเป็นตามหลักฐานอนุมัติ"],
  ] as const)("shows the %s evidence result in Thai", (status, label) => {
    render(<ResearchActivationControlCenter detail={detail(status)} canManage canFreeze={false} />);

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.queryByText(status)).not.toBeInTheDocument();
  });

  it("requires a deliberate Pilot decision rather than preselecting a result", () => {
    render(<ResearchActivationControlCenter detail={detail("passed")} canManage canFreeze={false} />);

    const decision = screen.getByRole("combobox", { name: "ผลตัดสิน" });
    expect(decision).toBeRequired();
    expect(decision).toHaveValue("");
  });
});
