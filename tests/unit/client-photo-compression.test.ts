import { afterEach, describe, expect, it, vi } from "vitest";
import {
  VISIT_PHOTO_MAX_SOURCE_BYTES,
  VISIT_PHOTO_UPLOAD_TARGET_BYTES,
  assertPreparedVisitPhoto,
  prepareVisitPhotoForUpload,
  validateVisitPhotoSource,
} from "@/lib/media/client-photo-compression";

describe("client visit photo compression policy", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("accepts modern phone photos up to 50 MB before client compression", () => {
    expect(VISIT_PHOTO_MAX_SOURCE_BYTES).toBe(50 * 1024 * 1024);
    expect(validateVisitPhotoSource(new File([new Uint8Array(5)], "camera.jpg", { type: "image/jpeg" }))).toBeNull();
  });

  it("rejects unsupported and excessively large source photos before decoding", () => {
    expect(validateVisitPhotoSource(new File(["unsafe"], "photo.svg", { type: "image/svg+xml" }))).toMatch(/JPG, PNG/);

    const oversized = new File(
      [new Uint8Array(VISIT_PHOTO_MAX_SOURCE_BYTES + 1)],
      "huge.jpg",
      { type: "image/jpeg" },
    );
    expect(validateVisitPhotoSource(oversized)).toMatch(/50MB/);
  });

  it("keeps prepared uploads below the Vercel request safety target", () => {
    expect(VISIT_PHOTO_UPLOAD_TARGET_BYTES).toBeLessThan(4.5 * 1024 * 1024);

    const safe = new File(
      [new Uint8Array(VISIT_PHOTO_UPLOAD_TARGET_BYTES)],
      "prepared.webp",
      { type: "image/webp" },
    );
    expect(() => assertPreparedVisitPhoto(safe)).not.toThrow();

    const unsafe = new File(
      [new Uint8Array(VISIT_PHOTO_UPLOAD_TARGET_BYTES + 1)],
      "prepared.webp",
      { type: "image/webp" },
    );
    expect(() => assertPreparedVisitPhoto(unsafe)).toThrow(/ใหญ่เกิน/);
  });

  it("falls back to JPEG when WebKit returns PNG for an unsupported WebP canvas export", async () => {
    const close = vi.fn();
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({
      width: 4032,
      height: 3024,
      close,
    }));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback, type) => {
      callback(new Blob([type === "image/webp" ? "png-fallback" : "jpeg"], {
        type: type === "image/webp" ? "image/png" : "image/jpeg",
      }));
    });

    const result = await prepareVisitPhotoForUpload(
      new File(["iphone-photo"], "IMG_1001.HEIC", { type: "image/heic" }),
    );

    expect(result.file.type).toBe("image/jpeg");
    expect(result.file.name).toBe("visit-photo.jpg");
    expect(result.uploadBytes).toBeLessThanOrEqual(VISIT_PHOTO_UPLOAD_TARGET_BYTES);
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenNthCalledWith(
      1,
      expect.any(Function),
      "image/webp",
      0.82,
    );
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenNthCalledWith(
      2,
      expect.any(Function),
      "image/jpeg",
      0.82,
    );
    expect(close).toHaveBeenCalledOnce();
  });
});
