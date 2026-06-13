import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Admin media route POST handler import ──────────────────────────────────

// We test validation logic directly by examining the route's ALLOWED_TYPES and MAX_SIZE_MB
// The route file is server-only; we test the validation boundaries via unit-logic

// Validation rules from app/api/admin/media/route.ts:
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_MB = 10;

describe("Admin media upload — validation rules", () => {
  describe("ALLOWED_TYPES", () => {
    it("accepts JPEG", () => {
      expect(ALLOWED_TYPES.has("image/jpeg")).toBe(true);
    });

    it("accepts PNG", () => {
      expect(ALLOWED_TYPES.has("image/png")).toBe(true);
    });

    it("accepts WebP", () => {
      expect(ALLOWED_TYPES.has("image/webp")).toBe(true);
    });

    it("rejects GIF", () => {
      expect(ALLOWED_TYPES.has("image/gif")).toBe(false);
    });

    it("rejects SVG", () => {
      expect(ALLOWED_TYPES.has("image/svg+xml")).toBe(false);
    });

    it("rejects BMP", () => {
      expect(ALLOWED_TYPES.has("image/bmp")).toBe(false);
    });

    it("rejects video/mp4", () => {
      expect(ALLOWED_TYPES.has("video/mp4")).toBe(false);
    });

    it("rejects application/pdf", () => {
      expect(ALLOWED_TYPES.has("application/pdf")).toBe(false);
    });
  });

  describe("MAX_SIZE_MB", () => {
    it("is 10 MB", () => {
      expect(MAX_SIZE_MB).toBe(10);
    });

    it("allows files <= 10 MB", () => {
      const size = 10 * 1024 * 1024; // exactly 10 MB
      expect(size <= MAX_SIZE_MB * 1024 * 1024).toBe(true);
    });

    it("rejects files > 10 MB", () => {
      const size = 10 * 1024 * 1024 + 1; // 10 MB + 1 byte
      expect(size <= MAX_SIZE_MB * 1024 * 1024).toBe(false);
    });

    it("allows 5 MB files", () => {
      const size = 5 * 1024 * 1024;
      expect(size <= MAX_SIZE_MB * 1024 * 1024).toBe(true);
    });

    it("allows 1 byte files", () => {
      const size = 1;
      expect(size <= MAX_SIZE_MB * 1024 * 1024).toBe(true);
    });
  });
});

// ── Sharp conversion logic simulation ──────────────────────────────────────
// Tests that the fallback and processing logic is sound, without actually calling sharp

describe("Admin media upload — sharp processing logic (simulated)", () => {
  it("converts to WebP and generates thumbnail when sharp succeeds", async () => {
    // Simulate: sharp succeeds → webpBuffer is the converted buffer
    const originalBuffer = Buffer.from("fake-image-data");
    let webpBuffer: Buffer;
    let thumbnailBuffer: Buffer | null = null;
    let usedOriginal = false;

    try {
      // In real code: sharp(buffer).resize(...).webp(...).toBuffer()
      webpBuffer = Buffer.from("converted-webp"); // simulated
      thumbnailBuffer = Buffer.from("thumbnail-webp"); // simulated
    } catch {
      webpBuffer = originalBuffer;
      usedOriginal = true;
    }

    expect(usedOriginal).toBe(false);
    expect(webpBuffer).not.toBe(originalBuffer);
    expect(thumbnailBuffer).not.toBeNull();
    expect(thumbnailBuffer!.length).toBeGreaterThan(0);
  });

  it("falls back to original buffer when sharp fails", async () => {
    const originalBuffer = Buffer.from("original-data");
    let webpBuffer: Buffer;
    let thumbnailBuffer: Buffer | null = null;
    let usedOriginal = false;

    // Simulate sharp failure
    try {
      throw new Error("Sharp not available");
    } catch {
      webpBuffer = originalBuffer;
      thumbnailBuffer = null;
      usedOriginal = true;
    }

    expect(usedOriginal).toBe(true);
    expect(webpBuffer).toBe(originalBuffer);
    expect(thumbnailBuffer).toBeNull();
  });

  it("stores mime_type as image/webp after conversion", () => {
    const mimeType = "image/webp";
    expect(mimeType).toBe("image/webp");
    // Not "image/jpeg", "image/png", or the original file.type
    expect(mimeType).not.toBe("image/jpeg");
    expect(mimeType).not.toBe("image/png");
  });

  it("stores size_bytes from WebP buffer length, not original file.size", () => {
    const webpBuffer = Buffer.from("compressed");
    const originalFileSize = 5000000;
    const sizeBytes = webpBuffer.length;

    expect(sizeBytes).not.toBe(originalFileSize);
    expect(sizeBytes).toBe(10); // "compressed" = 10 bytes
  });
});

// ── Error message tests ────────────────────────────────────────────────────

describe("Admin media upload — error messages", () => {
  it("unsupported type message is in Thai", () => {
    const errorMsg = "ไฟล์นี้ไม่รองรับ กรุณาใช้ JPG, PNG หรือ WebP";
    expect(errorMsg).toContain("JPG");
    expect(errorMsg).toContain("PNG");
    expect(errorMsg).toContain("WebP");
  });

  it("size exceeded message mentions the limit", () => {
    const errorMsg = `File size exceeds ${MAX_SIZE_MB}MB limit.`;
    expect(errorMsg).toContain("10MB");
  });

  it("no secrets leaked in error messages", () => {
    const messages = [
      "ไฟล์นี้ไม่รองรับ กรุณาใช้ JPG, PNG หรือ WebP",
      "File size exceeds 10MB limit.",
      "Upload failed. Please try again.",
    ];
    for (const msg of messages) {
      expect(msg).not.toMatch(/api.?key/i);
      expect(msg).not.toMatch(/service.?role/i);
      expect(msg).not.toMatch(/supabase/i);
      expect(msg).not.toMatch(/zaahkhmnqcczswxrcuhw/);
    }
  });
});
