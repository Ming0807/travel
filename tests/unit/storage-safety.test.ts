import { describe, expect, it } from "vitest";
import { assertSafeStoragePath, encodeCloudinaryReference, parseCloudinaryReference } from "./storage-helpers";

// Export helpers for testing (we'll test the private functions via their public effects)
// Since private-files.ts uses "server-only", we test the core logic separately

describe("Storage path safety", () => {
  it("rejects empty paths", () => {
    expect(() => assertSafeStoragePath("")).toThrow("INVALID_STORAGE_PATH");
    expect(() => assertSafeStoragePath("  ")).toThrow("INVALID_STORAGE_PATH");
  });

  it("rejects path traversal", () => {
    expect(() => assertSafeStoragePath("../etc/passwd")).toThrow("INVALID_STORAGE_PATH");
    expect(() => assertSafeStoragePath("folder/../secret")).toThrow("INVALID_STORAGE_PATH");
  });

  it("rejects absolute paths", () => {
    expect(() => assertSafeStoragePath("/etc/passwd")).toThrow("INVALID_STORAGE_PATH");
  });

  it("rejects URLs", () => {
    expect(() => assertSafeStoragePath("https://evil.com/shell")).toThrow("INVALID_STORAGE_PATH");
    expect(() => assertSafeStoragePath("http://localhost/path")).toThrow("INVALID_STORAGE_PATH");
  });

  it("accepts valid relative paths", () => {
    expect(assertSafeStoragePath("visit-photos/2026/05/abc/file.jpg")).toBe("visit-photos/2026/05/abc/file.jpg");
    expect(assertSafeStoragePath("certificates/2026/05/abc/cert.png")).toBe("certificates/2026/05/abc/cert.png");
  });
});

describe("Cloudinary reference encoding/decoding", () => {
  const reference = {
    resourceType: "image" as const,
    deliveryType: "authenticated" as const,
    version: 1234567890,
    format: "png",
    publicId: "southern-border-tourism/certificates/2026/05/abc/cert",
  };

  it("encodes references into a deterministic string", () => {
    const encoded = encodeCloudinaryReference(reference);
    expect(encoded).toBe("cloudinary:image:authenticated:v1234567890:png:southern-border-tourism/certificates/2026/05/abc/cert");
  });

  it("parses encoded references back", () => {
    const encoded = encodeCloudinaryReference(reference);
    const parsed = parseCloudinaryReference(encoded);
    expect(parsed).not.toBeNull();
    expect(parsed?.resourceType).toBe("image");
    expect(parsed?.deliveryType).toBe("authenticated");
    expect(parsed?.version).toBe(1234567890);
    expect(parsed?.format).toBe("png");
    expect(parsed?.publicId).toBe("southern-border-tourism/certificates/2026/05/abc/cert");
  });

  it("returns null for non-cloudinary strings", () => {
    expect(parseCloudinaryReference("visit-photos/2026/05/file.jpg")).toBeNull();
    expect(parseCloudinaryReference("https://example.com/image.jpg")).toBeNull();
  });

  it("throws for malformed cloudinary references", () => {
    expect(() => parseCloudinaryReference("cloudinary:invalid")).toThrow("INVALID_CLOUDINARY_REFERENCE");
  });
});
