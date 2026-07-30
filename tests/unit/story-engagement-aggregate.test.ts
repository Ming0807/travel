import { describe, expect, it } from "vitest";
import { buildStoryEngagementSignals } from "@/lib/content/story-engagement";

describe("Story engagement aggregate signals", () => {
  it("uses deduplicated opens as the sample and completion rate as a bounded score", () => {
    const signals = buildStoryEngagementSignals([
      {
        storyId: 42,
        eventName: "story_open",
        eventCount: 120,
        uniqueSessionCount: 110,
      },
      {
        storyId: 42,
        eventName: "meaningful_read_complete",
        eventCount: 90,
        uniqueSessionCount: 80,
      },
    ]);

    expect(signals.get(42)?.engagementSampleSize).toBe(110);
    expect(signals.get(42)?.engagementScore).toBeCloseTo(7.2727, 4);
  });

  it("returns no score for impressions alone and caps inconsistent data", () => {
    const signals = buildStoryEngagementSignals([
      {
        storyId: 7,
        eventName: "story_impression",
        eventCount: 500,
        uniqueSessionCount: 450,
      },
      {
        storyId: 8,
        eventName: "story_open",
        eventCount: 10,
        uniqueSessionCount: 8,
      },
      {
        storyId: 8,
        eventName: "meaningful_read_complete",
        eventCount: 20,
        uniqueSessionCount: 15,
      },
    ]);

    expect(signals.has(7)).toBe(false);
    expect(signals.get(8)).toEqual({
      engagementSampleSize: 8,
      engagementScore: 10,
    });
  });
});
