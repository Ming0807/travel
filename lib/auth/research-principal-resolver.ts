import "server-only";
import { z } from "zod";
import { getResearchSessionCredentials, getResearchVisitCredentials } from "@/lib/auth/research-session";
import { readResearchBrowserToken, hashResearchBrowserToken } from "@/lib/auth/research-browser";
import { resolveResearchBrowserContext } from "@/lib/repositories/research-browser-grant.repository";
import { principalFromBrowserGrant, principalFromLegacy, type ResearchPrincipal } from "@/lib/auth/research-principal";

export async function resolveResearchPrincipal(visitId?: string): Promise<ResearchPrincipal | null> {
  if (visitId !== undefined) {
    z.uuid().parse(visitId);
    const browser = await readResearchBrowserToken();
    if (browser) {
      const grant = await resolveResearchBrowserContext(hashResearchBrowserToken(browser), { kind: "visit", id: visitId });
      if (grant) return principalFromBrowserGrant(grant);
    }
  }
  // Preserve independently proven legacy access until migration is verified.
  // RPC failures are intentionally not caught and must not masquerade as absence.
  const legacy = visitId
    ? await getResearchVisitCredentials(visitId) ?? await getResearchSessionCredentials()
    : await getResearchSessionCredentials();
  return legacy ? principalFromLegacy(legacy) : null;
}
