import { describe, expect, it } from "vitest";
import {
  parseAllowedTouristImageMimeTypes,
  validateTouristImageFile,
  getExtensionForTouristImageMimeType,
} from "@/lib/validation/upload";

describe("Upload validation", () => {
  describe("parseAllowedTouristImageMimeTypes", () => {
    it("parses valid comma-separated MIME types", () => {
      const result = parseAllowedTouristImageMimeTypes("image/jpeg,image/png,image/webp");
      expect(result).toEqual(["image/jpeg", "image/png", "image/webp"]);
    });

    it("ignores unknown MIME types", () => {
      const result = parseAllowedTouristImageMimeTypes("image/jpeg,image/gif,application/pdf");
      expect(result).toEqual(["image/jpeg"]);
    });

    it("handles empty string", () => {
      expect(parseAllowedTouristImageMimeTypes("")).toEqual([]);
    });

    it("trims whitespace", () => {
      const result = parseAllowedTouristImageMimeTypes(" image/jpeg , image/png ");
      expect(result).toEqual(["image/jpeg", "image/png"]);
    });
  });

  describe("getExtensionForTouristImageMimeType", () => {
    it("returns correct extension for known types", () => {
      expect(getExtensionForTouristImageMimeType("image/jpeg")).toBe("jpg");
      expect(getExtensionForTouristImageMimeType("image/png")).toBe("png");
      expect(getExtensionForTouristImageMimeType("image/webp")).toBe("webp");
    });

    it("returns null for unknown types", () => {
      expect(getExtensionForTouristImageMimeType("image/gif")).toBeNull();
      expect(getExtensionForTouristImageMimeType("application/pdf")).toBeNull();
    });
  });

  describe("validateTouristImageFile", () => {
    const allowedMimeTypes = parseAllowedTouristImageMimeTypes("image/jpeg,image/png,image/webp");

    it("rejects empty files", () => {
      const result = validateTouristImageFile({
        mimeType: "image/jpeg",
        sizeBytes: 0,
        allowedMimeTypes,
        maxSizeMb: 5,
      });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.code).toBe("PHOTO_EMPTY");
    });

    it("rejects disallowed MIME types", () => {
      const result = validateTouristImageFile({
        mimeType: "image/gif",
        sizeBytes: 1024,
        allowedMimeTypes,
        maxSizeMb: 5,
      });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.code).toBe("PHOTO_INVALID_TYPE");
    });

    it("rejects files that exceed size limit", () => {
      const result = validateTouristImageFile({
        mimeType: "image/jpeg",
        sizeBytes: 6 * 1024 * 1024, // 6MB
        allowedMimeTypes,
        maxSizeMb: 5,
      });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.code).toBe("PHOTO_TOO_LARGE");
    });

    it("accepts valid files within limits", () => {
      const result = validateTouristImageFile({
        mimeType: "image/png",
        sizeBytes: 2 * 1024 * 1024, // 2MB
        allowedMimeTypes,
        maxSizeMb: 5,
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.extension).toBe("png");
    });

    it("accepts files exactly at size limit", () => {
      const result = validateTouristImageFile({
        mimeType: "image/webp",
        sizeBytes: 5 * 1024 * 1024, // exactly 5MB
        allowedMimeTypes,
        maxSizeMb: 5,
      });
      expect(result.success).toBe(true);
    });
  });
});
