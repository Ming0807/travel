import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), client: vi.fn(), guard: vi.fn(), audit: vi.fn() }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: mocks.client }));
vi.mock("@/lib/auth/guards", () => ({ requirePermission: mocks.guard }));
vi.mock("@/lib/services/audit-log.service", () => ({ logAuditAction: mocks.audit }));
import { listNfcRecoveryReview, listNfcRecoveryReviewHistory } from "@/lib/repositories/nfc-recovery-review.repository";
import { getNfcRecoveryReview, getNfcRecoveryReviewHistory } from "@/lib/services/nfc-recovery-review.service";

const tagId = "40000000-0000-4000-8000-000000000001";
const assetId = "40000000-0000-4000-8000-000000000002";
const time = "2026-09-11T00:00:00Z";
const row = () => ({ asset_id: assetId, tag_version: 1, intent_state: "prepared", created_at: time,
  attempt_count: 0, last_attempt_at: null, next_attempt_at: time, last_outcome: null, completed_at: null, status: "ready" });
const event = (id: number) => ({ event_id: String(id), occurred_at: time, event_type: "queued", attempt_count: 0, outcome: null, next_attempt_at: time });
afterEach(() => vi.unstubAllEnvs());
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv("NFC_EVIDENCE_RECOVERY_ENABLED", "true");
  mocks.client.mockReturnValue({ rpc: mocks.rpc });
  mocks.guard.mockResolvedValue({ actor: { adminId: "test-admin" } });
  mocks.audit.mockResolvedValue(undefined);
  mocks.rpc.mockResolvedValue({ data: { rows: [row()], page: 1 }, error: null });
});
describe("metadata review repository", () => {
  it("reads a bounded tag scope and returns paging metadata", async () => {
    expect(await listNfcRecoveryReview({ tagId })).toEqual({ rows: [row()], page: 1, pageSize: 20, hasMore: false });
    expect(mocks.rpc).toHaveBeenCalledWith("list_nfc_evidence_recovery", { p_tag_id: tagId, p_page: 1 });
  });
  it.each([{ tagId: "bad" }, { tagId, page: 10001 }, { tagId, actorId: assetId }])("rejects invalid or extra input before database access", async input => {
    await expect(listNfcRecoveryReview(input)).rejects.toThrow(); expect(mocks.client).not.toHaveBeenCalled();
  });
  it("rejects private fields returned accidentally by a changed RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { rows: [{ ...row(), lease_token: assetId }], page: 1 }, error: null });
    await expect(listNfcRecoveryReview({ tagId })).rejects.toThrow("NFC_RECOVERY_REVIEW_RESPONSE_INVALID");
  });
  it("rejects duplicate rows and an inconsistent completion status", async () => {
    mocks.rpc.mockResolvedValueOnce({ data: { rows: [row(), row()], page: 1 }, error: null });
    await expect(listNfcRecoveryReview({ tagId })).rejects.toThrow("NFC_RECOVERY_REVIEW_RESPONSE_INVALID");
    mocks.rpc.mockResolvedValueOnce({ data: { rows: [{ ...row(), status: "completed" }], page: 1 }, error: null });
    await expect(listNfcRecoveryReview({ tagId })).rejects.toThrow("NFC_RECOVERY_REVIEW_RESPONSE_INVALID");
  });
  it("sanitizes database errors", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "private path and connection details" } });
    await expect(listNfcRecoveryReview({ tagId })).rejects.toThrow("NFC_RECOVERY_REVIEW_FAILED");
  });
  it("uses the last displayed history event as cursor, not the lookahead row", async () => {
    mocks.rpc.mockResolvedValue({ data: { rows: Array.from({ length: 21 }, (_, index) => event(30 - index)) }, error: null });
    const result = await listNfcRecoveryReviewHistory({ tagId, assetId });
    expect(result.rows).toHaveLength(20); expect(result.nextBeforeId).toBe("11");
    expect(mocks.rpc).toHaveBeenCalledWith("list_nfc_evidence_recovery_history", { p_tag_id: tagId, p_asset_id: assetId, p_before_id: null });
  });
  it("rejects unordered history or cursor values outside PostgreSQL bigint", async () => {
    mocks.rpc.mockResolvedValue({ data: { rows: [event(1), event(2)] }, error: null });
    await expect(listNfcRecoveryReviewHistory({ tagId, assetId })).rejects.toThrow("NFC_RECOVERY_REVIEW_RESPONSE_INVALID");
    mocks.client.mockClear();
    await expect(listNfcRecoveryReviewHistory({ tagId, assetId, beforeId: "9223372036854775808" })).rejects.toThrow();
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it("rejects malformed event IDs with a bounded response error", async () => {
    mocks.rpc.mockResolvedValue({ data: { rows: [{ ...event(1), event_id: "not-an-id" }] }, error: null });
    await expect(listNfcRecoveryReviewHistory({ tagId, assetId })).rejects.toThrow("NFC_RECOVERY_REVIEW_RESPONSE_INVALID");
  });
});
describe("operator authorization and audit", () => {
  it("checks manage permission before reading and audits only bounded metadata", async () => {
    expect(await getNfcRecoveryReview({ tagId })).toMatchObject({ enabled: true, page: 1 });
    expect(mocks.guard).toHaveBeenCalledWith("checkin_code.manage");
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: "nfc_recovery.review_read", entityId: tagId,
      metadata: { page: 1, count: 1, hasMore: false } }));
  });
  it("does not access the database or audit successful reads on permission denial", async () => {
    mocks.guard.mockRejectedValue(new Error("FORBIDDEN"));
    await expect(getNfcRecoveryReview({ tagId })).rejects.toThrow("FORBIDDEN");
    expect(mocks.client).not.toHaveBeenCalled(); expect(mocks.audit).not.toHaveBeenCalled();
  });
  it("keeps held tables untouched when the gate is disabled", async () => {
    vi.stubEnv("NFC_EVIDENCE_RECOVERY_ENABLED", "false");
    expect(await getNfcRecoveryReview({ tagId })).toEqual({ enabled: false });
    expect(await getNfcRecoveryReviewHistory({ tagId, assetId })).toEqual({ enabled: false });
    expect(mocks.client).not.toHaveBeenCalled();
  });
  it("rejects malformed feature flags without database access", async () => {
    vi.stubEnv("NFC_EVIDENCE_RECOVERY_ENABLED", "yes");
    await expect(getNfcRecoveryReview({ tagId })).rejects.toThrow(); expect(mocks.client).not.toHaveBeenCalled();
  });
  it("audits successful history without provider metadata", async () => {
    mocks.rpc.mockResolvedValue({ data: { rows: [event(1)] }, error: null });
    expect(await getNfcRecoveryReviewHistory({ tagId, assetId })).toMatchObject({ enabled: true, nextBeforeId: null });
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ action: "nfc_recovery.history_read", entityId: assetId,
      metadata: { tagId, count: 1, hasMore: false } }));
  });
});
