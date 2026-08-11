import "server-only";

import { resolveCurrentTouristId } from "@/lib/auth/guards";
import {
  linkTouristIdentityWithConsent,
  type TouristIdentityProvider
} from "@/lib/repositories/tourist-identity.repository";

export type IdentityLinkingStatus = "linked" | "already_linked";

export type IdentityLinkingResult = {
  status: IdentityLinkingStatus;
  provider: TouristIdentityProvider;
  touristId: string;
};

export type IdentityLinkingErrorCode =
  | "TOURIST_IDENTITY_NOT_FOUND"
  | "IDENTITY_CONFLICT"
  | "CONSENT_REQUIRED"
  | "IDENTITY_LINK_FAILED";

export class IdentityLinkingError extends Error {
  constructor(
    public readonly code: IdentityLinkingErrorCode,
    message: string
  ) {
    super(message);
    this.name = "IdentityLinkingError";
  }
}

export async function linkVerifiedIdentityToCurrentTourist(params: {
  provider: TouristIdentityProvider;
  providerUserId: string;
  hasConsented: true;
  language: "th" | "en";
}) {
  if (!params.hasConsented) {
    throw new IdentityLinkingError("CONSENT_REQUIRED", "Consent is required before account linking.");
  }

  let touristId: string;
  try {
    touristId = await resolveCurrentTouristId();
  } catch {
    throw new IdentityLinkingError(
      "TOURIST_IDENTITY_NOT_FOUND",
      "No current passport was found for account linking. Please create a passport first."
    );
  }

  try {
    if (params.provider === "anonymous_device") {
      throw new IdentityLinkingError("IDENTITY_LINK_FAILED", "Guest identities cannot be linked here.");
    }

    const linking = await linkTouristIdentityWithConsent({
      touristId,
      provider: params.provider,
      providerUserId: params.providerUserId,
      language: params.language,
      consentVersion: "line_linking_v1",
      consentPurposeKey: "passport_recovery",
    });

    return {
      status: linking.status,
      provider: params.provider,
      touristId,
    } satisfies IdentityLinkingResult;
  } catch (error) {
    if (error instanceof IdentityLinkingError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "";
    if (message.includes("IDENTITY_CONFLICT")) {
      throw new IdentityLinkingError("IDENTITY_CONFLICT", "This account is already linked to another passport.");
    }

    throw new IdentityLinkingError("IDENTITY_LINK_FAILED", "Could not link this account right now.");
  }
}
