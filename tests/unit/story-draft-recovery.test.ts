import { describe, expect, it } from "vitest";
import {
  parseStoryDraftRecovery,
  shouldOfferStoryDraftRecovery,
} from "@/lib/content/story-draft-recovery";

const document = {
  type: "doc" as const,
  version: 1 as const,
  content: [{ type: "paragraph" as const, content: [{ type: "text" as const, text: "ฉบับกู้คืน" }] }],
};

describe("story local draft recovery", () => {
  it("accepts a bounded draft for the same story and server version", () => {
    const parsed = parseStoryDraftRecovery(JSON.stringify({
      storyId: 12,
      baseUpdatedAt: "2026-07-17T00:00:00.000Z",
      html: "<p>ฉบับกู้คืน</p>",
      document,
      savedAt: "2026-07-17T01:00:00.000Z",
    }));
    expect(parsed?.storyId).toBe(12);
    expect(parsed?.document).toEqual(document);
  });

  it("rejects malformed or oversized recovery payloads", () => {
    expect(parseStoryDraftRecovery("bad-json")).toBeNull();
    expect(parseStoryDraftRecovery(JSON.stringify({ storyId: 12, html: "x".repeat(500_001) }))).toBeNull();
  });

  it("offers recovery only when it belongs to the current server version and differs from saved content", () => {
    const recovery = parseStoryDraftRecovery(JSON.stringify({
      storyId: 12,
      baseUpdatedAt: "2026-07-17T00:00:00.000Z",
      html: "<p>ฉบับกู้คืน</p>",
      document,
      savedAt: "2026-07-17T01:00:00.000Z",
    }));
    expect(shouldOfferStoryDraftRecovery(recovery, {
      storyId: 12,
      updatedAt: "2026-07-17T00:00:00.000Z",
      html: "<p>ฉบับบนเซิร์ฟเวอร์</p>",
    })).toBe(true);
    expect(shouldOfferStoryDraftRecovery(recovery, {
      storyId: 12,
      updatedAt: "2026-07-17T02:00:00.000Z",
      html: "<p>ฉบับบนเซิร์ฟเวอร์</p>",
    })).toBe(false);
  });
});
