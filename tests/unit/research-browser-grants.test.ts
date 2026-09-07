import { beforeEach, describe, expect, it, vi } from "vitest";
const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => ({ rpc }) }));
import { bindResearchBrowserGrant, resolveResearchBrowserGrant, revokeResearchBrowserGrant } from "@/lib/repositories/research-browser-grant.repository";
const code = "11111111-1111-4111-8111-111111111111";
const hash = "a".repeat(64);

describe("research browser grant repository", () => {
  beforeEach(() => vi.resetAllMocks());
  it("validates proof before database calls", async () => {
    await expect(bindResearchBrowserGrant({ browserTokenHash: "bad", publicSessionCode: code, accessTokenHash: hash, withdrawalTokenHash: hash })).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();
  });
  it("accepts only explicit boolean success for binding", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    expect(await bindResearchBrowserGrant({ browserTokenHash: hash, publicSessionCode: code, accessTokenHash: hash, withdrawalTokenHash: hash })).toBe(false);
    rpc.mockResolvedValue({ data: "true", error: null });
    await expect(bindResearchBrowserGrant({ browserTokenHash: hash, publicSessionCode: code, accessTokenHash: hash, withdrawalTokenHash: hash })).rejects.toThrow();
  });
  it("maps exactly one matching session and strips unexpected data", async () => {
    rpc.mockResolvedValue({ data: [{ public_session_code: code, access_token_hash: hash, withdrawal_token_hash: hash, visit_id: null, email: "private@example.test" }], error: null });
    const result = await resolveResearchBrowserGrant(hash, code);
    expect(result).toEqual({ publicSessionCode: code, accessTokenHash: hash, withdrawalTokenHash: hash, visitId: null });
    expect(JSON.stringify(result)).not.toContain("private");
  });
  it("returns null for absent grants and rejects mismatched or duplicate rows", async () => {
    rpc.mockResolvedValue({ data: [], error: null });
    expect(await resolveResearchBrowserGrant(hash, code)).toBeNull();
    const row = { public_session_code: "22222222-2222-4222-8222-222222222222", access_token_hash: hash, withdrawal_token_hash: hash, visit_id: null };
    rpc.mockResolvedValue({ data: [row], error: null });
    await expect(resolveResearchBrowserGrant(hash, code)).rejects.toThrow();
    rpc.mockResolvedValue({ data: [row, row], error: null });
    await expect(resolveResearchBrowserGrant(hash, code)).rejects.toThrow();
  });
  it("does not leak database details on failure", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "private database credential" } });
    await expect(revokeResearchBrowserGrant(hash, code)).rejects.toThrow("RESEARCH_GRANT_RPC_FAILED");
  });
  it("revokes only the requested browser/session pair", async () => {
    rpc.mockResolvedValue({ data: null, error: null });
    await revokeResearchBrowserGrant(hash, code);
    expect(rpc).toHaveBeenCalledWith("revoke_research_browser_grant", { p_browser_token_hash: hash, p_public_session_code: code });
  });
});
