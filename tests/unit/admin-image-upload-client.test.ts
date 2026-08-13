import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prepareVisitPhotoForUpload: vi.fn(),
}));

vi.mock("@/lib/media/client-photo-compression", () => ({
  prepareVisitPhotoForUpload: mocks.prepareVisitPhotoForUpload,
}));

import {
  ADMIN_IMAGE_MAX_SOURCE_BYTES,
  ADMIN_IMAGE_UPLOAD_TARGET_BYTES,
  uploadAdminImage,
  validateAdminImageSource,
} from "@/lib/media/admin-image-upload-client";

describe("admin image upload client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("accepts a phone JPEG up to 10MB and keeps the function payload target below 4.5MB", () => {
    const phonePhoto = new File([new Uint8Array(8 * 1024 * 1024)], "camera.jpg", {
      type: "image/jpeg",
    });

    expect(ADMIN_IMAGE_MAX_SOURCE_BYTES).toBe(10 * 1024 * 1024);
    expect(ADMIN_IMAGE_UPLOAD_TARGET_BYTES).toBeLessThan(4.5 * 1024 * 1024);
    expect(validateAdminImageSource(phonePhoto)).toBeNull();
  });

  it("rejects unsupported and oversized source files before fetch", () => {
    expect(validateAdminImageSource(new File(["svg"], "image.svg", { type: "image/svg+xml" }))).toMatch(/JPG/);
    expect(validateAdminImageSource(new File(
      [new Uint8Array(ADMIN_IMAGE_MAX_SOURCE_BYTES + 1)],
      "large.jpg",
      { type: "image/jpeg" },
    ))).toMatch(/10MB/);
  });

  it("compresses before posting and preserves the original display filename", async () => {
    const source = new File(["source"], "hotel-cover.jpg", { type: "image/jpeg" });
    const prepared = new File(["webp"], "visit-photo.webp", { type: "image/webp" });
    mocks.prepareVisitPhotoForUpload.mockResolvedValue({
      file: prepared,
      originalBytes: source.size,
      uploadBytes: prepared.size,
    });
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await uploadAdminImage<{ success: boolean }>({
      endpoint: "/api/admin/media/upload",
      file: source,
      fields: { entityId: "12", entityType: "attraction" },
    });

    const requestBody = fetchMock.mock.calls[0]?.[1]?.body as FormData;
    expect(requestBody.get("file")).toBeInstanceOf(File);
    expect((requestBody.get("file") as File).name).toBe("hotel-cover.webp");
    expect(requestBody.get("entityId")).toBe("12");
    expect(result.data.success).toBe(true);
  });

  it("reports Vercel 413 accurately instead of blaming the connection", async () => {
    const source = new File(["source"], "camera.jpg", { type: "image/jpeg" });
    mocks.prepareVisitPhotoForUpload.mockResolvedValue({
      file: new File(["webp"], "visit-photo.webp", { type: "image/webp" }),
      originalBytes: source.size,
      uploadBytes: 4,
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Payload too large", { status: 413 })));

    await expect(uploadAdminImage({
      endpoint: "/api/admin/media/upload",
      file: source,
    })).rejects.toThrow(/ใหญ่เกินขีดจำกัดการส่ง/);
  });

  it("uses the connection message only when fetch itself fails", async () => {
    const source = new File(["source"], "camera.jpg", { type: "image/jpeg" });
    mocks.prepareVisitPhotoForUpload.mockResolvedValue({
      file: new File(["webp"], "visit-photo.webp", { type: "image/webp" }),
      originalBytes: source.size,
      uploadBytes: 4,
    });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(uploadAdminImage({
      endpoint: "/api/admin/media/upload",
      file: source,
    })).rejects.toThrow(/ตรวจอินเทอร์เน็ต/);
  });
});
