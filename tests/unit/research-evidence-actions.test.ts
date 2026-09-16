// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ record: vi.fn(), redirect: vi.fn(), revalidate: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/lib/services/admin-research.service", () => ({ recordAdminResearchActivationEvidence: mocks.record }));

import { recordResearchActivationEvidenceAction } from "@/app/actions/admin-research-actions";

function form() {
  const data = new FormData();
  Object.entries({ studyId: "study-1", evidenceType: "expert_review", status: "passed", versionNumber: "2", evidenceDate: "2026-09-16", reference: "review-file", summary: "Reviewed" })
    .forEach(([key, value]) => data.set(key, value));
  return data;
}

describe("research evidence action input boundary", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.record.mockResolvedValue({}); });

  it.each(["", "pending", "PASSED"])("rejects invalid status %j without recording a passing result", async (value) => {
    const data = form(); data.set("status", value);
    await recordResearchActivationEvidenceAction(data);
    expect(mocks.record).not.toHaveBeenCalled();
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/research/study-1?result=activation_evidence_failed");
  });

  it.each(["", "unknown"])("rejects invalid evidence type %j", async (value) => {
    const data = form(); data.set("evidenceType", value);
    await recordResearchActivationEvidenceAction(data);
    expect(mocks.record).not.toHaveBeenCalled();
  });

  it.each(["passed", "failed", "not_required"])("preserves explicitly chosen status %s", async (status) => {
    const data = form(); data.set("status", status);
    await recordResearchActivationEvidenceAction(data);
    expect(mocks.record).toHaveBeenCalledWith(expect.objectContaining({ evidenceType: "expert_review", status, versionNumber: 2 }));
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/research/study-1?result=activation_evidence_recorded");
  });

  it("returns a sanitized failure when the permission or persistence service rejects", async () => {
    mocks.record.mockRejectedValueOnce(new Error("private database detail"));
    await recordResearchActivationEvidenceAction(form());
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/research/study-1?result=activation_evidence_failed");
  });
});
