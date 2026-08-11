import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  confirmGuestPassportLinkAction,
  createSeparateTouristAccountAction,
} from "@/app/actions/tourist-account-actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getGuestIdentity } from "@/lib/auth/guest";
import {
  findTouristByIdentity,
  resolveTouristOAuthIdentity,
} from "@/lib/repositories/tourist.repository";
import { linkTouristIdentityWithConsent } from "@/lib/repositories/tourist-identity.repository";
import { redirect } from "next/navigation";

vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock("@/lib/auth/guest", () => ({ getGuestIdentity: vi.fn() }));
vi.mock("@/lib/repositories/tourist.repository", () => ({
  findTouristByIdentity: vi.fn(),
  resolveTouristOAuthIdentity: vi.fn(),
}));
vi.mock("@/lib/repositories/tourist-identity.repository", () => ({
  linkTouristIdentityWithConsent: vi.fn(),
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const getUser = vi.fn();

describe("tourist account actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createSupabaseServerClient).mockResolvedValue({ auth: { getUser } } as never);
    getUser.mockResolvedValue({
      data: {
        user: {
          id: "auth-user",
          app_metadata: { provider: "google" },
          user_metadata: { full_name: "ผู้เดินทาง" },
        },
      },
      error: null,
    });
    vi.mocked(getGuestIdentity).mockResolvedValue("guest-token");
    vi.mocked(findTouristByIdentity).mockResolvedValue("guest-tourist");
    vi.mocked(linkTouristIdentityWithConsent).mockResolvedValue({ status: "linked" });
    vi.mocked(resolveTouristOAuthIdentity).mockResolvedValue({
      touristId: "new-tourist",
      status: "created",
    });
  });

  it("requires an explicit merge confirmation", async () => {
    const formData = new FormData();
    formData.set("next", "/passport");

    await confirmGuestPassportLinkAction(formData);

    expect(linkTouristIdentityWithConsent).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith(
      "/account/confirm-link?error=confirmation_required&next=%2Fpassport",
    );
  });

  it("atomically links the authenticated provider to the guest passport", async () => {
    const formData = new FormData();
    formData.set("confirm", "yes");
    formData.set("next", "/passport");

    await confirmGuestPassportLinkAction(formData);

    expect(linkTouristIdentityWithConsent).toHaveBeenCalledWith({
      touristId: "guest-tourist",
      provider: "google",
      providerUserId: "auth-user",
      language: "th",
      consentVersion: "account_linking_v1",
      consentPurposeKey: "passport_recovery",
    });
    expect(redirect).toHaveBeenCalledWith("/passport");
  });

  it("can keep the guest passport separate and create the signed-in profile", async () => {
    const formData = new FormData();
    formData.set("next", "/profile");

    await createSeparateTouristAccountAction(formData);

    expect(linkTouristIdentityWithConsent).not.toHaveBeenCalled();
    expect(resolveTouristOAuthIdentity).toHaveBeenCalledWith({
      provider: "google",
      providerUserId: "auth-user",
      displayName: "ผู้เดินทาง",
    });
    expect(redirect).toHaveBeenCalledWith("/profile");
  });
});
