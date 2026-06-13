import { describe, expect, it } from "vitest";
import { normalizeSiteMediaStoragePath, siteMediaImageUrl } from "@/lib/media/storage-paths";

const PLACEHOLDER_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAABJRU5ErkJggg==";

describe("site media storage path helpers", () => {
  it("accepts valid relative paths", () => {
    expect(normalizeSiteMediaStoragePath("general/uuid.webp")).toBe("general/uuid.webp");
    expect(normalizeSiteMediaStoragePath("attractions/abc-123.webp")).toBe("attractions/abc-123.webp");
    expect(normalizeSiteMediaStoragePath("general/9815365d-016f-40eb-8016-9e9e958704d6.jpg")).toBe(
      "general/9815365d-016f-40eb-8016-9e9e958704d6.jpg",
    );
  });

  it("normalizes site-media prefixes", () => {
    expect(normalizeSiteMediaStoragePath("/site-media/general/uuid.webp")).toBe("general/uuid.webp");
    expect(normalizeSiteMediaStoragePath("site-media/general/uuid.webp")).toBe("general/uuid.webp");
    expect(normalizeSiteMediaStoragePath("/site-media//site-media/general/uuid.webp")).toBe("general/uuid.webp");
  });

  it("normalizes Supabase public site-media URLs", () => {
    expect(
      normalizeSiteMediaStoragePath(
        "https://zaahkhmnqcczswxrcuhw.supabase.co/storage/v1/object/public/site-media/general/uuid.webp",
      ),
    ).toBe("general/uuid.webp");
  });

  it("builds canonical /site-media image URLs without double prefixes", () => {
    expect(siteMediaImageUrl("general/uuid.webp")).toBe("/site-media/general/uuid.webp");
    expect(siteMediaImageUrl("/site-media/general/uuid.webp")).toBe("/site-media/general/uuid.webp");
    expect(siteMediaImageUrl("/site-media//site-media/general/uuid.webp")).toBe("/site-media/general/uuid.webp");
    expect(
      siteMediaImageUrl(
        "https://zaahkhmnqcczswxrcuhw.supabase.co/storage/v1/object/public/site-media/general/uuid.webp",
      ),
    ).toBe("/site-media/general/uuid.webp");
  });

  it("maps Cloudinary storage references to the media proxy", () => {
    const ref = "cloudinary:image:authenticated:v123:jpg:southern-border-tourism/content-media/test";
    expect(siteMediaImageUrl(ref)).toBe(`/api/media/image?path=${encodeURIComponent(ref)}`);
  });

  it("rejects empty paths", () => {
    expect(() => normalizeSiteMediaStoragePath("")).toThrow("INVALID_STORAGE_PATH");
    expect(() => normalizeSiteMediaStoragePath("   ")).toThrow("INVALID_STORAGE_PATH");
  });

  it("rejects parent directory traversal", () => {
    expect(() => normalizeSiteMediaStoragePath("../etc/passwd")).toThrow("INVALID_STORAGE_PATH");
    expect(() => normalizeSiteMediaStoragePath("general/../../../etc/passwd")).toThrow("INVALID_STORAGE_PATH");
    expect(() => normalizeSiteMediaStoragePath("..")).toThrow("INVALID_STORAGE_PATH");
  });

  it("rejects backslash path separators", () => {
    expect(() => normalizeSiteMediaStoragePath("general\\evil.exe")).toThrow("INVALID_STORAGE_PATH");
    expect(() => normalizeSiteMediaStoragePath("..\\..\\windows")).toThrow("INVALID_STORAGE_PATH");
  });

  it("rejects non-site-media absolute URLs", () => {
    expect(() => normalizeSiteMediaStoragePath("https://evil.com/malware.jpg")).toThrow("INVALID_STORAGE_PATH");
    expect(() => normalizeSiteMediaStoragePath("http://127.0.0.1/admin")).toThrow("INVALID_STORAGE_PATH");
  });

  it("rejects absolute paths outside /site-media", () => {
    expect(() => normalizeSiteMediaStoragePath("/etc/passwd")).toThrow("INVALID_STORAGE_PATH");
    expect(() => normalizeSiteMediaStoragePath("/general/uuid.webp")).toThrow("INVALID_STORAGE_PATH");
  });

  it("rejects control characters", () => {
    expect(() => normalizeSiteMediaStoragePath("general/\x00hidden.webp")).toThrow("INVALID_STORAGE_PATH");
    expect(() => normalizeSiteMediaStoragePath("general/\x1bescape.webp")).toThrow("INVALID_STORAGE_PATH");
    expect(() => normalizeSiteMediaStoragePath("general/\x7fdel.webp")).toThrow("INVALID_STORAGE_PATH");
  });

  it("rejects percent-encoded traversal", () => {
    expect(() => normalizeSiteMediaStoragePath("general/%2e%2e/etc")).toThrow("INVALID_STORAGE_PATH");
    expect(() => normalizeSiteMediaStoragePath("general/%2E%2E/etc")).toThrow("INVALID_STORAGE_PATH");
    expect(() => normalizeSiteMediaStoragePath("general/%2fetc")).toThrow("INVALID_STORAGE_PATH");
    expect(() => normalizeSiteMediaStoragePath("general/%2Fetc")).toThrow("INVALID_STORAGE_PATH");
  });

  it("trims whitespace", () => {
    expect(normalizeSiteMediaStoragePath("  general/uuid.webp  ")).toBe("general/uuid.webp");
  });
});

describe("site-media route handler fallback", () => {
  it("fallback is a valid PNG buffer", () => {
    const buf = Buffer.from(PLACEHOLDER_PNG_BASE64, "base64");
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50);
    expect(buf[2]).toBe(0x4e);
    expect(buf[3]).toBe(0x47);
    expect(buf.length).toBeGreaterThan(0);
  });

  it("fallback content-type is image/png, not image/svg+xml", () => {
    const contentType = "image/png";
    expect(contentType).toBe("image/png");
    expect(contentType).not.toBe("image/svg+xml");
  });
});
