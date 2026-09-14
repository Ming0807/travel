import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ retry: vi.fn() }));
vi.mock("@/lib/services/nfc-recovery-retry.service", () => ({ requestNfcRecoveryRetry: mocks.retry }));
import { requestAdminNfcRecoveryRetryAction } from "@/app/actions/admin-nfc-retry-actions";
import { AdminAuthError } from "@/lib/auth/guards";
const requestId = "40000000-0000-4000-8000-000000000001";
beforeEach(() => vi.resetAllMocks());
it.each(["UNAUTHORIZED", "FORBIDDEN", "ADMIN_INACTIVE"] as const)("reports known pre-mutation auth failure %s as rejection", async code => {
  mocks.retry.mockRejectedValue(new AdminAuthError(code, "private auth detail"));
  const result = await requestAdminNfcRecoveryRetryAction({});
  expect(result).toMatchObject({ success: false, outcome: "rejected", code: code === "UNAUTHORIZED" ? "unauthorized" : "forbidden" });
  expect(JSON.stringify(result)).not.toContain("private auth detail");
});
it("returns the committed request acknowledgement without claiming file recovery", async () => {
  mocks.retry.mockResolvedValue({ enabled: true, requestId });
  expect(await requestAdminNfcRecoveryRetryAction({ requestId })).toEqual({ success: true, requestId });
});
it("reports disabled as a definite rejection", async () => {
  mocks.retry.mockResolvedValue({ enabled: false });
  expect(await requestAdminNfcRecoveryRetryAction({})).toMatchObject({ success: false, outcome: "rejected", code: "disabled" });
});
it.each([
  ["NFC_RECOVERY_RETRY_STALE", "stale"], ["NFC_RECOVERY_RETRY_UNAVAILABLE", "unavailable"],
  ["NFC_RECOVERY_RETRY_FORBIDDEN", "forbidden"], ["NFC_RECOVERY_RETRY_SCOPE_INVALID", "scope_invalid"],
  ["NFC_RECOVERY_RETRY_REQUEST_CONFLICT", "request_conflict"], ["NFC_VERSION_CONFLICT", "tag_changed"],
  ["NFC_UPLOAD_TAG_UNAVAILABLE", "tag_changed"], ["NFC_UPLOAD_ACTOR_UNAVAILABLE", "owner_unavailable"],
  ["NFC_RECOVERY_RETRY_INPUT_INVALID", "invalid"],
])("maps %s to a bounded definite rejection", async (message, code) => {
  mocks.retry.mockRejectedValue(new Error(message));
  expect(await requestAdminNfcRecoveryRetryAction({})).toMatchObject({ success: false, outcome: "rejected", code });
});
it.each(["NFC_RECOVERY_RETRY_FAILED", "NFC_RECOVERY_RETRY_RESPONSE_INVALID", "connection lost after commit", "constructor"])("keeps uncertain results retryable with the original identity (%s)", async message => {
  mocks.retry.mockRejectedValue(new Error(message));
  const result = await requestAdminNfcRecoveryRetryAction({ requestId });
  expect(result).toMatchObject({ success: false, outcome: "uncertain", code: "unknown" });
  expect(JSON.stringify(result)).not.toContain(message);
});
it("does not include payload, operator or raw errors in failures", async () => {
  mocks.retry.mockRejectedValue({ private_path: "secret/path", operator: "private-actor" });
  const result = await requestAdminNfcRecoveryRetryAction({ requestId, secret: "private-payload" });
  expect(result).toMatchObject({ success: false, outcome: "uncertain" });
  for (const value of ["secret/path", "private-actor", "private-payload", requestId]) expect(JSON.stringify(result)).not.toContain(value);
});
