import { describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  createPrivateFileSignedUrl: vi.fn(),
  normalizeSiteMediaStoragePath: vi.fn(),
  siteMediaImageUrl: vi.fn(),
  resolveSafeImageContentType: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/storage/private-files", () => ({
  createPrivateFileSignedUrl: mocks.createPrivateFileSignedUrl,
}));
vi.mock("@/lib/media/storage-paths", () => ({
  isPublicContentMediaReference: () => false,
  normalizePublicContentMediaReference: vi.fn(),
  normalizeSiteMediaStoragePath: mocks.normalizeSiteMediaStoragePath,
  siteMediaImageUrl: mocks.siteMediaImageUrl,
  resolveSafeImageContentType: mocks.resolveSafeImageContentType,
}));

import { GET } from "@/app/api/admin/media/preview/route";

describe("admin media preview route", () => {
  it("keeps legacy site-media redirects on the request origin", async () => {
    mocks.requireAdmin.mockResolvedValue({ adminId: "admin-1" });
    mocks.normalizeSiteMediaStoragePath.mockReturnValue(
      "certificate-templates/southern-border-th.png"
    );
    mocks.siteMediaImageUrl.mockReturnValue(
      "http://localhost:3000/site-media/certificate-templates/southern-border-th.png"
    );
    mocks.resolveSafeImageContentType.mockReturnValue("image/png");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Uint8Array([1, 2, 3]), {
          status: 200,
          headers: { "content-type": "image/png" },
        })
      )
    );
    const request = {
      url: "http://127.0.0.1:3000/api/admin/media/preview?bucket=southern-border-tourism&path=certificate-templates%2Fsouthern-border-th.png",
      nextUrl: new URL(
        "http://127.0.0.1:3000/api/admin/media/preview?bucket=southern-border-tourism&path=certificate-templates%2Fsouthern-border-th.png"
      ),
    } as unknown as NextRequest;

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(fetch).toHaveBeenCalledWith(
      new URL("http://localhost:3000/site-media/certificate-templates/southern-border-th.png"),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(mocks.createPrivateFileSignedUrl).not.toHaveBeenCalled();
  });
});
