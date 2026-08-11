import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/auth/callback/route";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getGuestIdentity } from "@/lib/auth/guest";
import {
  findTouristByIdentity,
  resolveTouristOAuthIdentity,
} from "@/lib/repositories/tourist.repository";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/auth/guest", () => ({
  getGuestIdentity: vi.fn(),
}));

vi.mock("@/lib/repositories/tourist.repository", () => ({
  findTouristByIdentity: vi.fn(),
  resolveTouristOAuthIdentity: vi.fn(),
}));

const exchangeCodeForSession = vi.fn();

describe("OAuth callback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue({
      auth: { exchangeCodeForSession },
    } as never);
    exchangeCodeForSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: "auth-user-1",
            app_metadata: { provider: "google" },
            user_metadata: { full_name: "ผู้เดินทาง" },
          },
        },
      },
      error: null,
    });
    vi.mocked(findTouristByIdentity).mockResolvedValue(null);
    vi.mocked(getGuestIdentity).mockResolvedValue(null);
    vi.mocked(resolveTouristOAuthIdentity).mockResolvedValue({
      touristId: "tourist-1",
      status: "created",
    });
  });

  it("does not merge an unlinked OAuth account with a guest passport automatically", async () => {
    vi.mocked(getGuestIdentity).mockResolvedValue("guest-token");
    vi.mocked(findTouristByIdentity).mockImplementation(async (provider) =>
      provider === "anonymous_device" ? "guest-tourist" : null,
    );

    const response = await GET(
      new Request("https://travel.example/auth/callback?code=ok&next=%2Fpassport"),
    );

    expect(response.headers.get("location")).toBe(
      "https://travel.example/account/confirm-link?next=%2Fpassport",
    );
    expect(resolveTouristOAuthIdentity).not.toHaveBeenCalled();
  });

  it("creates or resolves a new OAuth tourist atomically when no guest passport exists", async () => {
    const response = await GET(
      new Request("https://travel.example/auth/callback?code=ok&next=%2Fprofile"),
    );

    expect(resolveTouristOAuthIdentity).toHaveBeenCalledWith({
      provider: "google",
      providerUserId: "auth-user-1",
      displayName: "ผู้เดินทาง",
    });
    expect(response.headers.get("location")).toBe("https://travel.example/profile");
  });

  it("never redirects to an external next value", async () => {
    vi.mocked(findTouristByIdentity).mockResolvedValue("tourist-1");

    const response = await GET(
      new Request(
        "https://travel.example/auth/callback?code=ok&next=https%3A%2F%2Fevil.example%2Fsteal",
      ),
    );

    expect(response.headers.get("location")).toBe("https://travel.example/profile");
  });
});
