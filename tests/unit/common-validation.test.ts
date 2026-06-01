import { describe, it, expect } from "vitest";
import {
  localeSchema,
  checkinCodeSchema,
  displayNameSchema,
  uuidSchema,
} from "@/lib/validation/common";

// ---------------------------------------------------------------------------
// localeSchema
// ---------------------------------------------------------------------------
describe("localeSchema", () => {
  it("accepts 'th'", () => {
    expect(localeSchema.parse("th")).toBe("th");
  });

  it("accepts 'en'", () => {
    expect(localeSchema.parse("en")).toBe("en");
  });

  it("defaults to 'th' when omitted", () => {
    const result = localeSchema.parse(undefined);
    expect(result).toBe("th");
  });

  it("rejects invalid locale", () => {
    expect(() => localeSchema.parse("fr")).toThrow();
    expect(() => localeSchema.parse("")).toThrow();
    expect(() => localeSchema.parse("TH")).toThrow();
  });
});

// ---------------------------------------------------------------------------
// checkinCodeSchema
// ---------------------------------------------------------------------------
describe("checkinCodeSchema", () => {
  it("accepts valid URL-safe codes", () => {
    expect(checkinCodeSchema.parse("abc123")).toBe("abc123");
    expect(checkinCodeSchema.parse("ABC-DEF_123")).toBe("ABC-DEF_123");
    expect(checkinCodeSchema.parse("abc")).toBe("abc");
    expect(checkinCodeSchema.parse("a".repeat(64))).toHaveLength(64);
  });

  it("trims whitespace", () => {
    expect(checkinCodeSchema.parse("  hello-world  ")).toBe("hello-world");
  });

  it("rejects codes shorter than 3 characters", () => {
    expect(() => checkinCodeSchema.parse("ab")).toThrow();
    expect(() => checkinCodeSchema.parse("")).toThrow();
    expect(() => checkinCodeSchema.parse("  a  ")).toThrow();
  });

  it("rejects codes longer than 64 characters", () => {
    expect(() => checkinCodeSchema.parse("a".repeat(65))).toThrow();
  });

  it("rejects codes with unsafe characters", () => {
    expect(() => checkinCodeSchema.parse("hello world")).toThrow();
    expect(() => checkinCodeSchema.parse("hello.world")).toThrow();
    expect(() => checkinCodeSchema.parse("hello/world")).toThrow();
    expect(() => checkinCodeSchema.parse("hello?world")).toThrow();
    expect(() => checkinCodeSchema.parse("hello&world")).toThrow();
    expect(() => checkinCodeSchema.parse("hello%world")).toThrow();
    expect(() => checkinCodeSchema.parse("hello#world")).toThrow();
  });

  it("rejects null / undefined", () => {
    expect(() => checkinCodeSchema.parse(null)).toThrow();
    expect(() => checkinCodeSchema.parse(undefined)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// displayNameSchema
// ---------------------------------------------------------------------------
describe("displayNameSchema", () => {
  it("accepts valid display names", () => {
    expect(displayNameSchema.parse("สมชาย ใจดี")).toBe("สมชาย ใจดี");
    expect(displayNameSchema.parse("John")).toBe("John");
    expect(displayNameSchema.parse("A")).toBe("A");
  });

  it("trims whitespace", () => {
    expect(displayNameSchema.parse("  John  ")).toBe("John");
  });

  it("rejects empty string after trim", () => {
    expect(() => displayNameSchema.parse("")).toThrow();
    expect(() => displayNameSchema.parse("   ")).toThrow();
  });

  it("rejects names longer than 150 characters", () => {
    expect(() => displayNameSchema.parse("a".repeat(151))).toThrow();
  });

  it("accepts name of exactly 150 characters", () => {
    expect(displayNameSchema.parse("a".repeat(150))).toHaveLength(150);
  });

  it("rejects null / undefined", () => {
    expect(() => displayNameSchema.parse(null)).toThrow();
    expect(() => displayNameSchema.parse(undefined)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// uuidSchema
// ---------------------------------------------------------------------------
describe("uuidSchema", () => {
  it("accepts valid UUID v4", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    expect(uuidSchema.parse(uuid)).toBe(uuid);
  });

  it("accepts valid UUID v1", () => {
    const uuid = "c6c6b7b0-8b3b-11ec-a8a3-0242ac120002";
    expect(uuidSchema.parse(uuid)).toBe(uuid);
  });

  it("rejects non-UUID strings", () => {
    expect(() => uuidSchema.parse("not-a-uuid")).toThrow();
    expect(() => uuidSchema.parse("")).toThrow();
    expect(() => uuidSchema.parse("550e8400-e29b-41d4-a716-44665544000Z")).toThrow();
  });

  it("rejects null / undefined", () => {
    expect(() => uuidSchema.parse(null)).toThrow();
    expect(() => uuidSchema.parse(undefined)).toThrow();
  });
});
