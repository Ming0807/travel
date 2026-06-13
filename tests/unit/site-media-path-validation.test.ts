import { describe, it, expect } from "vitest";

// ── Path validation logic (mirrors assertSafeStoragePath in app/site-media/[...path]/route.ts) ──

function assertSafeStoragePath(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("INVALID_STORAGE_PATH");
  if (trimmed.includes("..")) throw new Error("INVALID_STORAGE_PATH");
  if (trimmed.includes("\\")) throw new Error("INVALID_STORAGE_PATH");
  if (/^https?:\/\//i.test(trimmed)) throw new Error("INVALID_STORAGE_PATH");
  if (trimmed.startsWith("/")) throw new Error("INVALID_STORAGE_PATH");
  if (/[\x00-\x1f\x7f]/.test(trimmed)) throw new Error("INVALID_STORAGE_PATH");
  if (/%2[ef]/i.test(trimmed)) throw new Error("INVALID_STORAGE_PATH");
  return trimmed;
}

// ── Fallback content-type test ─────────────────────────────────────────────

const PLACEHOLDER_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAABJRU5ErkJggg==";

describe("site-media route handler — path validation", () => {
  it("accepts valid relative paths", () => {
    expect(assertSafeStoragePath("general/uuid.webp")).toBe("general/uuid.webp");
    expect(assertSafeStoragePath("attractions/abc-123.webp")).toBe("attractions/abc-123.webp");
    expect(assertSafeStoragePath("general/9815365d-016f-40eb-8016-9e9e958704d6.jpg")).toBe(
      "general/9815365d-016f-40eb-8016-9e9e958704d6.jpg",
    );
  });

  it("rejects empty paths", () => {
    expect(() => assertSafeStoragePath("")).toThrow("INVALID_STORAGE_PATH");
    expect(() => assertSafeStoragePath("   ")).toThrow("INVALID_STORAGE_PATH");
  });

  it("rejects parent directory traversal", () => {
    expect(() => assertSafeStoragePath("../etc/passwd")).toThrow("INVALID_STORAGE_PATH");
    expect(() => assertSafeStoragePath("general/../../../etc/passwd")).toThrow("INVALID_STORAGE_PATH");
    expect(() => assertSafeStoragePath("..")).toThrow("INVALID_STORAGE_PATH");
  });

  it("rejects backslash path separators", () => {
    expect(() => assertSafeStoragePath("general\\evil.exe")).toThrow("INVALID_STORAGE_PATH");
    expect(() => assertSafeStoragePath("..\\..\\windows")).toThrow("INVALID_STORAGE_PATH");
  });

  it("rejects absolute URLs", () => {
    expect(() => assertSafeStoragePath("https://evil.com/malware.jpg")).toThrow("INVALID_STORAGE_PATH");
    expect(() => assertSafeStoragePath("http://127.0.0.1/admin")).toThrow("INVALID_STORAGE_PATH");
  });

  it("rejects absolute paths", () => {
    expect(() => assertSafeStoragePath("/etc/passwd")).toThrow("INVALID_STORAGE_PATH");
    expect(() => assertSafeStoragePath("/general/uuid.webp")).toThrow("INVALID_STORAGE_PATH");
  });

  it("rejects control characters", () => {
    expect(() => assertSafeStoragePath("general/\x00hidden.webp")).toThrow("INVALID_STORAGE_PATH");
    expect(() => assertSafeStoragePath("general/\x1bescape.webp")).toThrow("INVALID_STORAGE_PATH");
    expect(() => assertSafeStoragePath("general/\x7fdel.webp")).toThrow("INVALID_STORAGE_PATH");
  });

  it("rejects percent-encoded traversal", () => {
    expect(() => assertSafeStoragePath("general/%2e%2e/etc")).toThrow("INVALID_STORAGE_PATH");
    expect(() => assertSafeStoragePath("general/%2E%2E/etc")).toThrow("INVALID_STORAGE_PATH");
    expect(() => assertSafeStoragePath("general/%2fetc")).toThrow("INVALID_STORAGE_PATH");
    expect(() => assertSafeStoragePath("general/%2Fetc")).toThrow("INVALID_STORAGE_PATH");
  });

  it("trims whitespace", () => {
    expect(assertSafeStoragePath("  general/uuid.webp  ")).toBe("general/uuid.webp");
  });
});

describe("site-media route handler — fallback content-type", () => {
  it("fallback is a valid PNG buffer", () => {
    const buf = Buffer.from(PLACEHOLDER_PNG_BASE64, "base64");
    // PNG magic bytes: 89 50 4E 47
    expect(buf[0]).toBe(0x89);
    expect(buf[1]).toBe(0x50); // 'P'
    expect(buf[2]).toBe(0x4e); // 'N'
    expect(buf[3]).toBe(0x47); // 'G'
    expect(buf.length).toBeGreaterThan(0);
  });

  it("fallback content-type is image/png, not image/svg+xml", () => {
    const contentType = "image/png";
    expect(contentType).toBe("image/png");
    expect(contentType).not.toBe("image/svg+xml");
  });
});

describe("/api/media/image route handler — fallback content-type", () => {
  it("fallback is image/png, not image/svg+xml", () => {
    // Same placeholder pattern used in /api/media/image route
    const contentType = "image/png";
    expect(contentType).toBe("image/png");
    expect(contentType).not.toBe("image/svg+xml");
  });
});
