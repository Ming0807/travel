import "server-only";

import { resolveCurrentTouristId } from "@/lib/auth/guards";
import {
  createTouristIdentityLink,
  findTouristIdentityByProvider,
  touchTouristIdentity,
  type TouristIdentityProvider
} from "@/lib/repositories/tourist-identity.repository";
import { createConsentRecord } from "@/lib/repositories/consent.repository";

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
      "No current guest passport was found for account linking."
    );
  }

  const existingIdentity = await findTouristIdentityByProvider(params.provider, params.providerUserId);

  if (existingIdentity) {
    if (existingIdentity.touristId !== touristId) {
      throw new IdentityLinkingError("IDENTITY_CONFLICT", "This account is already linked to another passport.");
    }

    await touchTouristIdentity(existingIdentity.identityId);
    await createConsentRecord({
      touristId,
      consentVersion: "line_linking_v1",
      purpose: "Optional account linking for digital passport recovery.",
      consentType: `${params.provider}_account_linking`,
      purposeKey: "passport_recovery",
      hasConsented: true,
      source: params.provider === "line" ? "line_liff" : "web",
      language: params.language,
      metadata: {
        provider: params.provider,
        status: "already_linked"
      }
    });

    return {
      status: "already_linked",
      provider: params.provider,
      touristId
    } satisfies IdentityLinkingResult;
  }

  try {
    await createTouristIdentityLink({
      touristId,
      provider: params.provider,
      providerUserId: params.providerUserId,
      isPrimary: false
    });

    await createConsentRecord({
      touristId,
      consentVersion: "line_linking_v1",
      purpose: "Optional account linking for digital passport recovery.",
      consentType: `${params.provider}_account_linking`,
      purposeKey: "passport_recovery",
      hasConsented: true,
      source: params.provider === "line" ? "line_liff" : "web",
      language: params.language,
      metadata: {
        provider: params.provider,
        status: "linked"
      }
    });
  } catch (error) {
    if (error instanceof IdentityLinkingError) {
      throw error;
    }

    throw new IdentityLinkingError("IDENTITY_LINK_FAILED", "Could not link this account right now.");
  }

  return {
    status: "linked",
    provider: params.provider,
    touristId
  } satisfies IdentityLinkingResult;
}
