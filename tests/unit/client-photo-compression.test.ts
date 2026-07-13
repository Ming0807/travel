import { describe, expect, it } from "vitest";
import {
  VISIT_PHOTO_MAX_SOURCE_BYTES,
  VISIT_PHOTO_UPLOAD_TARGET_BYTES,
  assertPreparedVisitPhoto,
  validateVisitPhotoSource,
} from "@/lib/media/client-photo-compression";

describe("client visit photo compression policy", () => {
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
});
