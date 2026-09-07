import "server-only";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const identity = z.object({ browserTokenHash: hash, publicSessionCode: z.uuid() });
const proof = identity.extend({ accessTokenHash: hash, withdrawalTokenHash: hash });
const grantRow = z.object({ public_session_code: z.uuid(), access_token_hash: hash, withdrawal_token_hash: hash, visit_id: z.uuid().nullable() });

// These hashes are RPC capabilities. Never include this result in client props.
export type ResearchBrowserGrant = { publicSessionCode: string; accessTokenHash: string; withdrawalTokenHash: string; visitId: string | null };
const context = z.object({ kind: z.enum(["visit", "entry"]), id: z.uuid() }).strict();
export type ResearchGrantContext = z.infer<typeof context>;

export async function resolveResearchBrowserContext(browserTokenHash: string, input: ResearchGrantContext): Promise<(ResearchBrowserGrant & { entrySessionId: string | null }) | null> {
  const browser = hash.parse(browserTokenHash);
  const parsed = context.parse(input);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("resolve_research_browser_context", {
    p_browser_token_hash: browser, p_context_kind: parsed.kind, p_context_id: parsed.id,
  });
  if (error) throw new Error("RESEARCH_GRANT_RPC_FAILED");
  const rows = z.array(grantRow.extend({ entry_session_id: z.uuid().nullable() })).max(1).parse(data);
  if (!rows.length) return null;
  const row = rows[0];
  if ((parsed.kind === "visit" ? row.visit_id : row.entry_session_id) !== parsed.id) {
    throw new Error("RESEARCH_GRANT_CONTEXT_MISMATCH");
  }
  return { publicSessionCode: row.public_session_code, accessTokenHash: row.access_token_hash,
    withdrawalTokenHash: row.withdrawal_token_hash, visitId: row.visit_id, entrySessionId: row.entry_session_id };
}

export async function bindResearchBrowserGrant(input: z.infer<typeof proof>): Promise<boolean> {
  const parsed = proof.parse(input);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("bind_research_browser_grant", {
    p_browser_token_hash: parsed.browserTokenHash, p_public_session_code: parsed.publicSessionCode,
    p_access_token_hash: parsed.accessTokenHash, p_withdrawal_token_hash: parsed.withdrawalTokenHash,
  });
  if (error) throw new Error("RESEARCH_GRANT_RPC_FAILED");
  return z.boolean().parse(data);
}

export async function resolveResearchBrowserGrant(browserTokenHash: string, publicSessionCode: string): Promise<ResearchBrowserGrant | null> {
  const parsed = identity.parse({ browserTokenHash, publicSessionCode });
  const { data, error } = await createSupabaseServiceRoleClient().rpc("resolve_research_browser_grant", {
    p_browser_token_hash: parsed.browserTokenHash, p_public_session_code: parsed.publicSessionCode,
  });
  if (error) throw new Error("RESEARCH_GRANT_RPC_FAILED");
  const rows = z.array(grantRow).max(1).parse(data);
  if (!rows.length) return null;
  const row = rows[0];
  if (row.public_session_code !== parsed.publicSessionCode) throw new Error("RESEARCH_GRANT_SESSION_MISMATCH");
  return { publicSessionCode: row.public_session_code, accessTokenHash: row.access_token_hash, withdrawalTokenHash: row.withdrawal_token_hash, visitId: row.visit_id };
}

export async function revokeResearchBrowserGrant(browserTokenHash: string, publicSessionCode: string): Promise<void> {
  const parsed = identity.parse({ browserTokenHash, publicSessionCode });
  const { error } = await createSupabaseServiceRoleClient().rpc("revoke_research_browser_grant", {
    p_browser_token_hash: parsed.browserTokenHash, p_public_session_code: parsed.publicSessionCode,
  });
  if (error) throw new Error("RESEARCH_GRANT_RPC_FAILED");
}
