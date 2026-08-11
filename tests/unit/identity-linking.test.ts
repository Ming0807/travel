import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  IdentityLinkingError,
  linkVerifiedIdentityToCurrentTourist,
} from "@/lib/services/identity-linking.service";
import { resolveCurrentTouristId } from "@/lib/auth/guards";
import { linkTouristIdentityWithConsent } from "@/lib/repositories/tourist-identity.repository";

vi.mock("@/lib/auth/guards", () => ({
  resolveCurrentTouristId: vi.fn(),
}));

vi.mock("@/lib/repositories/tourist-identity.repository", () => ({
  linkTouristIdentityWithConsent: vi.fn(),
}));

describe("linkVerifiedIdentityToCurrentTourist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveCurrentTouristId).mockResolvedValue("tourist-1");
    vi.mocked(linkTouristIdentityWithConsent).mockResolvedValue({ status: "linked" });
  });

  it("does not resolve or mutate identity without explicit account-linking consent", async () => {
    await expect(
      linkVerifiedIdentityToCurrentTourist({
        provider: "line",
        providerUserId: "line-user",
        hasConsented: false as true,
        language: "th",
      }),
    ).rejects.toMatchObject({ code: "CONSENT_REQUIRED" });

    expect(resolveCurrentTouristId).not.toHaveBeenCalled();
    expect(linkTouristIdentityWithConsent).not.toHaveBeenCalled();
  });

  it("links identity and purpose-specific consent in one repository operation", async () => {
    await expect(
      linkVerifiedIdentityToCurrentTourist({
        provider: "line",
        providerUserId: "line-user",
        hasConsented: true,
        language: "th",
      }),
    ).resolves.toEqual({
      status: "linked",
      provider: "line",
      touristId: "tourist-1",
    });

    expect(linkTouristIdentityWithConsent).toHaveBeenCalledWith({
      touristId: "tourist-1",
      provider: "line",
      providerUserId: "line-user",
      language: "th",
      consentVersion: "line_linking_v1",
      consentPurposeKey: "passport_recovery",
    });
  });

  it("returns already_linked without creating a second identity", async () => {
    vi.mocked(linkTouristIdentityWithConsent).mockResolvedValue({ status: "already_linked" });

    await expect(
      linkVerifiedIdentityToCurrentTourist({
        provider: "line",
        providerUserId: "line-user",
        hasConsented: true,
        language: "en",
      }),
    ).resolves.toMatchObject({ status: "already_linked" });
  });

  it("maps a provider conflict to a safe domain error", async () => {
    vi.mocked(linkTouristIdentityWithConsent).mockRejectedValue(new Error("IDENTITY_CONFLICT"));

    await expect(
      linkVerifiedIdentityToCurrentTourist({
        provider: "line",
        providerUserId: "line-user",
        hasConsented: true,
        language: "th",
      }),
    ).rejects.toEqual(
      expect.objectContaining<Partial<IdentityLinkingError>>({ code: "IDENTITY_CONFLICT" }),
    );
  });
});
