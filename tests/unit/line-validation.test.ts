import { describe, it, expect } from "vitest";
import {
  lineLinkRequestSchema,
  lineVerifyRequestSchema,
} from "@/lib/validation/line";

// ---------------------------------------------------------------------------
// lineLinkRequestSchema
// ---------------------------------------------------------------------------
describe("lineLinkRequestSchema", () => {
  const validPayload = {
    idToken: "valid.idtoken.here_1234567890",
    hasConsented: true as const,
    language: "th" as const,
  };

  it("accepts a valid link request with Thai language", () => {
    const result = lineLinkRequestSchema.parse(validPayload);
    expect(result.idToken).toBe(validPayload.idToken);
    expect(result.hasConsented).toBe(true);
    expect(result.language).toBe("th");
  });

  it("accepts English language", () => {
    const result = lineLinkRequestSchema.parse({
      ...validPayload,
      language: "en",
    });
    expect(result.language).toBe("en");
  });

  it("defaults language to 'th' when omitted", () => {
    const { language, ...rest } = validPayload;
    const result = lineLinkRequestSchema.parse(rest);
    expect(result.language).toBe("th");
  });

  it("rejects empty idToken", () => {
    expect(() =>
      lineLinkRequestSchema.parse({ ...validPayload, idToken: "" })
    ).toThrow();
  });

  it("rejects idToken shorter than 20 characters", () => {
    expect(() =>
      lineLinkRequestSchema.parse({ ...validPayload, idToken: "short" })
    ).toThrow();
  });

  it("rejects idToken longer than 8192 characters", () => {
    expect(() =>
      lineLinkRequestSchema.parse({
        ...validPayload,
        idToken: "x".repeat(8193),
      })
    ).toThrow();
  });

  it("rejects hasConsented = false", () => {
    expect(() =>
      lineLinkRequestSchema.parse({ ...validPayload, hasConsented: false })
    ).toThrow();
  });

  it("rejects hasConsented = undefined", () => {
    const { hasConsented, ...rest } = validPayload;
    expect(() => lineLinkRequestSchema.parse(rest)).toThrow();
  });

  it("rejects invalid language value", () => {
    expect(() =>
      lineLinkRequestSchema.parse({ ...validPayload, language: "fr" })
    ).toThrow();
  });

  it("rejects null / undefined payload", () => {
    expect(() => lineLinkRequestSchema.parse(null)).toThrow();
    expect(() => lineLinkRequestSchema.parse(undefined)).toThrow();
  });

  it("rejects empty object", () => {
    expect(() => lineLinkRequestSchema.parse({})).toThrow();
  });
});

// ---------------------------------------------------------------------------
// lineVerifyRequestSchema
// ---------------------------------------------------------------------------
describe("lineVerifyRequestSchema", () => {
  it("accepts a valid verify request", () => {
    const payload = { idToken: "valid.idtoken.here_1234567890" };
    const result = lineVerifyRequestSchema.parse(payload);
    expect(result.idToken).toBe(payload.idToken);
  });

  it("rejects empty idToken", () => {
    expect(() => lineVerifyRequestSchema.parse({ idToken: "" })).toThrow();
  });

  it("rejects idToken shorter than 20 characters", () => {
    expect(() =>
      lineVerifyRequestSchema.parse({ idToken: "short" })
    ).toThrow();
  });

  it("rejects idToken longer than 8192 characters", () => {
    expect(() =>
      lineVerifyRequestSchema.parse({ idToken: "x".repeat(8193) })
    ).toThrow();
  });

  it("rejects missing idToken", () => {
    expect(() => lineVerifyRequestSchema.parse({})).toThrow();
  });

  it("rejects null / undefined payload", () => {
    expect(() => lineVerifyRequestSchema.parse(null)).toThrow();
    expect(() => lineVerifyRequestSchema.parse(undefined)).toThrow();
  });
});
