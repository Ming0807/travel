import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  reviewCandidate: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/services/attraction-feedback.service", () => ({
  AttractionFeedbackService: class {
    reviewCandidate = mocks.reviewCandidate;
  },
}));

import { reviewAttractionFeedbackAction } from "@/app/actions/admin-attraction-feedback-actions";

function reviewForm(decision?: string) {
  const form = new FormData();
  form.set("attractionId", "7");
  form.set("dateStart", "2026-01-01");
  form.set("dateEnd", "2026-01-31");
  form.set("issueDimension", "safety");
  form.set("issueCategory", "safety");
  form.set("evidenceScope", "all_records");
  if (decision !== undefined) form.set("decision", decision);
  return form;
}

describe("reviewAttractionFeedbackAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([undefined, ""])("rejects a missing or blank decision (%s)", async (decision) => {
    await expect(reviewAttractionFeedbackAction(reviewForm(decision)))
      .rejects.toThrow("REDIRECT:/admin/attractions/7/improvements?result=issue_failed");
    expect(mocks.reviewCandidate).not.toHaveBeenCalled();
  });

  it("passes an explicitly selected decision to the service", async () => {
    await expect(reviewAttractionFeedbackAction(reviewForm("accept")))
      .rejects.toThrow("REDIRECT:/admin/attractions/7/improvements?result=issue_saved");
    expect(mocks.reviewCandidate).toHaveBeenCalledWith(expect.objectContaining({ decision: "accept", evidenceScope: "all_records" }));
  });

  it("passes the selected research population for a fresh server-side review", async () => {
    const form = reviewForm("accept");
    form.set("evidenceScope", "pilot_only");
    form.set("entryChannel", "nfc");
    form.set("campaignId", "3");
    form.set("checkinCodeId", "9");
    await expect(reviewAttractionFeedbackAction(form))
      .rejects.toThrow("REDIRECT:/admin/attractions/7/improvements?result=issue_saved");
    expect(mocks.reviewCandidate).toHaveBeenCalledWith(expect.objectContaining({
      evidenceScope: "pilot_only", entryChannel: "nfc", campaignId: 3, checkinCodeId: 9,
    }));
  });

  it("rejects an invalid evidence scope before calling the service", async () => {
    const form = reviewForm("accept");
    form.set("evidenceScope", "unverified_field");
    await expect(reviewAttractionFeedbackAction(form))
      .rejects.toThrow("REDIRECT:/admin/attractions/7/improvements?result=issue_failed");
    expect(mocks.reviewCandidate).not.toHaveBeenCalled();
  });

  it("rejects a request that omits the evidence population", async () => {
    const form = reviewForm("accept");
    form.delete("evidenceScope");
    await expect(reviewAttractionFeedbackAction(form))
      .rejects.toThrow("REDIRECT:/admin/attractions/7/improvements?result=issue_failed");
    expect(mocks.reviewCandidate).not.toHaveBeenCalled();
  });
});
