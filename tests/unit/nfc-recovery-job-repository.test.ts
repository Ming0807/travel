import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => mocks }));
import { claimNfcRecoveryJobs, renewNfcRecoveryLease, deferNfcRecoveryJob, finalizeLeasedNfcRecovery, abandonLeasedNfcRecovery } from "@/lib/repositories/nfc-recovery-job.repository";
const id = "40000000-0000-4000-8000-000000000001", token = "40000000-0000-4000-8000-000000000002";
const input = { assetId: id, leaseToken: token };
it("retires a stale intent under its lease without supplying an operator",async()=>{
  mocks.rpc.mockResolvedValue({data:true,error:null});
  expect(await abandonLeasedNfcRecovery(input)).toBe(true);
  expect(mocks.rpc).toHaveBeenCalledWith("abandon_leased_nfc_recovery",{p_asset_id:id,p_lease_token:token});
});
it.each([null,false,"true",id])("requires literal true abandonment acknowledgement",async data=>{
  mocks.rpc.mockResolvedValue({data,error:null});
  await expect(abandonLeasedNfcRecovery(input)).rejects.toThrow("NFC_RECOVERY_RESPONSE_INVALID");
});
it("rejects operator injection in worker abandonment",async()=>{
  await expect(abandonLeasedNfcRecovery({...input,operatorId:id})).rejects.toThrow();
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it.each(["NFC_RECOVERY_LEASE_LOST","NFC_UPLOAD_ACTOR_UNAVAILABLE","NFC_UPLOAD_NOT_FOUND",
  "NFC_UPLOAD_NOT_ABANDONABLE","NFC_UPLOAD_NOT_STALE"])("preserves abandonment outcome %s",async message=>{
  mocks.rpc.mockResolvedValue({error:{message}});
  await expect(abandonLeasedNfcRecovery(input)).rejects.toThrow(message);
});
it("sanitizes abandonment database failures",async()=>{
  mocks.rpc.mockResolvedValue({error:{message:"private database details"}});
  await expect(abandonLeasedNfcRecovery(input)).rejects.toThrow("NFC_RECOVERY_ABANDON_FAILED");
});
const row = { asset_id: id, lease_token: token, next_attempt_at: "2026-09-11T00:00:00Z", last_attempt_at: "2026-09-11T00:00:01Z",
  lease_expires_at: "2026-09-11T00:02:01Z", attempt_count: 1, last_outcome: null, review_required: false, completed_at: null };
beforeEach(() => { vi.resetAllMocks(); mocks.rpc.mockResolvedValue({ data: [row], error: null }); });
const content = { ...input, providerAccount: "local-project", storagePath: `nfc-evidence/${id}.webp`,
  sha256: "a".repeat(64), sizeBytes: 1000, width: 640, height: 480 };
it("finalizes verified content under the exact lease without an actor parameter", async () => {
  mocks.rpc.mockResolvedValue({ data: id, error: null });
  expect(await finalizeLeasedNfcRecovery(content)).toBe(id);
  expect(mocks.rpc).toHaveBeenCalledWith("finalize_leased_nfc_recovery", {
    p_asset_id: id, p_lease_token: token, p_account: content.providerAccount, p_path: content.storagePath,
    p_sha256: content.sha256, p_size: 1000, p_width: 640, p_height: 480,
  });
});
it.each([null, true, token, [id]])("rejects an invalid finalization acknowledgement", async data => {
  mocks.rpc.mockResolvedValue({ data, error: null });
  await expect(finalizeLeasedNfcRecovery(content)).rejects.toThrow("NFC_RECOVERY_RESPONSE_INVALID");
});
it.each([{ actorId: id }, { sha256: "invalid" }, { sizeBytes: 2097153 }, { width: 0 },
  { height: 2561 }, { providerAccount: "https://private.example" }, { leaseToken: "invalid" }])("rejects unsafe finalization input before RPC", async change => {
  await expect(finalizeLeasedNfcRecovery({ ...content, ...change })).rejects.toThrow();
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it.each(["NFC_RECOVERY_LEASE_LOST", "NFC_UPLOAD_ACTOR_UNAVAILABLE", "NFC_UPLOAD_TAG_UNAVAILABLE",
  "NFC_VERSION_CONFLICT", "NFC_UPLOAD_FINALIZE_CONFLICT", "NFC_UPLOAD_NOT_AVAILABLE", "NFC_UPLOAD_EXPIRED",
  "NFC_UPLOAD_ABANDONED", "NFC_UPLOAD_NOT_FOUND"])("preserves a known finalization outcome %s", async message => {
  mocks.rpc.mockResolvedValue({ error: { message } });
  await expect(finalizeLeasedNfcRecovery(content)).rejects.toThrow(message);
});
it("does not expose private database failures from finalization", async () => {
  mocks.rpc.mockResolvedValue({ error: { message: "private database credentials" } });
  await expect(finalizeLeasedNfcRecovery(content)).rejects.toThrow("NFC_RECOVERY_FINALIZE_FAILED");
});
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
