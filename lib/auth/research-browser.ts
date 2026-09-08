import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { requireTouristVisitAccess } from "@/lib/auth/guards";
import { getResearchSessionForAccess } from "@/lib/repositories/research.repository";
import { bindResearchBrowserGrant, resolveResearchBrowserContext } from "@/lib/repositories/research-browser-grant.repository";
import { clearResearchVisitCredentials, getResearchVisitCredentials, getResearchSessionCredentials, hashResearchToken } from "@/lib/auth/research-session";

export async function bindLegacyResearchEntryGrant(entrySessionId: string): Promise<boolean> {
  const browser = await readResearchBrowserToken();
  if (!browser) return false;
  const legacy = await getResearchSessionCredentials(entrySessionId);
  if (!legacy) return false;
  const browserTokenHash = hashResearchBrowserToken(browser);
  if (!await bindResearchBrowserGrant({ browserTokenHash, publicSessionCode: legacy.publicSessionCode,
    accessTokenHash: hashResearchToken(legacy.accessToken), withdrawalTokenHash: hashResearchToken(legacy.withdrawalToken) })) return false;
  const grant = await resolveResearchBrowserContext(browserTokenHash, { kind: "entry", id: entrySessionId });
  // Keep old cookies: a historical session without exact provenance cannot migrate.
  return Boolean(grant && grant.entrySessionId === entrySessionId && grant.publicSessionCode === legacy.publicSessionCode);
}

export const RESEARCH_BROWSER_COOKIE = "__Host-sbtp_research_browser";
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;
const maxAge = 60 * 60 * 24 * 30;

export function createResearchBrowserToken() { return randomBytes(32).toString("base64url"); }

export function hashResearchBrowserToken(token: string) {
  if (!tokenPattern.test(token)) throw new Error("RESEARCH_BROWSER_TOKEN_INVALID");
  return createHash("sha256").update(token).digest("hex");
}

export async function readResearchBrowserToken() {
  const value = (await cookies()).get(RESEARCH_BROWSER_COOKIE)?.value;
  return value && tokenPattern.test(value) ? value : null;
}

// Provision on a preceding response, never independently inside concurrent accepts.
export async function writeResearchBrowserToken(token: string) {
  hashResearchBrowserToken(token);
  (await cookies()).set(RESEARCH_BROWSER_COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge });
}

export async function migrateResearchVisitCredential(visitId: string): Promise<boolean> {
  z.uuid().parse(visitId);
  const browserToken = await readResearchBrowserToken();
  if (!browserToken) return false;
  const legacy = await getResearchVisitCredentials(visitId);
  if (!legacy) return false;
  await requireTouristVisitAccess(visitId);
  const session = await getResearchSessionForAccess(legacy.publicSessionCode, hashResearchToken(legacy.accessToken));
  if (!session || session.publicSessionCode !== legacy.publicSessionCode || session.visitId !== visitId
    || session.participantType !== "tourist" || session.withdrawnAt
    || !["consented", "in_progress", "completed"].includes(session.status)) return false;
  const browserTokenHash = hashResearchBrowserToken(browserToken);
  const bound = await bindResearchBrowserGrant({ browserTokenHash, publicSessionCode: legacy.publicSessionCode,
    accessTokenHash: hashResearchToken(legacy.accessToken), withdrawalTokenHash: hashResearchToken(legacy.withdrawalToken) });
  if (!bound) return false;
  const grant = await resolveResearchBrowserContext(browserTokenHash, { kind: "visit", id: visitId });
  if (!grant || grant.visitId !== visitId || grant.publicSessionCode !== legacy.publicSessionCode) return false;
  // Only retire this cookie after both proof and exact Visit association succeed.
  await writeResearchBrowserToken(browserToken);
  await clearResearchVisitCredentials(visitId);
  return true;
}
