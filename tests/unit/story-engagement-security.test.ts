import { describe, expect, it } from "vitest";
import {
  createStoryEngagementDigest,
  isStoryEngagementOriginAllowed,
} from "@/lib/security/story-engagement";

describe("Story engagement origin policy", () => {
  const config = {
    appEnv: "production" as const,
    appUrl: "https://travel.example.com",
    siteUrl: "https://www.travel.example.com",
  };

  it("accepts only exact configured production origins", () => {
    expect(
      isStoryEngagementOriginAllowed(
        "https://travel.example.com",
        config,
      ),
    ).toBe(true);
    expect(
      isStoryEngagementOriginAllowed(
        "https://www.travel.example.com",
        config,
      ),
    ).toBe(true);
    expect(
      isStoryEngagementOriginAllowed(
        "https://travel.example.com.evil.test",
        config,
      ),
    ).toBe(false);
    expect(
      isStoryEngagementOriginAllowed(
        "https://travel.example.com/path",
        config,
      ),
    ).toBe(false);
  });

  it("rejects a missing origin in production but accepts localhost in local mode", () => {
    expect(isStoryEngagementOriginAllowed(null, config)).toBe(false);
    expect(
      isStoryEngagementOriginAllowed("http://localhost:3000", {
        ...config,
        appEnv: "local",
      }),
    ).toBe(true);
  });
});

describe("Story engagement privacy digests", () => {
  it("is deterministic, domain-separated, and does not expose source values", () => {
    const secret = "0123456789abcdef0123456789abcdef";
    const nonce = "anonymous-browser-nonce-value-12345";
    const digest = createStoryEngagementDigest(secret, "dedup", [
      nonce,
      "story_open",
      "42",
      "2026-07-30",
    ]);

    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(digest).not.toContain(nonce);
    expect(
      createStoryEngagementDigest(secret, "dedup", [
        nonce,
        "story_open",
        "42",
        "2026-07-30",
      ]),
    ).toBe(digest);
    expect(
      createStoryEngagementDigest(secret, "rate-limit", [
        nonce,
        "story_open",
        "42",
        "2026-07-30",
      ]),
    ).not.toBe(digest);
  });

  it("rejects a weak server secret", () => {
    expect(() =>
      createStoryEngagementDigest("weak", "dedup", ["value"]),
    ).toThrow();
  });
});
