import { describe, expect, it } from "vitest";
import {
  rankStoryRecommendations,
  type StoryRecommendationSignal,
} from "@/lib/content/story-recommendation";

const source: StoryRecommendationSignal = {
  id: "source",
  province: "ปัตตานี",
  topicKey: "culture",
  publishedAt: "2026-07-20T00:00:00.000Z",
  publicReady: true,
};

function candidate(
  id: string,
  overrides: Partial<StoryRecommendationSignal> = {}
): StoryRecommendationSignal {
  return {
    id,
    province: "ยะลา",
    topicKey: "nature",
    publishedAt: "2026-07-15T00:00:00.000Z",
    publicReady: true,
    ...overrides,
  };
}

describe("explainable story recommendations", () => {
  it("excludes the current story and non-public-ready candidates", () => {
    const result = rankStoryRecommendations(source, [
      candidate("source"),
      candidate("draft", { publicReady: false }),
      candidate("manual-exclusion", { excluded: true }),
      candidate("published"),
    ]);

    expect(result.map((item) => item.id)).toEqual(["published"]);
  });

  it("keeps curated relationships first and exposes a Thai reason key", () => {
    const result = rankStoryRecommendations(source, [
      candidate("same-province", { province: "ปัตตานี" }),
      candidate("curated", {
        curatedOrder: 2,
        curatedReason: "คัดเลือกโดยทีมเนื้อหา",
      }),
    ]);

    expect(result[0]).toMatchObject({
      id: "curated",
      reasonKey: "curated",
      reasonLabel: "คัดเลือกโดยทีมเนื้อหา",
    });
  });

  it("scores same province above same topic and applies diversity", () => {
    const result = rankStoryRecommendations(
      source,
      [
        candidate("pattani-one", {
          province: "ปัตตานี",
          topicKey: "culture",
        }),
        candidate("pattani-two", {
          province: "ปัตตานี",
          topicKey: "culture",
        }),
        candidate("narathiwat", {
          province: "นราธิวาส",
          topicKey: "food",
        }),
      ],
      { limit: 3, now: new Date("2026-07-30T00:00:00.000Z") }
    );

    expect(result[0]?.id).toBe("pattani-one");
    expect(result[1]?.id).toBe("narathiwat");
    expect(result[0]?.reasonKey).toBe("same_province");
  });

  it("falls back deterministically to the latest public story", () => {
    const result = rankStoryRecommendations(
      source,
      [
        candidate("older", { publishedAt: "2026-01-01T00:00:00.000Z" }),
        candidate("newer", { publishedAt: "2026-07-29T00:00:00.000Z" }),
      ],
      { limit: 1, now: new Date("2026-07-30T00:00:00.000Z") }
    );

    expect(result[0]).toMatchObject({
      id: "newer",
      reasonKey: "latest",
    });
  });

  it("returns internal score components for destination, tags, topic, and quality", () => {
    const result = rankStoryRecommendations(
      {
        ...source,
        attractionKeys: ["old-town"],
        routeKeys: ["culture-loop"],
        tagKeys: ["halal", "heritage"],
      },
      [
        candidate("connected", {
          attractionKeys: ["old-town"],
          routeKeys: ["culture-loop"],
          tagKeys: ["halal", "heritage", "family"],
          topicKey: "culture",
          qualityScore: 4,
        }),
      ],
      { now: new Date("2026-07-30T00:00:00.000Z") }
    );

    expect(result[0]?.scoreComponents).toMatchObject({
      sharedDestination: 25,
      tags: 10,
      topic: 10,
      quality: 4,
    });
    expect(result[0]?.reasonKey).toBe("shared_destination");
  });

  it("keeps engagement disabled until the minimum sample is met", () => {
    const result = rankStoryRecommendations(
      source,
      [
        candidate("too-small", {
          engagementScore: 10,
          engagementSampleSize: 99,
        }),
        candidate("eligible", {
          engagementScore: 8,
          engagementSampleSize: 100,
        }),
      ],
      {
        now: new Date("2026-07-30T00:00:00.000Z"),
        minimumEngagementSample: 100,
      }
    );

    const scoreById = new Map(
      result.map((item) => [item.id, item.scoreComponents.engagement])
    );
    expect(scoreById.get("too-small")).toBe(0);
    expect(scoreById.get("eligible")).toBe(8);
  });
});
