import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), client: vi.fn(), guard: vi.fn() }));
vi.mock("@/lib/supabase/service-role", () => ({ createSupabaseServiceRoleClient: mocks.client }));
vi.mock("@/lib/auth/guards", () => ({ requirePermission: mocks.guard }));
import { requestNfcRecoveryRetry } from "@/lib/services/nfc-recovery-retry.service";
import { enqueueNfcRecoveryRetry } from "@/lib/repositories/nfc-recovery-retry.repository";
const input = { requestId: "40000000-0000-4000-8000-000000000001", tagId: "40000000-0000-4000-8000-000000000002",
  assetId: "40000000-0000-4000-8000-000000000003", expectedAttemptCount: 2, reason: "provider_restored" };
const operatorId = "40000000-0000-4000-8000-000000000004";
beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv("NFC_EVIDENCE_RECOVERY_ENABLED", "true"); vi.stubEnv("NFC_EVIDENCE_OPERATOR_RETRY_ENABLED", "true");
  mocks.guard.mockResolvedValue({ adminId: operatorId }); mocks.client.mockReturnValue({ rpc: mocks.rpc });
  mocks.rpc.mockResolvedValue({ data: input.requestId, error: null });
});
afterEach(() => vi.unstubAllEnvs());
it("derives operator from the current guard and calls only the atomic RPC", async () => {
  expect(await requestNfcRecoveryRetry(input)).toEqual({ enabled: true, requestId: input.requestId });
  expect(mocks.guard).toHaveBeenCalledWith("checkin_code.manage");
  expect(mocks.rpc).toHaveBeenCalledExactlyOnceWith("request_nfc_evidence_recovery_retry", { p_request_id: input.requestId,
    p_tag_id: input.tagId, p_asset_id: input.assetId, p_operator_id: operatorId, p_attempt_count: 2, p_reason: "provider_restored" });
});
it("rejects a caller-provided operator before any database call", async () => {
  await expect(requestNfcRecoveryRetry({ ...input, operatorId })).rejects.toThrow(); expect(mocks.client).not.toHaveBeenCalled();
});
it("requires permission even when disabled", async () => {
  vi.stubEnv("NFC_EVIDENCE_OPERATOR_RETRY_ENABLED", "false"); mocks.guard.mockRejectedValue(new Error("FORBIDDEN"));
  await expect(requestNfcRecoveryRetry(input)).rejects.toThrow("FORBIDDEN"); expect(mocks.client).not.toHaveBeenCalled();
});
it.each(["NFC_EVIDENCE_RECOVERY_ENABLED", "NFC_EVIDENCE_OPERATOR_RETRY_ENABLED"])("does not touch held SQL when %s is off", async flag => {
  vi.stubEnv(flag, "false"); expect(await requestNfcRecoveryRetry(input)).toEqual({ enabled: false }); expect(mocks.client).not.toHaveBeenCalled();
});
it("fails closed on a malformed retry flag", async () => {
  vi.stubEnv("NFC_EVIDENCE_OPERATOR_RETRY_ENABLED", "yes"); await expect(requestNfcRecoveryRetry(input)).rejects.toThrow();
  expect(mocks.client).not.toHaveBeenCalled();
});
it.each([undefined, "", "false"])("keeps operator retry disabled by default (%s)", async value => {
  vi.stubEnv("NFC_EVIDENCE_OPERATOR_RETRY_ENABLED", value);
  expect(await requestNfcRecoveryRetry(input)).toEqual({ enabled: false }); expect(mocks.client).not.toHaveBeenCalled();
});
it.each([{ reason: "override" }, { requestId: "bad" }, { expectedAttemptCount: -1 }, { expectedAttemptCount: 1.5 }])("rejects invalid retry data before RPC", async patch => {
  await expect(enqueueNfcRecoveryRetry({ ...input, ...patch, operatorId })).rejects.toThrow(); expect(mocks.client).not.toHaveBeenCalled();
});
it.each(["NFC_RECOVERY_RETRY_STALE", "NFC_RECOVERY_RETRY_UNAVAILABLE", "NFC_RECOVERY_RETRY_REQUEST_CONFLICT", "NFC_RECOVERY_RETRY_FORBIDDEN", "NFC_VERSION_CONFLICT"])("preserves bounded SQL outcome %s", async message => {
  mocks.rpc.mockResolvedValue({ data: null, error: { message } });
  await expect(enqueueNfcRecoveryRetry({ ...input, operatorId })).rejects.toThrow(message);
});
it("hides arbitrary audit/database details", async () => {
  mocks.rpc.mockResolvedValue({ data: null, error: { message: "private SQL connection and audit failure" } });
  await expect(enqueueNfcRecoveryRetry({ ...input, operatorId })).rejects.toThrow("NFC_RECOVERY_RETRY_FAILED");
});
it.each([null, true, operatorId])("requires exact request acknowledgement (%s)", async data => {
  mocks.rpc.mockResolvedValue({ data, error: null });
  await expect(enqueueNfcRecoveryRetry({ ...input, operatorId })).rejects.toThrow("NFC_RECOVERY_RETRY_RESPONSE_INVALID");
});
