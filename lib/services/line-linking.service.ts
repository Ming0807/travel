import "server-only";

import { verifyLineIdToken, LineVerificationError } from "@/lib/line/verify";
import { recordFunnelEvent } from "@/lib/repositories/funnel.repository";
import {
  IdentityLinkingError,
  linkVerifiedIdentityToCurrentTourist
} from "@/lib/services/identity-linking.service";
import type { LineLinkRequest } from "@/lib/validation/line";

export type LineLinkingResult = {
  status: "linked" | "already_linked";
  provider: "line";
};

export type LineLinkingErrorCode =
  | "LINE_NOT_CONFIGURED"
  | "LINE_TOKEN_INVALID"
  | "LINE_VERIFY_FAILED"
  | "TOURIST_IDENTITY_NOT_FOUND"
  | "IDENTITY_CONFLICT"
  | "CONSENT_REQUIRED"
  | "LINE_LINK_FAILED";

export class LineLinkingError extends Error {
  constructor(
    public readonly code: LineLinkingErrorCode,
    message: string
  ) {
    super(message);
    this.name = "LineLinkingError";
  }
}

function toLineLinkingError(error: unknown): LineLinkingError {
  if (error instanceof LineVerificationError) {
    return new LineLinkingError(error.code, error.message);
  }

  if (error instanceof IdentityLinkingError) {
    if (error.code === "IDENTITY_LINK_FAILED") {
      return new LineLinkingError("LINE_LINK_FAILED", error.message);
    }

    return new LineLinkingError(error.code, error.message);
  }

  return new LineLinkingError("LINE_LINK_FAILED", "Could not link LINE right now.");
}

export async function linkCurrentTouristWithLine(input: LineLinkRequest): Promise<LineLinkingResult> {
  try {
    await recordFunnelEvent({ eventName: "line_link_started" });

    const verifiedIdentity = await verifyLineIdToken(input.idToken);
    const linking = await linkVerifiedIdentityToCurrentTourist({
      provider: "line",
      providerUserId: verifiedIdentity.providerUserId,
      hasConsented: true,
      language: input.language
    });

    await recordFunnelEvent({
      eventName: "line_link_completed",
      touristId: linking.touristId
    });

    return {
      status: linking.status,
      provider: "line"
    };
  } catch (error) {
    await recordFunnelEvent({ eventName: "line_link_failed" });
    throw toLineLinkingError(error);
  }
}

export async function verifyLineTokenForClient(input: Pick<LineLinkRequest, "idToken">) {
  try {
    const verifiedIdentity = await verifyLineIdToken(input.idToken);

    return {
      provider: "line" as const,
      displayName: verifiedIdentity.displayName
    };
  } catch (error) {
    throw toLineLinkingError(error);
  }
}
