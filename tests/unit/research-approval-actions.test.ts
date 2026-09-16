// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ record: vi.fn(), redirect: vi.fn(), revalidate: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/lib/services/admin-research.service", () => ({ recordAdminResearchApproval: mocks.record }));

import { recordResearchApprovalAction } from "@/app/actions/admin-research-actions";

function form() {
  const data = new FormData();
  Object.entries({ studyId: "study-1", confirmRecordedEvidence: "true", ethicsReviewStatus: "not_required", analysisWording: "descriptive_associational", advisorApprovedAt: "2026-09-16", approvalReference: "approval-file", approvedTitleTh: "Title", approvedGeographicBoundary: "Yala", approvedObjectives: "Objective", approvedResearchQuestions: "Question" })
    .forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("research approval action input boundary", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.record.mockResolvedValue({}); });

  it.each(["", "pending", "invalid"])("does not turn ethics status %j into an exemption", async (value) => {
    const data = form(); data.set("ethicsReviewStatus", value);
    await recordResearchApprovalAction(data);
    expect(mocks.record).not.toHaveBeenCalled();
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/research/study-1?result=approval_failed");
  });

  it.each(["", "invalid"])("does not invent analysis wording for %j", async (value) => {
    const data = form(); data.set("analysisWording", value);
    await recordResearchApprovalAction(data);
    expect(mocks.record).not.toHaveBeenCalled();
  });

  it.each(["exploratory", "descriptive_associational", "confirmatory"])("preserves explicitly approved wording %s", async (analysisWording) => {
    const data = form(); data.set("analysisWording", analysisWording);
    await recordResearchApprovalAction(data);
    expect(mocks.record).toHaveBeenCalledWith(expect.objectContaining({ ethicsReviewStatus: "not_required", analysisWording, confirmRecordedEvidence: true }));
  });

  it("passes an explicit ethics approval and date to the permission-checked service", async () => {
    const data = form(); data.set("ethicsReviewStatus", "approved"); data.set("ethicsApprovedAt", "2026-09-15");
    await recordResearchApprovalAction(data);
    expect(mocks.record).toHaveBeenCalledWith(expect.objectContaining({ ethicsReviewStatus: "approved", ethicsApprovedAt: "2026-09-15T00:00:00+07:00" }));
  });

  it("retains the explicit confirmation gate", async () => {
    const data = form(); data.delete("confirmRecordedEvidence");
    await recordResearchApprovalAction(data);
    expect(mocks.record).not.toHaveBeenCalled();
  });
});
