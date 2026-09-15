// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ claim: vi.fn() }));
vi.mock("@/lib/repositories/nfc-cleanup-job.repository", () => ({ claimNfcCleanupJobs: mocks.claim }));
import { claimAuthorizedNfcCleanupInspection } from "@/lib/services/nfc-cleanup-worker.service";
const secret = "inspection-test-secret-".repeat(3);
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv("CRON_SECRET", secret); vi.stubEnv("NFC_EVIDENCE_INSPECTION_WORKER_ENABLED", "true"); mocks.claim.mockResolvedValue([]); });
afterEach(() => vi.unstubAllEnvs());
it.each([null, "", "Basic bad", `Bearer ${secret}extra`, `Bearer ${secret.slice(0, -1)}X`])("rejects invalid authentication before DB access", async header => {
  await expect(claimAuthorizedNfcCleanupInspection(header)).rejects.toThrow("NFC_CLEANUP_UNAUTHORIZED");
  expect(mocks.claim).not.toHaveBeenCalled();
});
it.each([undefined, "short", " ".repeat(40), "x".repeat(513)])("rejects invalid secrets", async value => {
  vi.stubEnv("CRON_SECRET", value);
  await expect(claimAuthorizedNfcCleanupInspection(`Bearer ${value}`)).rejects.toThrow("NFC_CLEANUP_UNAUTHORIZED");
  expect(mocks.claim).not.toHaveBeenCalled();
});
it.each([undefined, "", "false"])("keeps inspection disabled with flag %s", async value => {
  vi.stubEnv("NFC_EVIDENCE_INSPECTION_WORKER_ENABLED", value);
  vi.stubEnv("NFC_EVIDENCE_CLEANUP_ENABLED", "true");
  vi.stubEnv("NFC_EVIDENCE_WORKER_ENABLED", "true");
  expect(await claimAuthorizedNfcCleanupInspection(`Bearer ${secret}`)).toEqual({ enabled: false, jobs: [] });
  expect(mocks.claim).not.toHaveBeenCalled();
});
it("claims one job only after authenticated opt-in", async () => {
  expect(await claimAuthorizedNfcCleanupInspection(`Bearer ${secret}`)).toEqual({ enabled: true, jobs: [] });
  expect(mocks.claim).toHaveBeenCalledExactlyOnceWith(1);
});
it("does not turn malformed flags or failures into idle success", async () => {
  vi.stubEnv("NFC_EVIDENCE_INSPECTION_WORKER_ENABLED", "TRUE");
  await expect(claimAuthorizedNfcCleanupInspection(`Bearer ${secret}`)).rejects.toThrow("NFC_CLEANUP_CONFIGURATION_INVALID");
  expect(mocks.claim).not.toHaveBeenCalled();
  vi.stubEnv("NFC_EVIDENCE_INSPECTION_WORKER_ENABLED", "true");
  mocks.claim.mockRejectedValue(new Error("NFC_CLEANUP_CLAIM_FAILED"));
  await expect(claimAuthorizedNfcCleanupInspection(`Bearer ${secret}`)).rejects.toThrow("NFC_CLEANUP_CLAIM_FAILED");
});
