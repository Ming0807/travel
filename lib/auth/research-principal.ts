import "server-only";
import { hashResearchToken, type ResearchSessionCredentials } from "@/lib/auth/research-session";
import type { ResearchBrowserGrant } from "@/lib/repositories/research-browser-grant.repository";

// Server-side capabilities only. Never serialize this principal into client props.
export type ResearchPrincipal = {
  source: "legacy" | "browser_grant";
  publicSessionCode: string;
  accessTokenHash: string;
  withdrawalTokenHash: string;
};

export function principalFromLegacy(credentials: ResearchSessionCredentials): ResearchPrincipal {
  return { source: "legacy", publicSessionCode: credentials.publicSessionCode,
    accessTokenHash: hashResearchToken(credentials.accessToken),
    withdrawalTokenHash: hashResearchToken(credentials.withdrawalToken) };
}

export function principalFromBrowserGrant(grant: ResearchBrowserGrant): ResearchPrincipal {
  return { source: "browser_grant", publicSessionCode: grant.publicSessionCode,
    accessTokenHash: grant.accessTokenHash, withdrawalTokenHash: grant.withdrawalTokenHash };
}
