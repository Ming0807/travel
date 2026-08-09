import { describe, expect, it } from "vitest";
import {
  preferredLanguageSchema,
  preferredLanguageSourceSchema,
  detectPreferredLanguage,
} from "@/lib/validation/language";

describe("preferred language contract", () => {
  it("detects only supported request languages without a Thai fallback", () => {
    expect(detectPreferredLanguage("en-US,en;q=0.9")).toBe("en");
    expect(detectPreferredLanguage("ms-MY,th;q=0.8")).toBe("ms");
    expect(detectPreferredLanguage("fr-FR,ja;q=0.8")).toBeNull();
    expect(detectPreferredLanguage(null)).toBeNull();
  });

  it("honors quality weights and ignores disabled or malformed preferences", () => {
    expect(detectPreferredLanguage("en;q=0.2, th-TH;q=0.9")).toBe("th");
    expect(detectPreferredLanguage("ms;q=0, en;q=0.8")).toBe("en");
    expect(detectPreferredLanguage("th;q=broken, en;q=0.7")).toBe("en");
  });

  it("accepts only controlled language and provenance values", () => {
    expect(preferredLanguageSchema.parse("th")).toBe("th");
    expect(preferredLanguageSchema.parse(null)).toBeNull();
    expect(preferredLanguageSourceSchema.parse("detected")).toBe("detected");
    expect(preferredLanguageSourceSchema.parse("selected")).toBe("selected");
    expect(() => preferredLanguageSchema.parse("fr")).toThrow();
    expect(() => preferredLanguageSourceSchema.parse("browser")).toThrow();
  });
});
