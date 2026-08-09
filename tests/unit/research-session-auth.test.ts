import { createHash } from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

import {
  RESEARCH_SESSION_COOKIE,
  createResearchCredentials,
  getResearchSessionCredentials,
  hashResearchToken,
  setResearchSessionCredentials,
} from "@/lib/auth/research-session";

describe("research session credentials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates high-entropy opaque credentials and stores only their hashes for RPC use", () => {
    const credentials = createResearchCredentials("11111111-1111-4111-8111-111111111111", "operation-token");

    expect(credentials.accessToken).toMatch(/^[A-Za-z0-9_-]{43,}$/);
    expect(credentials.withdrawalToken).toMatch(/^[A-Za-z0-9_-]{43,}$/);
    expect(credentials.accessTokenHash).toBe(
      createHash("sha256").update(credentials.accessToken).digest("hex"),
    );
    expect(credentials.withdrawalTokenHash).toBe(
      createHash("sha256").update(credentials.withdrawalToken).digest("hex"),
    );
    expect(credentials.accessTokenHash).not.toContain(credentials.accessToken);
    expect(hashResearchToken(credentials.accessToken)).toBe(credentials.accessTokenHash);
  });

  it("uses a secure HttpOnly cookie and parses malformed values as absent", async () => {
    const credentials = createResearchCredentials("11111111-1111-4111-8111-111111111111", "operation-token");

    await setResearchSessionCredentials(credentials);

    expect(cookieStore.set).toHaveBeenCalledWith(
      RESEARCH_SESSION_COOKIE,
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      }),
    );
    const cookieValue = cookieStore.set.mock.calls[0]?.[1] as string;
    expect(cookieValue).not.toContain(credentials.accessTokenHash);
    expect(cookieValue).not.toContain(credentials.withdrawalTokenHash);

    cookieStore.get.mockReturnValue({ value: cookieValue });
    const parsed = await getResearchSessionCredentials();
    expect(parsed?.publicSessionCode).toBe(credentials.publicSessionCode);
    expect(parsed?.accessToken).toBe(credentials.accessToken);
    expect(parsed?.withdrawalToken).toBe(credentials.withdrawalToken);

    cookieStore.get.mockReturnValue({ value: "not-a-valid-cookie" });
    await expect(getResearchSessionCredentials()).resolves.toBeNull();
  });
});
