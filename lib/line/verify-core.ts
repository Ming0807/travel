const LINE_ID_TOKEN_VERIFY_URL = "https://api.line.me/oauth2/v2.1/verify";

export type VerifiedLineIdentity = {
  provider: "line";
  providerUserId: string;
  displayName: string | null;
  pictureUrl: string | null;
};

export type LineVerificationErrorCode =
  | "LINE_NOT_CONFIGURED"
  | "LINE_TOKEN_INVALID"
  | "LINE_VERIFY_FAILED";

export class LineVerificationError extends Error {
  constructor(
    public readonly code: LineVerificationErrorCode,
    message: string
  ) {
    super(message);
    this.name = "LineVerificationError";
  }
}

type LineVerifyResponse = {
  sub?: unknown;
  aud?: unknown;
  name?: unknown;
  picture?: unknown;
};

function readSafeString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function verifyLineIdTokenWithChannel(params: {
  idToken: string;
  channelId: string;
  fetchImpl?: typeof fetch;
}): Promise<VerifiedLineIdentity> {
  const channelId = params.channelId.trim();

  if (!channelId) {
    throw new LineVerificationError("LINE_NOT_CONFIGURED", "LINE is not configured for this environment.");
  }

  const formData = new URLSearchParams();
  formData.set("id_token", params.idToken);
  formData.set("client_id", channelId);

  const response = await (params.fetchImpl ?? fetch)(LINE_ID_TOKEN_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData
  });

  if (!response.ok) {
    throw new LineVerificationError("LINE_TOKEN_INVALID", "LINE verification failed.");
  }

  let payload: LineVerifyResponse;
  try {
    payload = (await response.json()) as LineVerifyResponse;
  } catch {
    throw new LineVerificationError("LINE_VERIFY_FAILED", "LINE verification returned an invalid response.");
  }

  const providerUserId = readSafeString(payload.sub);
  const audience = readSafeString(payload.aud);

  if (!providerUserId) {
    throw new LineVerificationError("LINE_TOKEN_INVALID", "LINE verification did not return a valid identity.");
  }

  if (audience && audience !== channelId) {
    throw new LineVerificationError("LINE_TOKEN_INVALID", "LINE token audience is invalid.");
  }

  return {
    provider: "line",
    providerUserId,
    displayName: readSafeString(payload.name),
    pictureUrl: readSafeString(payload.picture)
  };
}
