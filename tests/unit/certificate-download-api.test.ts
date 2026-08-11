import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => {
  class MockTouristAccessError extends Error {
    constructor(
      public readonly code: string,
      message: string,
    ) {
      super(message);
      this.name = "TouristAccessError";
    }
  }

  return {
    TouristAccessError: MockTouristAccessError,
    requireTouristVisitAccess: vi.fn(),
    getCertificateByVisitId: vi.fn(),
    incrementCertificateDownload: vi.fn(),
    createPrivateFileSignedUrl: vi.fn(),
    fetch: vi.fn(),
  };
});

vi.mock("@/lib/auth/guards", () => ({
  TouristAccessError: mocks.TouristAccessError,
  requireTouristVisitAccess: mocks.requireTouristVisitAccess,
}));

vi.mock("@/lib/repositories/certificate.repository", () => ({
  getCertificateByVisitId: mocks.getCertificateByVisitId,
  incrementCertificateDownload: mocks.incrementCertificateDownload,
}));

vi.mock("@/lib/storage/private-files", () => ({
  createPrivateFileSignedUrl: mocks.createPrivateFileSignedUrl,
}));

import { GET } from "@/app/api/certificate/download/route";

const visitId = "550e8400-e29b-41d4-a716-446655440000";

function request(id = visitId) {
  return new NextRequest(`http://localhost:3000/api/certificate/download?visitId=${id}`);
}

async function responseBody(response: Response) {
  return (await response.json()) as { code?: string };
}

describe("GET /api/certificate/download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireTouristVisitAccess.mockResolvedValue({ visit: { visit_id: visitId } });
    mocks.getCertificateByVisitId.mockResolvedValue({
      certificate_id: "certificate-1",
      certificate_path: "certificates/2026/08/visit/certificate.png",
    });
    mocks.createPrivateFileSignedUrl.mockResolvedValue("https://signed.example/certificate.png");
    mocks.fetch.mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { "Content-Type": "image/png" },
    }));
    mocks.incrementCertificateDownload.mockResolvedValue(undefined);
    vi.stubGlobal("fetch", mocks.fetch);
  });

  it("rejects invalid visit identifiers before storage access", async () => {
    const response = await GET(request("not-a-uuid"));

    expect(response.status).toBe(400);
    expect((await responseBody(response)).code).toBe("INVALID_VISIT_ID");
    expect(mocks.requireTouristVisitAccess).not.toHaveBeenCalled();
  });

  it("requires ownership before reading the generated certificate", async () => {
    mocks.requireTouristVisitAccess.mockRejectedValueOnce(
      new mocks.TouristAccessError("VISIT_ACCESS_DENIED", "ไม่มีสิทธิ์เข้าถึง"),
    );

    const response = await GET(request());

    expect(response.status).toBe(403);
    expect((await responseBody(response)).code).toBe("VISIT_ACCESS_DENIED");
    expect(mocks.createPrivateFileSignedUrl).not.toHaveBeenCalled();
  });

  it("streams the owned image as an attachment and records the download", async () => {
    const response = await GET(request());

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Content-Disposition")).toContain(`travel-memory-${visitId}.png`);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(Buffer.from(await response.arrayBuffer())).toEqual(Buffer.from([1, 2, 3]));
    expect(mocks.createPrivateFileSignedUrl).toHaveBeenCalledWith(
      "certificate-files",
      "certificates/2026/08/visit/certificate.png",
      300,
    );
    expect(mocks.incrementCertificateDownload).toHaveBeenCalledWith("certificate-1");
  });

  it("returns a real error instead of a placeholder when storage is unavailable", async () => {
    mocks.fetch.mockResolvedValueOnce(new Response(null, { status: 404 }));

    const response = await GET(request());

    expect(response.status).toBe(502);
    expect((await responseBody(response)).code).toBe("CERTIFICATE_FILE_UNAVAILABLE");
    expect(mocks.incrementCertificateDownload).not.toHaveBeenCalled();
  });
});
