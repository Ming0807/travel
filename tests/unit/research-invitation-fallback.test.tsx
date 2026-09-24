import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getOptionalResearchInvitation: vi.fn() }));

vi.mock("@/lib/services/research.service", () => ({
  getOptionalResearchInvitation: mocks.getOptionalResearchInvitation,
}));

vi.mock("@/app/actions/research-actions", () => ({ acceptResearchInvitationAction: vi.fn() }));

import ResearchInvitationPage from "@/app/(tourist)/research/[studyCode]/invite/page";

const flow = "22222222-2222-4222-8222-222222222222";

describe("research invitation fallback", () => {
  beforeEach(() => vi.clearAllMocks());

  it.each(["missing", "failure"])("returns to the certificate flow when the invitation is %s", async (state) => {
    if (state === "failure") mocks.getOptionalResearchInvitation.mockRejectedValue(new Error("unavailable"));
    else mocks.getOptionalResearchInvitation.mockResolvedValue(null);

    const view = await ResearchInvitationPage({
      params: Promise.resolve({ studyCode: "pilot-2026" }),
      searchParams: Promise.resolve({ checkinCode: "YALA_01", returnTo: `/checkin/YALA_01/start?flow=${flow}` }),
    });
    render(view);

    expect(screen.getByText("คุณยังเช็กอินและสร้างใบประกาศได้ตามปกติ", { exact: false })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "กลับไปสร้างใบประกาศ" })).toHaveAttribute(
      "href",
      `/checkin/YALA_01/start?flow=${flow}`,
    );
  });
});
