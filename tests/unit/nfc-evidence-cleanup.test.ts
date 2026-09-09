import { beforeEach, afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), guard: vi.fn(), remove: vi.fn() }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: () => mocks }));
vi.mock("@/lib/auth/guards", () => ({ requirePermission: mocks.guard }));
vi.mock("@/lib/storage/private-files", () => ({ deletePrivateFile: mocks.remove }));
import { runNfcEvidenceCleanup } from "@/lib/services/nfc-evidence-cleanup.service";
const id = "11111111-1111-4111-8111-111111111111";
const asset = { asset_id: id, provider: "supabase", storage_path: `nfc-evidence/${id}.webp` };
beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv("NFC_EVIDENCE_CLEANUP_ENABLED", "true");
  mocks.guard.mockResolvedValue({ adminId: id }); mocks.remove.mockResolvedValue(undefined);
  mocks.rpc.mockImplementation(async (name: string) => ({ data: name.startsWith("claim") ? [asset] : true, error: null }));
});
afterEach(() => vi.unstubAllEnvs());
it.each([undefined, "false", "TRUE"])("fails closed with flag %s", async (flag) => {
  vi.stubEnv("NFC_EVIDENCE_CLEANUP_ENABLED", flag);
  await expect(runNfcEvidenceCleanup()).rejects.toThrow("NFC_CLEANUP_DISABLED");
  expect(mocks.rpc).not.toHaveBeenCalled(); expect(mocks.remove).not.toHaveBeenCalled();
});
it("requires manage permission before claiming", async () => {
  mocks.guard.mockRejectedValue(new Error("FORBIDDEN"));
  await expect(runNfcEvidenceCleanup()).rejects.toThrow("FORBIDDEN");
  expect(mocks.guard).toHaveBeenCalledWith("checkin_code.manage", { unauthenticated: "throw" });
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it("confirms deletion before marking complete and returns no paths", async () => {
  expect(await runNfcEvidenceCleanup(10)).toEqual({ claimed: 1, completed: 1, failed: 0 });
  expect(mocks.rpc).toHaveBeenNthCalledWith(1, "claim_nfc_evidence_cleanup", { p_limit: 10 });
  expect(mocks.remove).toHaveBeenCalledWith({ bucket: "nfc-evidence", path: asset.storage_path });
  expect(mocks.rpc).toHaveBeenNthCalledWith(2, "complete_nfc_evidence_cleanup", { p_asset_id: id });
  expect(mocks.remove.mock.invocationCallOrder[0]).toBeLessThan(mocks.rpc.mock.invocationCallOrder[1]);
});
it("does not complete failed provider deletions", async () => {
  mocks.remove.mockRejectedValue(new Error("provider secret"));
  expect(await runNfcEvidenceCleanup()).toEqual({ claimed: 1, completed: 0, failed: 1 });
  expect(mocks.rpc).toHaveBeenCalledTimes(1);
});
it("retains failed acknowledgements for idempotent retries", async () => {
  mocks.rpc.mockResolvedValueOnce({ data: [asset], error: null }).mockResolvedValueOnce({ data: false, error: null });
  expect(await runNfcEvidenceCleanup()).toEqual({ claimed: 1, completed: 0, failed: 1 });
});
it.each([
  [{ ...asset, storage_path: "visit-photos/private.webp" }],
  [{ ...asset, provider: "cloudinary" }],
  [asset, asset],
  null,
])("rejects malformed claims before any destructive operation", async (data) => {
  mocks.rpc.mockResolvedValue({ data, error: null });
  await expect(runNfcEvidenceCleanup()).rejects.toThrow("NFC_CLEANUP_RESPONSE_INVALID");
  expect(mocks.remove).not.toHaveBeenCalled();
});
it("bounds batch input before SQL", async () => {
  await expect(runNfcEvidenceCleanup(101)).rejects.toThrow();
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it("contains SQL errors", async () => {
  mocks.rpc.mockResolvedValue({ error: { message: "database secret" } });
  await expect(runNfcEvidenceCleanup()).rejects.toThrow("NFC_CLEANUP_CLAIM_FAILED");
  expect(mocks.remove).not.toHaveBeenCalled();
});
it("continues after one failure and accepts an authenticated Cloudinary claim", async () => {
  const otherId = "22222222-2222-4222-8222-222222222222";
  const cloud = { asset_id: otherId, provider: "cloudinary", storage_path: `cloudinary:image:authenticated:v1:webp:tourism/nfc-evidence/${otherId}` };
  mocks.rpc.mockResolvedValueOnce({ data: [asset, cloud], error: null }).mockResolvedValue({ data: true, error: null });
  mocks.remove.mockRejectedValueOnce(new Error("temporary failure")).mockResolvedValueOnce(undefined);
  expect(await runNfcEvidenceCleanup()).toEqual({ claimed: 2, completed: 1, failed: 1 });
  expect(mocks.rpc).toHaveBeenLastCalledWith("complete_nfc_evidence_cleanup", { p_asset_id: otherId });
});
it("does no storage work for an empty batch", async () => {
  mocks.rpc.mockResolvedValue({ data: [], error: null });
  expect(await runNfcEvidenceCleanup()).toEqual({ claimed: 0, completed: 0, failed: 0 });
  expect(mocks.remove).not.toHaveBeenCalled();
});
