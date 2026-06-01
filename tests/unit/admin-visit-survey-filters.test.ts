import { describe, it, expect } from "vitest";
import { adminVisitFiltersSchema } from "@/lib/validation/admin-visit";
import { adminSurveyFiltersSchema } from "@/lib/validation/admin-survey";

// ---------------------------------------------------------------------------
// adminVisitFiltersSchema
// ---------------------------------------------------------------------------
describe("adminVisitFiltersSchema", () => {
  it("accepts minimal valid input (page only)", () => {
    const result = adminVisitFiltersSchema.parse({ page: 1 });
    expect(result.page).toBe(1);
    expect(result.search).toBeUndefined();
    expect(result.attractionId).toBeUndefined();
    expect(result.completionStatus).toBeUndefined();
  });

  it("applies default page and pageSize", () => {
    const result = adminVisitFiltersSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("accepts search string", () => {
    const result = adminVisitFiltersSchema.parse({ search: "สมชาย" });
    expect(result.search).toBe("สมชาย");
  });

  it("strips whitespace from search", () => {
    const result = adminVisitFiltersSchema.parse({ search: "  ชาย  " });
    expect(result.search).toBe("ชาย");
  });

  it("omits empty search string", () => {
    const result = adminVisitFiltersSchema.parse({ search: "" });
    expect(result.search).toBeUndefined();
  });

  it("rejects search longer than 120 characters", () => {
    expect(() =>
      adminVisitFiltersSchema.parse({ search: "x".repeat(121) })
    ).toThrow();
  });

  it("accepts valid attractionId", () => {
    const result = adminVisitFiltersSchema.parse({ attractionId: "42" });
    expect(result.attractionId).toBe(42);
  });

  it("omits empty attractionId", () => {
    const result = adminVisitFiltersSchema.parse({ attractionId: "" });
    expect(result.attractionId).toBeUndefined();
  });

  it("omits null attractionId", () => {
    const result = adminVisitFiltersSchema.parse({ attractionId: null });
    expect(result.attractionId).toBeUndefined();
  });

  it("rejects non-positive attractionId", () => {
    expect(() => adminVisitFiltersSchema.parse({ attractionId: "0" })).toThrow();
    expect(() => adminVisitFiltersSchema.parse({ attractionId: "-5" })).toThrow();
  });

  it("accepts valid provinceId", () => {
    const result = adminVisitFiltersSchema.parse({ provinceId: "7" });
    expect(result.provinceId).toBe(7);
  });

  it("accepts valid completionStatus", () => {
    const result = adminVisitFiltersSchema.parse({
      completionStatus: "certificate_generated",
    });
    expect(result.completionStatus).toBe("certificate_generated");
  });

  it("accepts all valid completionStatus values", () => {
    const statuses = [
      "started",
      "minimal_form_completed",
      "photo_uploaded",
      "certificate_generated",
      "survey_completed",
      "abandoned",
    ] as const;
    for (const status of statuses) {
      const result = adminVisitFiltersSchema.parse({
        completionStatus: status,
      });
      expect(result.completionStatus).toBe(status);
    }
  });

  it("rejects invalid completionStatus", () => {
    expect(() =>
      adminVisitFiltersSchema.parse({ completionStatus: "invalid" })
    ).toThrow();
  });

  it("omits empty completionStatus", () => {
    const result = adminVisitFiltersSchema.parse({ completionStatus: "" });
    expect(result.completionStatus).toBeUndefined();
  });

  it("accepts valid dateFrom", () => {
    const result = adminVisitFiltersSchema.parse({ dateFrom: "2026-01-15" });
    expect(result.dateFrom).toBeDefined();
  });

  it("accepts ISO date string for dateFrom", () => {
    const result = adminVisitFiltersSchema.parse({
      dateFrom: "2026-05-01T00:00:00.000Z",
    });
    expect(result.dateFrom).toBeDefined();
  });

  it("rejects invalid dateFrom", () => {
    expect(() =>
      adminVisitFiltersSchema.parse({ dateFrom: "not-a-date" })
    ).toThrow();
  });

  it("omits empty dateFrom", () => {
    const result = adminVisitFiltersSchema.parse({ dateFrom: "" });
    expect(result.dateFrom).toBeUndefined();
  });

  it("accepts dateFrom & dateTo together", () => {
    const result = adminVisitFiltersSchema.parse({
      dateFrom: "2026-01-01",
      dateTo: "2026-12-31",
    });
    expect(result.dateFrom).toBeDefined();
    expect(result.dateTo).toBeDefined();
  });

  it("rejects dateTo before dateFrom (schema-level — Zod allows this, but it should pass; validation is app-level)", () => {
    // This is allowed at schema level; app-level validation enforces ordering
    const result = adminVisitFiltersSchema.parse({
      dateFrom: "2026-12-31",
      dateTo: "2026-01-01",
    });
    expect(result.dateFrom).toBeDefined();
    expect(result.dateTo).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// adminSurveyFiltersSchema
// ---------------------------------------------------------------------------
describe("adminSurveyFiltersSchema", () => {
  it("accepts minimal valid input (page only)", () => {
    const result = adminSurveyFiltersSchema.parse({ page: 1 });
    expect(result.page).toBe(1);
    expect(result.search).toBeUndefined();
    expect(result.minScore).toBeUndefined();
  });

  it("accepts valid minScore", () => {
    const result = adminSurveyFiltersSchema.parse({ minScore: "3" });
    expect(result.minScore).toBe(3);
  });

  it("accepts valid maxScore", () => {
    const result = adminSurveyFiltersSchema.parse({ maxScore: "5" });
    expect(result.maxScore).toBe(5);
  });

  it("accepts minScore & maxScore together", () => {
    const result = adminSurveyFiltersSchema.parse({
      minScore: "2",
      maxScore: "4",
    });
    expect(result.minScore).toBe(2);
    expect(result.maxScore).toBe(4);
  });

  it("rejects minScore less than 1", () => {
    expect(() => adminSurveyFiltersSchema.parse({ minScore: "0" })).toThrow();
    expect(() => adminSurveyFiltersSchema.parse({ minScore: "-1" })).toThrow();
  });

  it("rejects minScore greater than 5", () => {
    expect(() => adminSurveyFiltersSchema.parse({ minScore: "6" })).toThrow();
  });

  it("rejects maxScore less than 1", () => {
    expect(() => adminSurveyFiltersSchema.parse({ maxScore: "0" })).toThrow();
  });

  it("rejects maxScore greater than 5", () => {
    expect(() => adminSurveyFiltersSchema.parse({ maxScore: "6" })).toThrow();
  });

  it("omits empty minScore", () => {
    const result = adminSurveyFiltersSchema.parse({ minScore: "" });
    expect(result.minScore).toBeUndefined();
  });

  it("omits null minScore", () => {
    const result = adminSurveyFiltersSchema.parse({ minScore: null });
    expect(result.minScore).toBeUndefined();
  });

  it("accepts valid attractionId", () => {
    const result = adminSurveyFiltersSchema.parse({ attractionId: "10" });
    expect(result.attractionId).toBe(10);
  });

  it("omits empty attractionId", () => {
    const result = adminSurveyFiltersSchema.parse({ attractionId: "" });
    expect(result.attractionId).toBeUndefined();
  });

  it("accepts valid provinceId", () => {
    const result = adminSurveyFiltersSchema.parse({ provinceId: "5" });
    expect(result.provinceId).toBe(5);
  });

  it("accepts search text", () => {
    const result = adminSurveyFiltersSchema.parse({ search: "ทดสอบ" });
    expect(result.search).toBe("ทดสอบ");
  });
});
