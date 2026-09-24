import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ hasCurrentResearchParticipation: vi.fn() }));

vi.mock("@/lib/services/research.service", () => ({
  hasCurrentResearchParticipation: mocks.hasCurrentResearchParticipation,
}));
vi.mock("@/app/actions/research-actions", () => ({ withdrawResearchSessionAction: vi.fn() }));
vi.mock("@/lib/config/research-browser", () => ({ researchBrowserProvisioningEnabled: () => false }));

import ResearchWithdrawalPage from "@/app/(tourist)/research/withdraw/current/page";

const visitId = "22222222-2222-4222-8222-222222222222";
const certificateHref = `/visit/${visitId}/certificate/success`;

describe("research withdrawal return", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasCurrentResearchParticipation.mockResolvedValue(true);
  });

  it("returns a participant to the certificate after withdrawal", async () => {
    render(await ResearchWithdrawalPage({ searchParams: Promise.resolve({ visitId, success: "1" }) }));

    expect(screen.getByRole("link", { name: "กลับไปดูใบประกาศ" })).toHaveAttribute("href", certificateHref);
  });

  it("returns a participant to the certificate when they decide not to withdraw", async () => {
    render(await ResearchWithdrawalPage({ searchParams: Promise.resolve({ visitId }) }));

    expect(screen.getByRole("link", { name: "ยังไม่ถอนตัว · กลับไปดูใบประกาศ" })).toHaveAttribute(
      "href",
      certificateHref,
    );
  });
});
