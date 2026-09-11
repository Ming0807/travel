import "server-only";
import { timingSafeEqual } from "node:crypto";
import { claimNfcRecoveryJobs } from "@/lib/repositories/nfc-recovery-job.repository";

// Internal worker entry only. Do not serialize leases to public/admin browsers.
// A future scheduler must run bounded processing after this authorized claim.
export async function claimAuthorizedNfcRecoveryWork(authorization: string | null) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32 || secret.length > 512 || /\s/.test(secret) || !authorization) {
    throw new Error("NFC_RECOVERY_UNAUTHORIZED");
  }
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authorization);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    throw new Error("NFC_RECOVERY_UNAUTHORIZED");
  }
  const flag = process.env.NFC_EVIDENCE_WORKER_ENABLED;
  if (flag === undefined || flag === "" || flag === "false") return { enabled: false as const, jobs: [] };
  if (flag !== "true") throw new Error("NFC_RECOVERY_CONFIGURATION_INVALID");
  // Claim one job just in time; a two-minute lease must not expire in a local queue.
  return { enabled: true as const, jobs: await claimNfcRecoveryJobs(1) };
}
