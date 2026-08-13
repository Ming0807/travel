import { describe, expect, it } from "vitest";
import {
  composeRelatedContent,
  haversineDistanceKm,
  rankRelatedContent,
  type RelatedContentCandidate,
  type RelatedContentSource,
} from "@/lib/content/attraction-related-content";

const source: RelatedContentSource = {
  id: "source-attraction",
  evidence: {
    provinceId: 1,
    districtId: 10,
    latitude: 6.5,
    longitude: 101.25,
    categoryIds: ["nature", "viewpoint"],
  },
};

function candidate(
  id: string,
  overrides: Partial<RelatedContentCandidate> = {}
): RelatedContentCandidate {
  return {
    id,
    title: `สถานที่ ${id}`,
    slug: id,
    eligibility: {
      published: true,
      active: true,
      inLaunchScope: true,
      usableTitle: true,
      usableSlug: true,
    },
    evidence: {
      provinceId: 1,
      districtId: 10,
      latitude: 6.51,
      longitude: 101.26,
      categoryIds: ["nature"],
      contentReadiness: 1,
    },
    ...overrides,
  };
}

describe("attraction-related-content pure recommendation engine", () => {
  it("calculates a safe haversine distance and rejects invalid coordinates", () => {
    expect(
      haversineDistanceKm(
        { latitude: 6.5, longitude: 101.25 },
        { latitude: 6.51, longitude: 101.26 }
      )
    ).toBeGreaterThan(0);
    expect(
      haversineDistanceKm(
        { latitude: Number.NaN, longitude: 101.25 },
        { latitude: 6.51, longitude: 101.26 }
      )
    ).toBeNull();
    expect(
      haversineDistanceKm(
        { latitude: 91, longitude: 101.25 },
        { latitude: 6.51, longitude: 101.26 }
      )
    ).toBeNull();
  });

  it("ranks attractions by weighted distance, area, category, and readiness", () => {
    const result = rankRelatedContent("attractions", source, [
      candidate("far", {
        evidence: {
          provinceId: 1,
          districtId: 99,
          latitude: 7,
          longitude: 102,
          categoryIds: ["food"],
          contentReadiness: 0,
        },
      }),
      candidate("near", { evidence: { ...candidate("near").evidence } }),
    ]);

    expect(result[0]).toMatchObject({ id: "near", source: "automatic" });
    expect(result[0]?.reasonKey).toBe("nearby");
    expect(result[0]?.distanceKm).toBeTypeOf("number");
    expect(result[0]?.score).toBeGreaterThan(result[1]?.score ?? 0);
  });

  it("falls back to truthful area or category reasons when coordinates are missing", () => {
    const result = rankRelatedContent("attractions", source, [
      candidate("same-district-no-coordinates", {
        evidence: {
          provinceId: 1,
          districtId: 10,
          latitude: null,
          longitude: null,
          categoryIds: ["unrelated"],
          contentReadiness: 0,
        },
      }),
    ]);

    expect(result[0]?.reasonKey).toBe("same_district");
    expect(result[0]?.reasonLabel).toContain("อำเภอเดียวกัน");
    expect(result[0]?.reasonLabel).not.toContain("กม.");
    expect(result[0]?.distanceKm).toBeUndefined();
  });

  it("uses shared categories as evidence without claiming proximity", () => {
    const result = rankRelatedContent("attractions", source, [
      candidate("shared-category", {
        evidence: {
          provinceId: 99,
          districtId: 99,
          latitude: null,
          longitude: null,
          categoryIds: ["viewpoint"],
          contentReadiness: 0,
        },
      }),
    ]);

    expect(result[0]?.reasonKey).toBe("shared_category");
    expect(result[0]?.reasonLabel).toContain("หมวดหมู่");
    expect(result[0]?.reasonLabel).not.toContain("ใกล้");
  });

  it("filters self references, duplicates, unpublished, inactive, out-of-scope, and unusable records", () => {
    const result = rankRelatedContent("attractions", source, [
      candidate("source-attraction"),
      candidate("duplicate"),
      candidate("duplicate", { title: "ชื่อซ้ำ" }),
      candidate("draft", {
        eligibility: { ...candidate("draft").eligibility, published: false },
      }),
      candidate("inactive", {
        eligibility: { ...candidate("inactive").eligibility, active: false },
      }),
      candidate("out-of-scope", {
        eligibility: {
          ...candidate("out-of-scope").eligibility,
          inLaunchScope: false,
        },
      }),
      candidate("bad-title", {
        title: "   ",
        eligibility: { ...candidate("bad-title").eligibility, usableTitle: false },
      }),
      candidate("duplicate", { eligibility: { ...candidate("duplicate").eligibility, isDemo: true } }),
    ]);

    expect(result.map((item) => item.id)).toEqual(["duplicate"]);
  });

  it("rejects mock and demo records even when every public status flag is valid", () => {
    const result = rankRelatedContent("attractions", source, [
      candidate("mock", {
        eligibility: { ...candidate("mock").eligibility, isMock: true },
      }),
      candidate("demo", {
        eligibility: { ...candidate("demo").eligibility, isDemo: true },
      }),
      candidate("real"),
    ]);

    expect(result.map((item) => item.id)).toEqual(["real"]);
  });

  it("keeps low-readiness published content eligible but ranks ready content higher", () => {
    const result = rankRelatedContent("accommodations", source, [
      candidate("basic", {
        eligibility: { ...candidate("basic").eligibility, contentReady: false },
        evidence: { ...candidate("basic").evidence, contentReadiness: 0 },
      }),
      candidate("ready", {
        evidence: { ...candidate("ready").evidence, contentReadiness: 1 },
      }),
    ]);

    expect(result.map((item) => item.id)).toEqual(["ready", "basic"]);
  });

  it("keeps equal scores deterministic with an id tie breaker", () => {
    const noEvidence = (id: string) =>
      candidate(id, {
        evidence: {
          provinceId: null,
          districtId: null,
          latitude: null,
          longitude: null,
          categoryIds: [],
          contentReadiness: 0,
        },
      });
    const result = rankRelatedContent("attractions", source, [
      noEvidence("zeta"),
      noEvidence("alpha"),
    ]);

    expect(result.map((item) => item.id)).toEqual(["alpha", "zeta"]);
  });

  it("requires a direct verified relation for stories even when province matches", () => {
    const result = rankRelatedContent("stories", source, [
      candidate("province-only", {
        eligibility: { ...candidate("province-only").eligibility },
        evidence: {
          ...candidate("province-only").evidence,
          directVerifiedRelation: false,
        },
      }),
      candidate("conflicting-story", {
        eligibility: {
          ...candidate("conflicting-story").eligibility,
          directVerifiedRelation: false,
        },
        evidence: {
          ...candidate("conflicting-story").evidence,
          directVerifiedRelation: true,
        },
      }),
      candidate("verified-story", {
        evidence: {
          ...candidate("verified-story").evidence,
          directVerifiedRelation: true,
          publishedAt: "2026-08-01T00:00:00.000Z",
        },
      }),
    ]);

    expect(result.map((item) => item.id)).toEqual(["verified-story"]);
    expect(result[0]?.reasonKey).toBe("verified_relation");
    expect(result[0]?.reasonLabel).toContain("กล่าวถึงสถานที่นี้");
  });

  it("ranks restaurants with verified relation ahead of merely shared area", () => {
    const result = rankRelatedContent("restaurants", source, [
      candidate("same-area", {
        evidence: {
          ...candidate("same-area").evidence,
          directVerifiedRelation: false,
        },
      }),
      candidate("verified-restaurant", {
        evidence: {
          ...candidate("verified-restaurant").evidence,
          directVerifiedRelation: true,
        },
      }),
    ]);

    expect(result[0]?.id).toBe("verified-restaurant");
    expect(result[0]?.reasonKey).toBe("verified_relation");
  });

  it("composes manual mode as exact curated items without automatic backfill", () => {
    const result = composeRelatedContent({
      contentType: "attractions",
      source,
      mode: "manual",
      limit: 4,
      curatedCandidates: [candidate("curated-one"), candidate("curated-two")],
      automaticCandidates: [candidate("automatic-one")],
    });

    expect(result.items.map((item) => item.id)).toEqual([
      "curated-one",
      "curated-two",
    ]);
    expect(result.items.every((item) => item.source === "curated")).toBe(true);
  });

  it("composes automatic mode from ranked automatic candidates only", () => {
    const result = composeRelatedContent({
      contentType: "attractions",
      source,
      mode: "automatic",
      limit: 2,
      curatedCandidates: [candidate("curated-one")],
      automaticCandidates: [candidate("automatic-one"), candidate("automatic-two")],
    });

    expect(result.items.map((item) => item.id)).toEqual([
      "automatic-one",
      "automatic-two",
    ]);
    expect(result.items.every((item) => item.source === "automatic")).toBe(true);
  });

  it("composes hybrid mode with curated order first and deduped automatic fill", () => {
    const result = composeRelatedContent({
      contentType: "attractions",
      source,
      mode: "hybrid",
      limit: 3,
      curatedCandidates: [candidate("curated-one"), candidate("shared")],
      automaticCandidates: [candidate("shared"), candidate("automatic-one"), candidate("automatic-two")],
    });

    expect(result.items.map((item) => item.id)).toEqual([
      "curated-one",
      "shared",
      "automatic-one",
    ]);
    expect(result.items.map((item) => item.source)).toEqual([
      "curated",
      "curated",
      "automatic",
    ]);
    expect(new Set(result.items.map((item) => item.id)).size).toBe(3);
  });

  it("returns unavailable curated candidates as diagnostics but never as public items", () => {
    const result = composeRelatedContent({
      contentType: "attractions",
      source,
      mode: "manual",
      curatedCandidates: [
        candidate("unpublished", {
          eligibility: { ...candidate("unpublished").eligibility, published: false },
        }),
        candidate("available"),
      ],
      automaticCandidates: [candidate("automatic")],
    });

    expect(result.items.map((item) => item.id)).toEqual(["available"]);
    expect(result.unavailableCurated).toEqual([
      expect.objectContaining({ id: "unpublished", reasons: ["unpublished"] }),
    ]);
  });

  it("preserves curated order, applies capacity, and hides every mode explicitly", () => {
    const curated = [
      candidate("second", { curatedOrder: 2 }),
      candidate("first", { curatedOrder: 1 }),
      candidate("third", { curatedOrder: 3 }),
    ];
    const limited = composeRelatedContent({
      contentType: "attractions",
      source,
      mode: "manual",
      limit: 2,
      curatedCandidates: curated,
      automaticCandidates: [],
    });
    const hidden = composeRelatedContent({
      contentType: "attractions",
      source,
      mode: "hidden",
      curatedCandidates: curated,
      automaticCandidates: [candidate("automatic")],
    });

    expect(limited.items.map((item) => item.id)).toEqual(["first", "second"]);
    expect(hidden.items).toEqual([]);
  });

  it("clamps every public section to the database maximum of eight items", () => {
    const result = rankRelatedContent(
      "attractions",
      source,
      Array.from({ length: 12 }, (_, index) => candidate(`candidate-${index}`)),
      { limit: 12 },
    );

    expect(result).toHaveLength(8);
  });
});
