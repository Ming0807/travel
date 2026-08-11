import { describe, expect, it } from "vitest";

import {
  resolveSafeAuthDestination,
  resolveTouristAuthProvider,
} from "@/lib/auth/oauth";

describe("OAuth callback security", () => {
  it.each([
    [null, "/profile"],
    ["", "/profile"],
    ["https://evil.example/steal", "/profile"],
    ["//evil.example/steal", "/profile"],
    ["/\\evil.example/steal", "/profile"],
    ["/admin/users", "/profile"],
    ["/api/private", "/profile"],
    ["/_next/static/file.js", "/profile"],
    ["/auth/callback?code=again", "/profile"],
  ])("maps unsafe destination %s to the profile fallback", (input, expected) => {
    expect(resolveSafeAuthDestination(input)).toBe(expected);
  });

  it("preserves a safe internal tourist destination with query and hash", () => {
    expect(resolveSafeAuthDestination("/stories/share?draft=1#form")).toBe(
      "/stories/share?draft=1#form",
    );
  });

  it.each([
    ["google", "google"],
    ["line", "line"],
    ["email", "email"],
    ["azure", null],
    ["anonymous", null],
    [undefined, null],
  ])("allowlists supported tourist provider %s", (input, expected) => {
    expect(resolveTouristAuthProvider(input)).toBe(expected);
  });
});
