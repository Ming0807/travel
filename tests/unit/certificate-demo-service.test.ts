import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireTouristVisitAccess } from "@/lib/auth/guards";
import { createCertificate } from "@/lib/repositories/certificate.repository";
import { processCertificateGeneration } from "@/lib/services/certificate.service";

vi.mock("@/lib/auth/guards", () => ({ requireTouristVisitAccess: vi.fn() }));
vi.mock("@/lib/repositories/visit.repository", () => ({ updateVisitStatus: vi.fn() }));
vi.mock("@/lib/repositories/certificate.repository", () => ({
  createCertificate: vi.fn(), getCertificateByVisitId: vi.fn(),
}));
vi.mock("@/lib/repositories/visit-photo.repository", () => ({ getPhotoById: vi.fn() }));
vi.mock("@/lib/repositories/funnel.repository", () => ({ recordFunnelEvent: vi.fn() }));

describe("certificate service demo isolation", () => {
  beforeEach(() => vi.resetAllMocks());

  it("rejects demo rewards independently of the HTTP route", async () => {
    vi.mocked(requireTouristVisitAccess).mockResolvedValue({
      touristId: "tourist-1",
      visit: { checkin_codes: { label: "Demo QR: trial" } },
    });
    await expect(processCertificateGeneration({
      visitId: "visit-1", templateId: 1, certificatePath: "certificates/trial.png",
    })).rejects.toMatchObject({ code: "DEMO_CHECKIN_REWARD_BLOCKED" });
    expect(createCertificate).not.toHaveBeenCalled();
  });
});
