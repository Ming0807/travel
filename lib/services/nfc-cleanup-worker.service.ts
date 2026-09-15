import "server-only";
import { timingSafeEqual } from "node:crypto";
import { claimNfcCleanupJobs } from "@/lib/repositories/nfc-cleanup-job.repository";

// Internal inspection entry only. Never serialize lease tokens to a browser.
// This claims database work; it does not authorize provider deletion.
export async function claimAuthorizedNfcCleanupInspection(authorization: string | null) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32 || secret.length > 512 || /\s/.test(secret) || !authorization) {
    throw new Error("NFC_CLEANUP_UNAUTHORIZED");
  }
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authorization);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    throw new Error("NFC_CLEANUP_UNAUTHORIZED");
  }
  const flag = process.env.NFC_EVIDENCE_INSPECTION_WORKER_ENABLED;
  if (flag === undefined || flag === "" || flag === "false") return { enabled: false as const, jobs: [] };
  if (flag !== "true") throw new Error("NFC_CLEANUP_CONFIGURATION_INVALID");
  return { enabled: true as const, jobs: await claimNfcCleanupJobs(1) };
}
