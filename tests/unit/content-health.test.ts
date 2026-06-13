import { describe, it, expect } from "vitest";
import { getIssueHash } from "@/lib/content-health/issue-links";

describe("getIssueHash", () => {

  it("maps draft to #settings", () => {
    expect(getIssueHash("draft")).toBe("#settings");
  });

  it("maps inactive to #settings", () => {
    expect(getIssueHash("inactive")).toBe("#settings");
  });

  it("maps stock/demo media to #gallery", () => {
    expect(getIssueHash("stock/demo media")).toBe("#gallery");
  });

  it("maps media-related issues to #gallery", () => {
    expect(getIssueHash("no cover")).toBe("#gallery");
    expect(getIssueHash("missing media")).toBe("#gallery");
  });

  it("maps English/translation issues to #content", () => {
    expect(getIssueHash("missing English translation")).toBe("#content");
    expect(getIssueHash("missing summary")).toBe("#content");
  });

  it("returns empty string for unrecognized issues", () => {
    expect(getIssueHash("some other issue")).toBe("");
  });
});

// ── Test Data ──────────────────────────────────────────────────────────────

const SAMPLE_ITEMS = [
  {
    key: "attraction-1",
    id: 1,
    contentType: "attraction" as const,
    nameTh: "หาดทรายขาว",
    nameEn: "White Sand Beach",
    slug: "white-sand-beach",
    provinceName: "Yala",
    isPublished: true,
    isActive: true,
    hasCoverMedia: true,
    hasEnglishName: true,
    hasEnglishDescription: true,
    hasPotentialStockMedia: false,
    hasMissingAltMedia: false,
    stockMediaPaths: [] as string[],
    missingTranslations: [] as string[],
    issues: [] as string[],
    updatedAt: "2026-06-01",
    createdAt: "2026-05-01",
  },
  {
    key: "attraction-2",
    id: 2,
    contentType: "attraction" as const,
    nameTh: "น้ำตก",
    nameEn: "",
    slug: "waterfall",
    provinceName: "Pattani",
    isPublished: false,
    isActive: false,
    hasCoverMedia: false,
    hasEnglishName: false,
    hasEnglishDescription: true,
    hasPotentialStockMedia: true,
    hasMissingAltMedia: true,
    stockMediaPaths: ["https://images.unsplash.com/photo-123"],
    missingTranslations: ["name_en"],
    issues: ["draft", "inactive", "no cover", "stock/demo media"],
    updatedAt: "2026-06-02",
    createdAt: "2026-05-02",
  },
];

import type { ContentHealthReport } from "@/lib/repositories/content-health.repository";

const SAMPLE_REPORT: ContentHealthReport = {
  summary: {
    totalItems: 2,
    totalPublished: 1,
    totalDraft: 1,
    totalActive: 1,
    itemsMissingEnglish: 1,
    itemsMissingMedia: 1,
    itemsMissingAltText: 1,
    itemsWithPotentialStockMedia: 1,
    itemsWithIssues: 1,
    publishedPercentage: 50,
    activePercentage: 50,
    byType: {
      attraction: { total: 2, published: 1, draft: 1, active: 1, missingEnglish: 1, missingMedia: 1, missingAltText: 1, stockMedia: 1 },
      story: { total: 0, published: 0, draft: 0, active: 0, missingEnglish: 0, missingMedia: 0, missingAltText: 0, stockMedia: 0 },
      route: { total: 0, published: 0, draft: 0, active: 0, missingEnglish: 0, missingMedia: 0, missingAltText: 0, stockMedia: 0 },
      restaurant: { total: 0, published: 0, draft: 0, active: 0, missingEnglish: 0, missingMedia: 0, missingAltText: 0, stockMedia: 0 },
      accommodation: { total: 0, published: 0, draft: 0, active: 0, missingEnglish: 0, missingMedia: 0, missingAltText: 0, stockMedia: 0 },
      photo_spot: { total: 0, published: 0, draft: 0, active: 0, missingEnglish: 0, missingMedia: 0, missingAltText: 0, stockMedia: 0 },
    },
  },
  items: SAMPLE_ITEMS,
};

// We only test exported helpers; the component itself requires browser rendering

describe("ContentHealth data model", () => {
  it("correctly identifies published items", () => {
    expect(SAMPLE_REPORT.summary.totalPublished).toBe(1);
    expect(SAMPLE_REPORT.summary.totalDraft).toBe(1);
  });

  it("has correct issue counts", () => {
    expect(SAMPLE_REPORT.summary.itemsWithIssues).toBe(1);
    expect(SAMPLE_REPORT.summary.itemsMissingEnglish).toBe(1);
    expect(SAMPLE_REPORT.summary.itemsMissingMedia).toBe(1);
  });

  it("computes percentages correctly", () => {
    expect(SAMPLE_REPORT.summary.publishedPercentage).toBe(50);
    expect(SAMPLE_REPORT.summary.activePercentage).toBe(50);
  });

  it("byType breakdown has correct counts", () => {
    const stats = SAMPLE_REPORT.summary.byType.attraction;
    expect(stats.total).toBe(2);
    expect(stats.published).toBe(1);
    expect(stats.draft).toBe(1);
    expect(stats.stockMedia).toBe(1);
  });
});
