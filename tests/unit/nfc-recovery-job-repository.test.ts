import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => mocks }));
import { claimNfcRecoveryJobs, renewNfcRecoveryLease, deferNfcRecoveryJob } from "@/lib/repositories/nfc-recovery-job.repository";
const id = "40000000-0000-4000-8000-000000000001", token = "40000000-0000-4000-8000-000000000002";
const input = { assetId: id, leaseToken: token };
const row = { asset_id: id, lease_token: token, next_attempt_at: "2026-09-11T00:00:00Z", last_attempt_at: "2026-09-11T00:00:01Z",
  lease_expires_at: "2026-09-11T00:02:01Z", attempt_count: 1, last_outcome: null, review_required: false, completed_at: null };
beforeEach(() => { vi.resetAllMocks(); mocks.rpc.mockResolvedValue({ data: [row], error: null }); });
it("validates bounded claims and uses the exact RPC", async () => {
  expect(await claimNfcRecoveryJobs()).toEqual([row]);
  expect(mocks.rpc).toHaveBeenCalledWith("claim_nfc_evidence_recovery", { p_limit: 1 });
});
it.each([0, 6, 1.5, NaN])("rejects invalid batch %s before RPC", async limit => {
  await expect(claimNfcRecoveryJobs(limit)).rejects.toThrow(); expect(mocks.rpc).not.toHaveBeenCalled();
});
it.each([null, [row, row], [{ ...row, lease_token: null }], [{ ...row, review_required: true }],
  [{ ...row, completed_at: row.last_attempt_at }], [{ ...row, lease_expires_at: row.last_attempt_at }],
  [{ ...row, next_attempt_at: row.lease_expires_at }], [{ ...row, raw_error: "secret" }]])("rejects malformed claims", async data => {
  mocks.rpc.mockResolvedValue({ data, error: null });
  await expect(claimNfcRecoveryJobs(5)).rejects.toThrow("NFC_RECOVERY_RESPONSE_INVALID");
});
it("accepts an empty queue", async () => {
  mocks.rpc.mockResolvedValue({ data: [], error: null }); expect(await claimNfcRecoveryJobs()).toEqual([]);
});
it("validates renewal acknowledgement and token forwarding", async () => {
  mocks.rpc.mockResolvedValue({ data: row.lease_expires_at, error: null });
  expect(await renewNfcRecoveryLease(input)).toBe(row.lease_expires_at);
  expect(mocks.rpc).toHaveBeenCalledWith("renew_nfc_evidence_recovery", { p_asset_id: id, p_lease_token: token });
  mocks.rpc.mockResolvedValue({ data: true, error: null });
  await expect(renewNfcRecoveryLease(input)).rejects.toThrow("NFC_RECOVERY_RESPONSE_INVALID");
});
it("requires literal true for a deferred job", async () => {
  mocks.rpc.mockResolvedValue({ data: true, error: null });
  expect(await deferNfcRecoveryJob({ ...input, outcome: "absent" })).toBe(true);
  expect(mocks.rpc).toHaveBeenCalledWith("defer_nfc_evidence_recovery", { p_asset_id: id, p_lease_token: token, p_outcome: "absent" });
  mocks.rpc.mockResolvedValue({ data: "true", error: null });
  await expect(deferNfcRecoveryJob({ ...input, outcome: "absent" })).rejects.toThrow("NFC_RECOVERY_RESPONSE_INVALID");
});
it("rejects unknown outcomes and client extras", async () => {
  await expect(deferNfcRecoveryJob({ ...input, outcome: "deleted" })).rejects.toThrow();
  await expect(renewNfcRecoveryLease({ ...input, actorId: id })).rejects.toThrow();
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it("preserves lease loss but sanitizes database failures", async () => {
  mocks.rpc.mockResolvedValue({ error: { message: "NFC_RECOVERY_LEASE_LOST" } });
  await expect(renewNfcRecoveryLease(input)).rejects.toThrow("NFC_RECOVERY_LEASE_LOST");
  mocks.rpc.mockResolvedValue({ error: { message: "private password" } });
  await expect(claimNfcRecoveryJobs()).rejects.toThrow("NFC_RECOVERY_CLAIM_FAILED");
  await expect(deferNfcRecoveryJob({ ...input, outcome: "absent" })).rejects.toThrow("NFC_RECOVERY_DEFER_FAILED");
});
