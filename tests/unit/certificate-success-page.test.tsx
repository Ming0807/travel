import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireTouristVisitAccess: vi.fn(),
  getCertificateByVisitId: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => ({
  requireTouristVisitAccess: mocks.requireTouristVisitAccess,
}));

vi.mock("@/lib/repositories/certificate.repository", () => ({
  getCertificateByVisitId: mocks.getCertificateByVisitId,
}));

import CertificateSuccessPage from "@/app/(tourist)/visit/[visitId]/certificate/success/page";

const visitId = "550e8400-e29b-41d4-a716-446655440000";
const certificateUrl = "/api/media/image?bucket=certificate-files&path=certificates%2F2026%2F08%2Fvisit.png";

describe("certificate success page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireTouristVisitAccess.mockResolvedValue({ visit: { visit_id: visitId } });
  });

  it("renders the actual generated certificate image from the owned media proxy", async () => {
    mocks.getCertificateByVisitId.mockResolvedValue({
      certificate_id: "certificate-1",
      certificate_path: "certificates/2026/08/visit.png",
    });

    const view = await CertificateSuccessPage({
      params: Promise.resolve({ visitId }),
      searchParams: Promise.resolve({ stamp: "earned" }),
    });
    render(view);

    const image = screen.getByRole("img", { name: "ใบประกาศการท่องเที่ยวของคุณ" });
    expect(image).toHaveAttribute("src", certificateUrl);
    expect(image.getAttribute("src")).not.toContain("supabase.co");
    expect(image.getAttribute("src")).not.toContain("signed.example");
  });

  it("does not present a success state with an empty certificate URL", async () => {
    mocks.getCertificateByVisitId.mockResolvedValue(null);

    const view = await CertificateSuccessPage({
      params: Promise.resolve({ visitId }),
      searchParams: Promise.resolve({ stamp: "none" }),
    });
    render(view);

    expect(screen.getByText("ยังไม่พบไฟล์ใบประกาศ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ลองสร้างใบประกาศอีกครั้ง" })).toHaveAttribute(
      "href",
      `/visit/${visitId}/certificate/preview`,
    );
  });
});
