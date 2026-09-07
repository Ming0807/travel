import { beforeEach, describe, expect, it, vi } from "vitest";
const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => ({ rpc }) }));
import { acceptResearchBrowserInvitation, bindResearchBrowserGrant, resolveResearchBrowserGrant, resolveResearchBrowserContext, revokeResearchBrowserGrant } from "@/lib/repositories/research-browser-grant.repository";
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
  it("resolves only an exact Visit or entry context", async () => {
    const row = { public_session_code: code, access_token_hash: hash, withdrawal_token_hash: hash, visit_id: code, entry_session_id: code };
    rpc.mockResolvedValue({ data: [row], error: null });
    for (const kind of ["visit", "entry"] as const) {
      expect(await resolveResearchBrowserContext(hash, { kind, id: code })).toMatchObject({ publicSessionCode: code, visitId: code, entrySessionId: code });
      expect(rpc).toHaveBeenLastCalledWith("resolve_research_browser_context", { p_browser_token_hash: hash, p_context_kind: kind, p_context_id: code });
    }
  });
  it("rejects context substitution and duplicate results", async () => {
    const row = { public_session_code: code, access_token_hash: hash, withdrawal_token_hash: hash, visit_id: null, entry_session_id: null };
    rpc.mockResolvedValue({ data: [row], error: null });
    for (const kind of ["visit", "entry"] as const) {
      await expect(resolveResearchBrowserContext(hash, { kind, id: code })).rejects.toThrow("RESEARCH_GRANT_CONTEXT_MISMATCH");
    }
    rpc.mockResolvedValue({ data: [row, row], error: null });
    await expect(resolveResearchBrowserContext(hash, { kind: "visit", id: code })).rejects.toThrow();
    rpc.mockResolvedValue({ data: [], error: null });
    expect(await resolveResearchBrowserContext(hash, { kind: "entry", id: code })).toBeNull();
  });
  it("validates context before RPC and contains backend errors", async () => {
    await expect(resolveResearchBrowserContext(hash, { kind: "entry", id: "invalid" })).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();
    rpc.mockResolvedValue({ data: null, error: { message: "private credential" } });
    await expect(resolveResearchBrowserContext(hash, { kind: "entry", id: code })).rejects.toThrow("RESEARCH_GRANT_RPC_FAILED");
  });
  const acceptanceInput = { browserTokenHash: hash, entryBrowserHash: hash, entrySessionId: code,
    studyCode: "pilot-yala", checkinCode: "yala-001", operationalSessionHash: hash,
    accessTokenHash: hash, withdrawalTokenHash: hash, language: "th" as const };
  it("validates atomic acceptance before writing", async () => {
    await expect(acceptResearchBrowserInvitation({ ...acceptanceInput, entryBrowserHash: "invalid" })).rejects.toThrow();
    expect(rpc).not.toHaveBeenCalled();
  });
  it("returns acceptance metadata without exposing proposed or returned capabilities", async () => {
    const result = { success: true, already_exists: true, public_session_code: code, collection_mode: "pilot_internal" };
    rpc.mockResolvedValue({ data: { ...result, access_token_hash: hash, withdrawal_token_hash: hash }, error: null });
    expect(await acceptResearchBrowserInvitation(acceptanceInput)).toEqual(result);
    expect(rpc).toHaveBeenCalledWith("accept_research_browser_invitation", {
      p_browser_token_hash: hash, p_entry_browser_hash: hash, p_entry_session_id: code,
      p_study_code: "pilot-yala", p_checkin_code: "yala-001", p_operational_session_hash: hash,
      p_access_token_hash: hash, p_withdrawal_token_hash: hash, p_language: "th",
    });
  });
  it("preserves known refusal codes and sanitizes unknown responses", async () => {
    rpc.mockResolvedValue({ data: { success: false, error_code: "RESEARCH_GRANT_MIGRATION_REQUIRED" }, error: null });
    expect(await acceptResearchBrowserInvitation(acceptanceInput)).toEqual({ success: false, error_code: "RESEARCH_GRANT_MIGRATION_REQUIRED" });
    for (const data of [null, { success: true }, { success: false, error_code: "private database detail" }]) {
      rpc.mockResolvedValue({ data, error: null });
      await expect(acceptResearchBrowserInvitation(acceptanceInput)).rejects.toThrow("RESEARCH_GRANT_RESPONSE_INVALID");
    }
  });
});
