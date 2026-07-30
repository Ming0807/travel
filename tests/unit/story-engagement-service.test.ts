import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  consumeRateLimit: vi.fn(),
  recordEvent: vi.fn(),
}));

vi.mock("@/lib/config/server-env", () => ({
  getServerEnv: () => ({
    CONTENT_ENGAGEMENT_HASH_SECRET:
      "0123456789abcdef0123456789abcdef",
  }),
}));

vi.mock("@/lib/repositories/story-engagement.repository", () => ({
  consumeStoryEngagementRateLimit: (...args: unknown[]) =>
    mocks.consumeRateLimit(...args),
  recordStoryEngagementEvent: (...args: unknown[]) =>
    mocks.recordEvent(...args),
}));

import { recordStoryEngagementSignal } from "@/lib/services/story-engagement.service";

describe("Story engagement service privacy boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.consumeRateLimit.mockResolvedValue(true);
    mocks.recordEvent.mockResolvedValue(true);
  });

  it("passes only irreversible hashes and minimized event fields to persistence", async () => {
    const nonce = "0123456789abcdef0123456789abcdef";
    const transientSource = "203.0.113.8";

    await recordStoryEngagementSignal(
      {
        event: "story_open",
        storyId: 42,
        surface: "story_detail",
        locale: "th",
        nonce,
      },
      {
        transientSource,
        origin: "https://travel.example.com",
        now: new Date("2026-07-30T12:00:00.000Z"),
      },
    );

    const persisted = JSON.stringify([
      mocks.consumeRateLimit.mock.calls,
      mocks.recordEvent.mock.calls,
    ]);
    expect(persisted).not.toContain(nonce);
    expect(persisted).not.toContain(transientSource);
    expect(persisted).not.toContain("travel.example.com");
    expect(persisted).toContain('"storyId":42');
    expect(persisted).toContain('"event":"story_open"');
  });

  it("does not write an event after the distributed rate limit is exceeded", async () => {
    mocks.consumeRateLimit.mockResolvedValueOnce(false);

    const result = await recordStoryEngagementSignal(
      {
        event: "story_open",
        storyId: 42,
        surface: "story_detail",
        locale: "th",
        nonce: "0123456789abcdef0123456789abcdef",
      },
      {
        transientSource: "203.0.113.8",
        origin: "https://travel.example.com",
      },
    );

    expect(result).toEqual({ accepted: false });
    expect(mocks.recordEvent).not.toHaveBeenCalled();
  });
});
