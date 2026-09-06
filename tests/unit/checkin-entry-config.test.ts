import { describe, expect, it } from "vitest";
import { parseCheckinEntryConfig } from "@/lib/config/checkin-entry";
import { createCheckinBrowserId, hashCheckinBrowserId, isCheckinBrowserId, resolveCheckinBrowserId } from "@/lib/auth/checkin-entry";

const secret = "entry-session-test-secret-at-least-32-characters";

describe("check-in entry server configuration", () => {
  it("keeps entry sessions and NFC off by default without requiring a secret", () => {
    expect(parseCheckinEntryConfig({})).toEqual({ sessionsEnabled: false, nfcEnabled: false, hashSecret: null });
  });

  it("requires a server-only hash secret when sessions are enabled", () => {
    expect(() => parseCheckinEntryConfig({ CHECKIN_ENTRY_SESSIONS_ENABLED: "true" })).toThrow(/CHECKIN_ENTRY_HASH_SECRET/);
    expect(parseCheckinEntryConfig({ CHECKIN_ENTRY_SESSIONS_ENABLED: "true", CHECKIN_ENTRY_HASH_SECRET: secret }))
      .toEqual({ sessionsEnabled: true, nfcEnabled: false, hashSecret: secret });
  });

  it("cannot enable NFC without the shared entry-session contract", () => {
    expect(() => parseCheckinEntryConfig({ NFC_CHECKIN_ENABLED: "true", CHECKIN_ENTRY_HASH_SECRET: secret }))
      .toThrow(/CHECKIN_ENTRY_SESSIONS_ENABLED/);
  });

  it.each(["1", "yes", "TRUE", "enabled", " false "])("rejects ambiguous boolean value %s", (value) => {
    expect(() => parseCheckinEntryConfig({ CHECKIN_ENTRY_SESSIONS_ENABLED: value })).toThrow(/CHECKIN_ENTRY_SESSIONS_ENABLED/);
  });
});

describe("browser-bound entry identity", () => {
  it("creates an opaque UUID and hashes it deterministically without returning the raw value", () => {
    const browserId = createCheckinBrowserId();
    expect(isCheckinBrowserId(browserId)).toBe(true);
    const first = hashCheckinBrowserId(browserId, secret);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).toBe(hashCheckinBrowserId(browserId, secret));
    expect(first).not.toContain(browserId);
    expect(first).not.toBe(hashCheckinBrowserId(browserId, `${secret}-other`));
  });

  it.each(["", "not-a-uuid", "10000000-0000-1000-8000-000000000001", "10000000-0000-4000-0000-000000000001"])(
    "rejects malformed browser id %s", (value) => expect(isCheckinBrowserId(value)).toBe(false),
  );

  it("reuses only a valid v4 cookie and creates a replacement otherwise", () => {
    const existing = "10000000-0000-4000-8000-000000000001";
    expect(resolveCheckinBrowserId(existing)).toEqual({ browserId: existing, wasCreated: false });
    const replacement = resolveCheckinBrowserId("invalid");
    expect(replacement.wasCreated).toBe(true);
    expect(isCheckinBrowserId(replacement.browserId)).toBe(true);
  });
});
