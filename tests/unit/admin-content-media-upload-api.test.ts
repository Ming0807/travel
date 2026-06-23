import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => {
  class MockAdminAuthError extends Error {
    constructor(
      public readonly code: "UNAUTHORIZED" | "FORBIDDEN",
      message: string,
    ) {
      super(message);
      this.name = "AdminAuthError";
    }
  }

  return {
    AdminAuthError: MockAdminAuthError,
    requirePermission: vi.fn(),
    uploadPrivateFile: vi.fn(),
    logAdminAction: vi.fn(),
    rateLimit: vi.fn(),
  };
});

vi.mock("@/lib/auth/guards", () => ({
  AdminAuthError: mocks.AdminAuthError,
  requirePermission: mocks.requirePermission,
}));

vi.mock("@/lib/storage/private-files", () => ({
  uploadPrivateFile: mocks.uploadPrivateFile,
}));

vi.mock("@/lib/repositories/admin-audit.repository", () => ({
  logAdminAction: mocks.logAdminAction,
}));

vi.mock("@/lib/utils/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mocks.rateLimit(...args),
}));

import { POST } from "@/app/api/admin/media/upload/route";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);

function pngFile() {
  return new File([onePixelPng], "admin-upload.png", { type: "image/png" });
}

function makeRequest(params: {
  file?: File;
  entityId?: string;
  entityType?: string;
  headers?: HeadersInit;
}) {
  const formData = new FormData();
  if (params.file) formData.set("file", params.file);
  if (params.entityId) formData.set("entityId", params.entityId);
  if (params.entityType) formData.set("entityType", params.entityType);

  return {
    headers: new Headers(params.headers),
    formData: async () => formData,
  } as unknown as NextRequest;
}

async function readJson(response: Response) {
  return await response.json() as Record<string, unknown>;
}

describe("POST /api/admin/media/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimit.mockReturnValue({ success: true, remaining: 19 });
    mocks.requirePermission.mockResolvedValue({
      adminId: "admin-1",
      authUserId: "auth-user-1",
    });
    mocks.uploadPrivateFile.mockImplementation(async (params: {
      bucket: string;
      path: string;
      data: Buffer;
      contentType: string;
    }) => ({
      provider: "supabase",
      bucket: params.bucket,
      storagePath: params.path,
      contentType: params.contentType,
      sizeBytes: params.data.byteLength,
    }));
  });

  it("stores a valid admin content image as processed WebP", async () => {
    const response = await POST(makeRequest({
      file: pngFile(),
      entityId: "12",
      entityType: "attraction",
    }));
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      contentType: "image/webp",
    });
    expect(body.storagePath).toMatch(/^content-media\/attraction\/\d{4}\/\d{2}\/12\/.+\.webp$/);

    const uploadArg = mocks.uploadPrivateFile.mock.calls[0][0] as {
      bucket: string;
      path: string;
      data: Buffer;
      contentType: string;
    };
    expect(uploadArg.bucket).toBe("visit-photos");
    expect(uploadArg.path).toMatch(/^content-media\/attraction\/\d{4}\/\d{2}\/12\/.+\.webp$/);
    expect(uploadArg.contentType).toBe("image/webp");
    expect(Buffer.isBuffer(uploadArg.data)).toBe(true);
    expect(uploadArg.data.length).toBeGreaterThan(0);

    expect(mocks.logAdminAction).toHaveBeenCalledWith(expect.objectContaining({
      adminId: "admin-1",
      action: "media.content_upload",
      entityType: "content_media",
      entityId: "attraction:12",
    }));
  });

  it("rejects invalid owner metadata before reading or uploading the image", async () => {
    const response = await POST(makeRequest({
      file: pngFile(),
      entityId: "12",
      entityType: "unknown",
    }));
    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mocks.uploadPrivateFile).not.toHaveBeenCalled();
    expect(mocks.logAdminAction).not.toHaveBeenCalled();
  });

  it("rejects invalid image bytes before storage upload", async () => {
    const response = await POST(makeRequest({
      file: new File([Buffer.from("not an image")], "fake.png", { type: "image/png" }),
      entityId: "12",
      entityType: "attraction",
    }));
    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(mocks.uploadPrivateFile).not.toHaveBeenCalled();
  });
});
