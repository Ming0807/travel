import { describe, expect, it } from "vitest";
import { parseStoryEngagementPayload } from "@/lib/validation/story-engagement";

const validPayload = {
  event: "story_impression",
  storyId: 42,
  surface: "story_hub",
  locale: "th",
  position: 1,
  nonce: "0123456789abcdef0123456789abcdef",
};

describe("Story engagement payload validation", () => {
  it("accepts the minimized public event contract", () => {
    expect(parseStoryEngagementPayload(validPayload)).toEqual(validPayload);
  });

  it.each([
    "story_impression",
    "story_open",
    "related_content_click",
    "meaningful_read_complete",
  ])("accepts the allowed event %s", (event) => {
    const withoutPosition = {
      event: validPayload.event,
      storyId: validPayload.storyId,
      surface: validPayload.surface,
      locale: validPayload.locale,
      nonce: validPayload.nonce,
    };
    const payload = {
      ...(event === "story_impression" || event === "related_content_click"
        ? validPayload
        : withoutPosition),
      event,
      surface:
        event === "related_content_click"
          ? "related_rail"
          : event === "story_impression"
            ? "story_hub"
            : "story_detail",
      ...(event === "related_content_click" ? { relatedStoryId: 43 } : {}),
    };

    expect(parseStoryEngagementPayload(payload).event).toBe(event);
  });

  it("rejects arbitrary event names and metadata", () => {
    expect(() =>
      parseStoryEngagementPayload({
        ...validPayload,
        event: "tourist_profile_view",
      }),
    ).toThrow();

    expect(() =>
      parseStoryEngagementPayload({
        ...validPayload,
        metadata: { email: "person@example.com" },
      }),
    ).toThrow();
  });

  it("requires a different related story only for related clicks", () => {
    expect(() =>
      parseStoryEngagementPayload({
        ...validPayload,
        event: "related_content_click",
      }),
    ).toThrow();

    expect(() =>
      parseStoryEngagementPayload({
        ...validPayload,
        event: "related_content_click",
        relatedStoryId: validPayload.storyId,
      }),
    ).toThrow();

    expect(() =>
      parseStoryEngagementPayload({
        ...validPayload,
        relatedStoryId: 99,
      }),
    ).toThrow();
  });

  it("enforces event-specific surfaces and positions", () => {
    expect(() =>
      parseStoryEngagementPayload({
        ...validPayload,
        event: "story_open",
        surface: "story_hub",
      }),
    ).toThrow();
    expect(() =>
      parseStoryEngagementPayload({
        ...validPayload,
        event: "story_open",
        surface: "story_detail",
        position: 1,
      }),
    ).toThrow();
    expect(() =>
      parseStoryEngagementPayload({
        ...validPayload,
        event: "story_impression",
        position: undefined,
      }),
    ).toThrow();
  });

  it("rejects client timestamps, identity fields, URLs, and invalid positions", () => {
    for (const extra of [
      { occurredAt: new Date().toISOString() },
      { touristId: "tourist-1" },
      { visitId: "visit-1" },
      { url: "https://example.com/stories/42" },
      { referrer: "https://search.example" },
      { position: 0 },
      { position: 25 },
    ]) {
      expect(() =>
        parseStoryEngagementPayload({ ...validPayload, ...extra }),
      ).toThrow();
    }
  });

  it("rejects weak or malformed nonces", () => {
    expect(() =>
      parseStoryEngagementPayload({ ...validPayload, nonce: "too-short" }),
    ).toThrow();
    expect(() =>
      parseStoryEngagementPayload({
        ...validPayload,
        nonce: "0123456789abcdef0123456789abcde!",
      }),
    ).toThrow();
  });
});
