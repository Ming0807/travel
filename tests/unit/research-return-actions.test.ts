import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  acceptResearchInvitation: vi.fn(),
  withdrawResearchSession: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/services/research.service", () => ({
  acceptResearchInvitation: mocks.acceptResearchInvitation,
  withdrawResearchSession: mocks.withdrawResearchSession,
}));

import { acceptResearchInvitationAction, withdrawResearchSessionAction } from "@/app/actions/research-actions";

const visitId = "22222222-2222-4222-8222-222222222222";

describe("research return actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.acceptResearchInvitation.mockResolvedValue({});
    mocks.withdrawResearchSession.mockResolvedValue({});
  });

  it("does not redirect acceptance to an unrelated local route", async () => {
    const data = new FormData();
    data.set("studyCode", "pilot-2026");
    data.set("checkinCode", "YALA_01");
    data.set("returnTo", "/admin");
    data.set("hasConsented", "true");

    await expect(acceptResearchInvitationAction(data)).rejects.toThrow(
      "REDIRECT:/checkin/YALA_01/start?research=accepted",
    );
    expect(mocks.acceptResearchInvitation).toHaveBeenCalledWith(expect.objectContaining({
      checkinCode: "YALA_01",
      hasConsented: true,
    }));
  });

  it("retains the visit after withdrawal so the certificate remains reachable", async () => {
    const data = new FormData();
    data.set("visitId", visitId);

    await expect(withdrawResearchSessionAction(data)).rejects.toThrow(
      `REDIRECT:/research/withdraw/current?visitId=${visitId}&success=1`,
    );
    expect(mocks.withdrawResearchSession).toHaveBeenCalledWith(expect.objectContaining({ visitId }));
  });
});
