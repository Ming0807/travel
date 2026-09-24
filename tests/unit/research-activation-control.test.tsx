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

  it("previews the study versions and published instrument before freeze without extra inputs", () => {
    const studyDetail = detail("passed");
    studyDetail.study.status = "draft";
    studyDetail.instruments = [{
      researchInstrumentId: "instrument-1",
      studyId: "pilot-1",
      instrumentKey: "tourist_evaluation",
      versionNumber: 3,
      audience: "tourist",
      status: "published",
      titleTh: "แบบประเมินนักท่องเที่ยว",
      titleEn: null,
      descriptionTh: null,
      descriptionEn: null,
      estimatedMinutes: 4,
      publishedAt: "2026-09-01T00:00:00.000Z",
      frozenAt: "2026-09-01T00:00:00.000Z",
      createdAt: "2026-09-01T00:00:00.000Z",
    }];
    studyDetail.items = [{
      researchItemId: "item-1",
      instrumentId: "instrument-1",
      itemCode: "SQ1",
      constructKey: "system_quality",
      promptTh: "ใช้ง่าย",
      promptEn: null,
      answerType: "agreement_5",
      options: null,
      displayOrder: 1,
      isRequired: true,
      reverseScore: false,
    }];

    render(<ResearchActivationControlCenter detail={studyDetail} canManage canFreeze />);

    expect(screen.getByText("Manifest ที่ระบบจะบันทึก")).toBeInTheDocument();
    expect(screen.getByText("tourist_evaluation · นักท่องเที่ยว")).toBeInTheDocument();
    expect(screen.getByText("v3 · 1 ข้อ")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Protocol" })).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /manifest นี้ตรวจแล้ว/ })).toBeRequired();
  });

  it("shows the persisted manifest and all recorded revision fields after freeze", () => {
    const studyDetail = detail("passed");
    studyDetail.freezeSnapshot = {
      snapshotId: "freeze-1",
      studyId: "pilot-1",
      protocolVersion: "protocol-locked",
      consentVersion: "consent-locked",
      noticeVersion: "notice-locked",
      instrumentManifest: [{ instrumentKey: "tourist_evaluation", versionNumber: 2, audience: "tourist", itemCodes: ["SQ1", "SQ2"] }],
      taskManifest: [{ taskCode: "segment_choice", versionNumber: 1, audience: "operator" }],
      scoringVersion: "score-1",
      retentionVersion: "retention-1",
      withdrawalVersion: "withdrawal-1",
      languageVersion: "language-1",
      inclusionVersion: "inclusion-1",
      applicationRevision: "app-abc123",
      databaseRevision: "db-20260901",
      frozenAt: "2026-09-01T00:00:00.000Z",
    };

    render(<ResearchActivationControlCenter detail={studyDetail} canManage canFreeze={false} />);

    expect(screen.getByText("Manifest ที่บันทึกใน Freeze")).toBeInTheDocument();
    expect(screen.getByText("vprotocol-locked")).toBeInTheDocument();
    expect(screen.getByText("v2 · 2 ข้อ")).toBeInTheDocument();
    expect(screen.getByText("segment_choice · ผู้ประกอบการ")).toBeInTheDocument();
    expect(screen.getByText("retention-1")).toBeInTheDocument();
    expect(screen.getByText("withdrawal-1")).toBeInTheDocument();
  });
});
