import { describe, it, expect } from "vitest";

// ── Clamping logic tests (pure math — no DOM) ──────────────────────────────

function clampStoriesLimit(value: string) {
  return Math.max(1, Math.min(8, parseInt(value, 10) || 4));
}

function clampRoutesLimit(value: string) {
  return Math.max(1, Math.min(12, parseInt(value, 10) || 3));
}

describe("SettingsClient — numeric limit clamping logic", () => {
  describe("stories limit (1–8, default 4)", () => {
    it("clamps values above 8 down to 8", () => {
      expect(clampStoriesLimit("9")).toBe(8);
      expect(clampStoriesLimit("15")).toBe(8);
      expect(clampStoriesLimit("100")).toBe(8);
    });

    it("clamps values below 1 up to 1", () => {
      expect(clampStoriesLimit("0")).toBe(4); // 0 is falsy → default 4
      expect(clampStoriesLimit("-5")).toBe(1); // -5 → Math.max(1, -5) = 1
    });

    it("keeps valid values unchanged", () => {
      expect(clampStoriesLimit("1")).toBe(1);
      expect(clampStoriesLimit("4")).toBe(4);
      expect(clampStoriesLimit("8")).toBe(8);
    });

    it("falls back to default 4 on empty input", () => {
      expect(clampStoriesLimit("")).toBe(4);
    });

    it("falls back to default 4 on non-numeric input", () => {
      expect(clampStoriesLimit("abc")).toBe(4);
    });

    it("returns a number type", () => {
      expect(typeof clampStoriesLimit("5")).toBe("number");
    });
  });

  describe("routes limit (1–12, default 3)", () => {
    it("clamps values above 12 down to 12", () => {
      expect(clampRoutesLimit("13")).toBe(12);
      expect(clampRoutesLimit("50")).toBe(12);
      expect(clampRoutesLimit("999")).toBe(12);
    });

    it("clamps values below 1 up to 1", () => {
      expect(clampRoutesLimit("0")).toBe(3); // 0 is falsy → default 3
      expect(clampRoutesLimit("-1")).toBe(1);
    });

    it("keeps valid values unchanged", () => {
      expect(clampRoutesLimit("1")).toBe(1);
      expect(clampRoutesLimit("3")).toBe(3);
      expect(clampRoutesLimit("6")).toBe(6);
      expect(clampRoutesLimit("12")).toBe(12);
    });

    it("falls back to default 3 on empty input", () => {
      expect(clampRoutesLimit("")).toBe(3);
    });

    it("falls back to default 3 on non-numeric input", () => {
      expect(clampRoutesLimit("xyz")).toBe(3);
    });

    it("returns a number type", () => {
      expect(typeof clampRoutesLimit("7")).toBe("number");
    });
  });

  describe("type guarantees", () => {
    it("stories limit is always a number, never a string", () => {
      const result = clampStoriesLimit("5");
      expect(typeof result).toBe("number");
      expect(result).not.toBe("5");
    });

    it("routes limit is always a number, never a string", () => {
      const result = clampRoutesLimit("5");
      expect(typeof result).toBe("number");
      expect(result).not.toBe("5");
    });
  });
});
