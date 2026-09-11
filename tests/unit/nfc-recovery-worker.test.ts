import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ claim: vi.fn() }));
vi.mock("@/lib/repositories/nfc-recovery-job.repository", () => ({ claimNfcRecoveryJobs: mocks.claim }));
import { claimAuthorizedNfcRecoveryWork } from "@/lib/services/nfc-recovery-worker.service";
const secret = "test-machine-secret-".repeat(3);
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv("CRON_SECRET", secret); vi.stubEnv("NFC_EVIDENCE_WORKER_ENABLED", "true"); mocks.claim.mockResolvedValue([]); });
afterEach(() => vi.unstubAllEnvs());
it.each([null, "", "Basic invalid", `Bearer ${secret}extra`, `Bearer ${secret.slice(0,-1)}X`])("denies invalid authorization before queue access", async header => {
  await expect(claimAuthorizedNfcRecoveryWork(header)).rejects.toThrow("NFC_RECOVERY_UNAUTHORIZED");
  expect(mocks.claim).not.toHaveBeenCalled();
});
it.each([undefined, "short", " ".repeat(40), "x".repeat(513)])("rejects invalid server secret configuration", async value => {
  vi.stubEnv("CRON_SECRET", value);
  await expect(claimAuthorizedNfcRecoveryWork(`Bearer ${value}`)).rejects.toThrow("NFC_RECOVERY_UNAUTHORIZED");
  expect(mocks.claim).not.toHaveBeenCalled();
});
it.each([undefined, "", "false"])("keeps flag %s disabled after authentication", async flag => {
  vi.stubEnv("NFC_EVIDENCE_WORKER_ENABLED", flag);
  expect(await claimAuthorizedNfcRecoveryWork(`Bearer ${secret}`)).toEqual({ enabled: false, jobs: [] });
  expect(mocks.claim).not.toHaveBeenCalled();
});
it("claims only one job with verified machine authority", async () => {
  expect(await claimAuthorizedNfcRecoveryWork(`Bearer ${secret}`)).toEqual({ enabled: true, jobs: [] });
  expect(mocks.claim).toHaveBeenCalledExactlyOnceWith(1);
});
it("rejects malformed flags without claiming", async () => {
  vi.stubEnv("NFC_EVIDENCE_WORKER_ENABLED", "TRUE");
  await expect(claimAuthorizedNfcRecoveryWork(`Bearer ${secret}`)).rejects.toThrow("NFC_RECOVERY_CONFIGURATION_INVALID");
  expect(mocks.claim).not.toHaveBeenCalled();
});
it("does not report an empty successful batch after claim failure", async () => {
  mocks.claim.mockRejectedValue(new Error("NFC_RECOVERY_CLAIM_FAILED"));
  await expect(claimAuthorizedNfcRecoveryWork(`Bearer ${secret}`)).rejects.toThrow("NFC_RECOVERY_CLAIM_FAILED");
});
