// @vitest-environment node
import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), client: vi.fn() }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: mocks.client }));
import { claimNfcCleanupJobs, readNfcCleanupBinding, renewNfcCleanupLease, deferNfcCleanupJob } from "@/lib/repositories/nfc-cleanup-job.repository";
const assetId = "40000000-0000-4000-8000-000000000001";
const leaseToken = "40000000-0000-4000-8000-000000000002";
const lease = { assetId, leaseToken };
const job = { asset_id: assetId, lease_token: leaseToken, attempt_count: 1, review_required: false,
  last_outcome: null, last_attempt_at: "2026-09-14T00:00:00Z", next_attempt_at: "2026-09-14T00:00:00Z", lease_expires_at: "2026-09-14T00:02:00Z" };
const binding = { asset_id: assetId, provider: "supabase", provider_account: "local-qa", storage_prefix: "nfc-evidence",
  object_key: `nfc-evidence/${assetId}.webp`, storage_path: `nfc-evidence/${assetId}.webp`, sha256: "a".repeat(64), size_bytes: 100, width: 4, height: 5 };
beforeEach(() => { vi.resetAllMocks(); mocks.client.mockReturnValue({ rpc: mocks.rpc }); mocks.rpc.mockResolvedValue({ data: [job], error: null }); });
it("claims bounded jobs with exact RPC arguments", async () => {
  expect(await claimNfcCleanupJobs()).toEqual([job]);
  expect(mocks.rpc).toHaveBeenCalledWith("claim_nfc_cleanup_jobs", { p_limit: 1 });
});
it.each([0, 6, 1.5])("rejects invalid batch %s before DB access", async limit => {
  await expect(claimNfcCleanupJobs(limit)).rejects.toThrow(); expect(mocks.client).not.toHaveBeenCalled();
});
it.each([{ rows: [job, job] }, { rows: [{ ...job, review_required: true }] },
  { rows: [{ ...job, lease_expires_at: job.last_attempt_at }] }, { rows: [{ ...job, secret: "private" }] }])("rejects invalid claims", async ({ rows }) => {
  mocks.rpc.mockResolvedValue({ data: rows, error: null });
  await expect(claimNfcCleanupJobs(2)).rejects.toThrow("NFC_CLEANUP_RESPONSE_INVALID");
});
it("reads exact durable binding using the lease", async () => {
  mocks.rpc.mockResolvedValue({ data: binding, error: null });
  expect(await readNfcCleanupBinding(lease)).toEqual(binding);
  expect(mocks.rpc).toHaveBeenCalledWith("read_leased_nfc_cleanup_binding", { p_asset_id: assetId, p_lease_token: leaseToken });
});
it("accepts only a versioned authenticated Cloudinary binding in the durable namespace", async () => {
  const key = `project/nfc-evidence/${assetId}`;
  const cloudinary = { ...binding, provider: "cloudinary", storage_prefix: "project/nfc-evidence", object_key: key,
    storage_path: `cloudinary:image:authenticated:v123:webp:${key}` };
  mocks.rpc.mockResolvedValue({ data: cloudinary, error: null });
  expect(await readNfcCleanupBinding(lease)).toEqual(cloudinary);
  mocks.rpc.mockResolvedValue({ data: { ...cloudinary, storage_path: `cloudinary:image:upload:v123:webp:${key}` }, error: null });
  await expect(readNfcCleanupBinding(lease)).rejects.toThrow("NFC_CLEANUP_RESPONSE_INVALID");
});
it("validates lease inputs before access and checks renewal responses", async () => {
  await expect(readNfcCleanupBinding({ ...lease, provider_account: "caller" })).rejects.toThrow();
  expect(mocks.client).not.toHaveBeenCalled();
  mocks.rpc.mockResolvedValue({ data: "invalid", error: null });
  await expect(renewNfcCleanupLease(lease)).rejects.toThrow("NFC_CLEANUP_RESPONSE_INVALID");
  mocks.rpc.mockResolvedValue({ data: job.lease_expires_at, error: null });
  expect(await renewNfcCleanupLease(lease)).toBe(job.lease_expires_at);
});
it.each([{ ...binding, asset_id: leaseToken }, { ...binding, object_key: "other" },
  { ...binding, storage_path: "other" }, { ...binding, provider_account: "https://private" },
  { ...binding, sha256: "bad" }])("rejects mismatched bindings", async data => {
  mocks.rpc.mockResolvedValue({ data, error: null });
  await expect(readNfcCleanupBinding(lease)).rejects.toThrow("NFC_CLEANUP_RESPONSE_INVALID");
});
it("retains known lease rejection but sanitizes unknown DB errors", async () => {
  mocks.rpc.mockResolvedValue({ data: null, error: { message: "NFC_CLEANUP_LEASE_LOST" } });
  await expect(renewNfcCleanupLease(lease)).rejects.toThrow("NFC_CLEANUP_LEASE_LOST");
  mocks.rpc.mockResolvedValue({ data: null, error: { message: "private connection" } });
  await expect(readNfcCleanupBinding(lease)).rejects.toThrow("NFC_CLEANUP_READ_FAILED");
});
it("requires exact acknowledgement and rejects unsupported outcomes", async () => {
  await expect(deferNfcCleanupJob({ ...lease, outcome: "deleted" })).rejects.toThrow();
  expect(mocks.client).not.toHaveBeenCalled();
  mocks.rpc.mockResolvedValue({ data: false, error: null });
  await expect(deferNfcCleanupJob({ ...lease, outcome: "absent" })).rejects.toThrow("NFC_CLEANUP_RESPONSE_INVALID");
  mocks.rpc.mockResolvedValue({ data: true, error: null });
  expect(await deferNfcCleanupJob({ ...lease, outcome: "settlement_unproven" })).toBe(true);
});
