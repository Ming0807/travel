import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { cookies } from "next/headers";

import { getCheckinSessionId } from "@/lib/auth/checkin-session";

export const RESEARCH_SESSION_COOKIE = "sbtp_research_session";
export const RESEARCH_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

type ResearchSessionCookiePayload = {
  version: 1;
  publicSessionCode: string;
  accessToken: string;
  withdrawalToken: string;
  operationalSessionToken: string;
};

export type ResearchSessionCredentials = ResearchSessionCookiePayload;

export type ResearchTokenPair = {
  accessToken: string;
  withdrawalToken: string;
  accessTokenHash: string;
  withdrawalTokenHash: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const OPAQUE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43,}$/;

function createOpaqueToken() {
  return randomBytes(32).toString("base64url");
}

function isOpaqueToken(value: unknown): value is string {
  return typeof value === "string" && OPAQUE_TOKEN_PATTERN.test(value);
}

function isOperationalSessionToken(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 200;
}

export function hashResearchToken(rawToken: string) {
  return createHash("sha256").update(rawToken, "utf8").digest("hex");
}

export function createResearchTokenPair(): ResearchTokenPair {
  const accessToken = createOpaqueToken();
  const withdrawalToken = createOpaqueToken();

  return {
    accessToken,
    withdrawalToken,
    accessTokenHash: hashResearchToken(accessToken),
    withdrawalTokenHash: hashResearchToken(withdrawalToken),
  };
}

export function createResearchCredentials(
  publicSessionCode: string,
  operationalSessionToken = createOpaqueToken(),
  tokenPair = createResearchTokenPair(),
): ResearchSessionCredentials & ResearchTokenPair {
  return {
    version: 1,
    publicSessionCode,
    operationalSessionToken,
    ...tokenPair,
  };
}

function encodeCookieValue(credentials: ResearchSessionCredentials) {
  const payload: ResearchSessionCookiePayload = {
    version: 1,
    publicSessionCode: credentials.publicSessionCode,
    accessToken: credentials.accessToken,
    withdrawalToken: credentials.withdrawalToken,
    operationalSessionToken: credentials.operationalSessionToken,
  };

  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function parseResearchSessionCookie(value: string | undefined): ResearchSessionCredentials | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<ResearchSessionCookiePayload>;

    if (
      parsed.version !== 1 ||
      typeof parsed.publicSessionCode !== "string" ||
      !UUID_PATTERN.test(parsed.publicSessionCode) ||
      !isOpaqueToken(parsed.accessToken) ||
      !isOpaqueToken(parsed.withdrawalToken) ||
      !isOperationalSessionToken(parsed.operationalSessionToken)
    ) {
      return null;
    }

    return {
      version: 1,
      publicSessionCode: parsed.publicSessionCode,
      accessToken: parsed.accessToken,
      withdrawalToken: parsed.withdrawalToken,
      operationalSessionToken: parsed.operationalSessionToken,
    };
  } catch {
    return null;
  }
}

export async function getResearchSessionCredentials(): Promise<ResearchSessionCredentials | null> {
  const cookieStore = await cookies();
  return parseResearchSessionCookie(cookieStore.get(RESEARCH_SESSION_COOKIE)?.value);
}

export async function setResearchSessionCredentials(credentials: ResearchSessionCredentials) {
  const cookieStore = await cookies();
  cookieStore.set(RESEARCH_SESSION_COOKIE, encodeCookieValue(credentials), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: RESEARCH_SESSION_MAX_AGE,
  });
}

export async function clearResearchSessionCredentials() {
  const cookieStore = await cookies();
  cookieStore.delete(RESEARCH_SESSION_COOKIE);
}

export async function getResearchOperationalSessionToken() {
  const existing = await getResearchSessionCredentials();
  if (existing?.operationalSessionToken) return existing.operationalSessionToken;

  const checkinSessionId = await getCheckinSessionId();
  return checkinSessionId || createOpaqueToken();
}
