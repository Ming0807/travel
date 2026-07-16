import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => {
  class MockTouristAccessError extends Error {
    constructor(public readonly code: string, message: string) {
      super(message);
    }
  }
  class MockTemplateError extends Error {}
  return {
    TouristAccessError: MockTouristAccessError,
    TemplateError: MockTemplateError,
    requireTouristVisitAccess: vi.fn(),
    resolveCertificateTemplate: vi.fn(),
    createPrivateFileSignedUrl: vi.fn(),
  };
});

vi.mock("@/lib/auth/guards", () => ({
  TouristAccessError: mocks.TouristAccessError,
  requireTouristVisitAccess: mocks.requireTouristVisitAccess,
}));
vi.mock("@/lib/services/certificate-template.service", () => ({
  CertificateTemplateResolutionError: mocks.TemplateError,
  resolveCertificateTemplate: mocks.resolveCertificateTemplate,
}));
vi.mock("@/lib/storage/private-files", () => ({
  createPrivateFileSignedUrl: mocks.createPrivateFileSignedUrl,
}));

import { GET } from "@/app/api/certificate/template-image/route";

const visitId = "550e8400-e29b-41d4-a716-446655440000";

function request(query = `visitId=${visitId}&templateId=7`) {
  return {
    nextUrl: new URL(`http://localhost/api/certificate/template-image?${query}`),
  } as unknown as NextRequest;
}

describe("GET /api/certificate/template-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireTouristVisitAccess.mockResolvedValue({ visit: { attraction_id: 12 } });
    mocks.resolveCertificateTemplate.mockResolvedValue({
      templateId: 7,
      backgroundPath: "certificate-templates/yala.webp",
    });
    mocks.createPrivateFileSignedUrl.mockResolvedValue("https://storage.example/yala.webp");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array([1, 2, 3]), {
          status: 200,
          headers: { "content-type": "image/webp" },
        })
      )
    );
  });

  it("checks visit ownership and template scope before proxying image bytes", async () => {
    const response = await GET(request());

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(mocks.requireTouristVisitAccess).toHaveBeenCalledWith(visitId);
    expect(mocks.resolveCertificateTemplate).toHaveBeenCalledWith({
      attractionId: 12,
      language: "th",
      requestedTemplateId: 7,
    });
  });

  it("rejects invalid identifiers before storage access", async () => {
    const response = await GET(request("visitId=bad&templateId=0"));
    expect(response.status).toBe(400);
    expect(mocks.requireTouristVisitAccess).not.toHaveBeenCalled();
    expect(mocks.createPrivateFileSignedUrl).not.toHaveBeenCalled();
  });

  it("does not expose the image when the visit belongs to another tourist", async () => {
    mocks.requireTouristVisitAccess.mockRejectedValueOnce(
      new mocks.TouristAccessError("VISIT_ACCESS_DENIED", "ไม่มีสิทธิ์เข้าถึง")
    );
    const response = await GET(request());
    expect(response.status).toBe(403);
    expect(mocks.createPrivateFileSignedUrl).not.toHaveBeenCalled();
  });
});
