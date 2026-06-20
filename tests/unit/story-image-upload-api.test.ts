import { describe, expect, it, beforeEach, vi } from "vitest";
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

  const storageUpload = vi.fn();

  return {
    getUser: vi.fn(),
    resolveCurrentTouristId: vi.fn(),
    rateLimit: vi.fn(),
    storageFrom: vi.fn(() => ({ upload: storageUpload })),
    storageUpload,
    TouristAccessError: MockTouristAccessError,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: {
      getUser: mocks.getUser,
    },
  })),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn(() => ({
    storage: {
      from: mocks.storageFrom,
    },
  })),
}));

vi.mock("@/lib/auth/guards", () => ({
  resolveCurrentTouristId: () => mocks.resolveCurrentTouristId(),
  TouristAccessError: mocks.TouristAccessError,
}));

vi.mock("@/lib/config/server-env", () => ({
  getServerEnv: () => ({
    MAX_UPLOAD_IMAGE_SIZE_MB: 5,
    ALLOWED_TOURIST_IMAGE_MIME_TYPES: "image/jpeg,image/png,image/webp",
  }),
}));

vi.mock("@/lib/utils/rate-limit", () => ({
  rateLimit: (...args: unknown[]) => mocks.rateLimit(...args),
}));

import { POST } from "@/app/api/upload/route";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);

function makeRequest(file?: File, headers?: HeadersInit): NextRequest {
  const formData = new FormData();
  if (file) formData.set("file", file);

  return {
    headers: new Headers(headers),
    nextUrl: new URL("http://localhost:3000/api/upload"),
    formData: async () => formData,
  } as unknown as NextRequest;
}

function pngFile() {
  return new File([onePixelPng], "story.png", { type: "image/png" });
}

async function readJson(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

describe("POST /api/upload — tourist story image upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimit.mockReturnValue({ success: true, remaining: 7 });
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "auth-user-1" } },
      error: null,
    });
    mocks.resolveCurrentTouristId.mockResolvedValue("tourist-1");
    mocks.storageUpload.mockImplementation(async (path: string) => ({
      data: { path },
      error: null,
    }));
  });

  it("rejects requests when the user is not signed in", async () => {
    mocks.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const response = await POST(makeRequest(pngFile()));
    const body = await readJson(response);

    expect(response.status).toBe(401);
    expect(body.code).toBe("UNAUTHORIZED");
    expect(mocks.resolveCurrentTouristId).not.toHaveBeenCalled();
    expect(mocks.storageUpload).not.toHaveBeenCalled();
  });

  it("rejects signed-in users without a tourist identity", async () => {
    mocks.resolveCurrentTouristId.mockRejectedValueOnce(
      new mocks.TouristAccessError("TOURIST_IDENTITY_NOT_FOUND", "not found"),
    );

    const response = await POST(makeRequest(pngFile()));
    const body = await readJson(response);

    expect(response.status).toBe(403);
    expect(body.code).toBe("TOURIST_IDENTITY_NOT_FOUND");
    expect(mocks.storageUpload).not.toHaveBeenCalled();
  });

  it("rate limits uploads before auth and storage work", async () => {
    mocks.rateLimit.mockReturnValueOnce({ success: false, remaining: 0 });

    const response = await POST(makeRequest(pngFile()));
    const body = await readJson(response);

    expect(response.status).toBe(429);
    expect(body.code).toBe("RATE_LIMITED");
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.storageUpload).not.toHaveBeenCalled();
  });

  it("rejects cross-origin browser uploads", async () => {
    const response = await POST(makeRequest(pngFile(), { origin: "https://evil.example" }));
    const body = await readJson(response);

    expect(response.status).toBe(403);
    expect(body.code).toBe("INVALID_ORIGIN");
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.storageUpload).not.toHaveBeenCalled();
  });

  it("rejects requests without a file", async () => {
    const response = await POST(makeRequest());
    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(body.code).toBe("PHOTO_REQUIRED");
    expect(mocks.storageUpload).not.toHaveBeenCalled();
  });

  it("rejects unsupported MIME types", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "story.gif", { type: "image/gif" });

    const response = await POST(makeRequest(file));
    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(body.code).toBe("PHOTO_INVALID_TYPE");
    expect(mocks.storageUpload).not.toHaveBeenCalled();
  });

  it("rejects files over the configured size limit", async () => {
    const file = new File([new Uint8Array(6 * 1024 * 1024)], "large.jpg", { type: "image/jpeg" });

    const response = await POST(makeRequest(file));
    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(body.code).toBe("PHOTO_TOO_LARGE");
    expect(mocks.storageUpload).not.toHaveBeenCalled();
  });

  it("rejects invalid image bytes even when the MIME type looks valid", async () => {
    const file = new File([new Uint8Array([1, 2, 3, 4])], "broken.png", { type: "image/png" });

    const response = await POST(makeRequest(file));
    const body = await readJson(response);

    expect(response.status).toBe(400);
    expect(body.code).toBe("PHOTO_INVALID_IMAGE");
    expect(mocks.storageUpload).not.toHaveBeenCalled();
  });

  it("stores a valid image as a WebP story image and returns a canonical site-media URL", async () => {
    const response = await POST(makeRequest(pngFile()));
    const body = await readJson(response);

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ success: true });
    expect(body.url).toMatch(/^\/site-media\/tourist-stories\/\d{4}\/\d{2}\/.+\.webp$/);

    expect(mocks.storageFrom).toHaveBeenCalledWith("site-media");
    const [path, fileBuffer, options] = mocks.storageUpload.mock.calls[0];
    expect(path).toMatch(/^tourist-stories\/\d{4}\/\d{2}\/.+\.webp$/);
    expect(Buffer.isBuffer(fileBuffer)).toBe(true);
    expect(fileBuffer.length).toBeGreaterThan(0);
    expect(options).toEqual({ contentType: "image/webp", upsert: false });
  });
});
