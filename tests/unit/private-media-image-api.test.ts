import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireTouristVisitAccess: vi.fn(),
  getPhotoByStoragePath: vi.fn(),
  getCertificateByPath: vi.fn(),
  createPrivateFileSignedUrl: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => ({
  requireTouristVisitAccess: mocks.requireTouristVisitAccess,
}));

vi.mock("@/lib/repositories/visit-photo.repository", () => ({
  getPhotoByStoragePath: mocks.getPhotoByStoragePath,
}));

vi.mock("@/lib/repositories/certificate.repository", () => ({
  getCertificateByPath: mocks.getCertificateByPath,
}));

vi.mock("@/lib/storage/private-files", () => ({
  createPrivateFileSignedUrl: mocks.createPrivateFileSignedUrl,
}));

import { GET } from "@/app/api/media/image/route";

function request(url: string) {
  return new NextRequest(url);
}

async function responseBytes(response: Response) {
  return Buffer.from(await response.arrayBuffer());
}

describe("GET /api/media/image private access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireTouristVisitAccess.mockResolvedValue({ visit: { visit_id: "visit-1" } });
    mocks.getPhotoByStoragePath.mockResolvedValue({ photo_id: "photo-1", visit_id: "visit-1" });
    mocks.getCertificateByPath.mockResolvedValue({ certificate_id: "cert-1", visit_id: "visit-1" });
    mocks.createPrivateFileSignedUrl.mockResolvedValue("https://signed.example/file.png");
    mocks.fetch.mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { "Content-Type": "image/png" },
    }));
    vi.stubGlobal("fetch", mocks.fetch);
  });

  it("requires tourist ownership before serving a visit photo", async () => {
    const response = await GET(request(
      "http://localhost:3000/api/media/image?bucket=visit-photos&path=visit-photos/2026/06/visit-1/photo.webp",
    ));

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, max-age=300");
    expect(mocks.getPhotoByStoragePath).toHaveBeenCalledWith("visit-photos/2026/06/visit-1/photo.webp");
    expect(mocks.requireTouristVisitAccess).toHaveBeenCalledWith("visit-1");
    expect(mocks.createPrivateFileSignedUrl).toHaveBeenCalledWith(
      "visit-photos",
      "visit-photos/2026/06/visit-1/photo.webp",
      3600,
    );
    expect(await responseBytes(response)).toEqual(Buffer.from([1, 2, 3]));
  });

  it("requires tourist ownership before serving a certificate file", async () => {
    const response = await GET(request(
      "http://localhost:3000/api/media/image?bucket=certificate-files&path=certificates/2026/06/visit-1/cert.png",
    ));

    expect(response.status).toBe(200);
    expect(mocks.getCertificateByPath).toHaveBeenCalledWith("certificates/2026/06/visit-1/cert.png");
    expect(mocks.requireTouristVisitAccess).toHaveBeenCalledWith("visit-1");
    expect(mocks.createPrivateFileSignedUrl).toHaveBeenCalledWith(
      "certificate-files",
      "certificates/2026/06/visit-1/cert.png",
      3600,
    );
  });

  it("returns only a placeholder when private media has no matching DB record", async () => {
    mocks.getPhotoByStoragePath.mockResolvedValueOnce(null);

    const response = await GET(request(
      "http://localhost:3000/api/media/image?bucket=visit-photos&path=visit-photos/missing.webp",
    ));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(mocks.requireTouristVisitAccess).not.toHaveBeenCalled();
    expect(mocks.createPrivateFileSignedUrl).not.toHaveBeenCalled();
  });

  it("keeps public Cloudinary references compatible when no private bucket is provided", async () => {
    const path = encodeURIComponent("cloudinary:image:authenticated:v1:webp:southern-border-tourism/content-media/public");
    const response = await GET(request(`http://localhost:3000/api/media/image?path=${path}`));

    expect(response.status).toBe(200);
    expect(mocks.getPhotoByStoragePath).not.toHaveBeenCalled();
    expect(mocks.getCertificateByPath).not.toHaveBeenCalled();
    expect(mocks.createPrivateFileSignedUrl).toHaveBeenCalledWith(
      "visit-photos",
      "cloudinary:image:authenticated:v1:webp:southern-border-tourism/content-media/public",
      3600,
    );
  });
});
