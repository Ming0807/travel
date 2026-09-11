import "server-only";
import { claimAuthorizedNfcRecoveryWork } from "@/lib/services/nfc-recovery-worker.service";
import { readLeasedNfcRecoveryIntent } from "@/lib/repositories/nfc-upload-intent.repository";
import { abandonLeasedNfcRecovery, deferNfcRecoveryJob, finalizeLeasedNfcRecovery, renewNfcRecoveryLease,
  type NfcRecoveryOutcome } from "@/lib/repositories/nfc-recovery-job.repository";
import { inspectNfcRecoveryLocator } from "@/lib/storage/nfc-evidence-discovery";
import { inspectNfcRecoveryReadback } from "@/lib/storage/nfc-evidence-readback";

type Lease = { assetId: string; leaseToken: string };
type Result = { status: "disabled" | "idle" | "completed" | "lease_lost" }
  | { status: "deferred" | "review"; outcome: NfcRecoveryOutcome };
const messageOf = (error: unknown) => error instanceof Error ? error.message : "";

async function defer(lease: Lease, outcome: NfcRecoveryOutcome): Promise<Result> {
  await deferNfcRecoveryJob({ ...lease, outcome });
  return { status: outcome === "absent" || outcome === "provider_unavailable" ? "deferred" : "review", outcome };
}

async function processLease(lease: Lease): Promise<Result> {
  let intent = await readLeasedNfcRecoveryIntent(lease);
  await renewNfcRecoveryLease(lease);
  let retired = intent.state === "abandoned";
  if (intent.state === "prepared") {
    try {
      // Database time is authoritative; no local-clock expiry decisions.
      await abandonLeasedNfcRecovery(lease);
      retired = true;
    } catch (error) {
      if (messageOf(error) === "NFC_UPLOAD_NOT_ABANDONABLE") {
        // A browser may have finalized between the snapshot and transition.
        intent = await readLeasedNfcRecoveryIntent(lease);
        if (intent.state === "prepared") throw error;
        retired = intent.state === "abandoned";
      } else if (messageOf(error) !== "NFC_UPLOAD_NOT_STALE") throw error;
    }
  }
  let path = intent.storage_path;
  if (!path) {
    const observation = await inspectNfcRecoveryLocator(intent);
    if (observation.status !== "located") return defer(lease, observation.status);
    path = observation.storagePath;
  }
  const observation = await inspectNfcRecoveryReadback({ ...intent, storage_path: path });
  if (observation.status !== "verified") return defer(lease, observation.status);
  // Verified late-arriving content conflicts with the retired lifecycle, not
  // necessarily its hash. Preserve it for operator review; never delete it here.
  if (retired) return defer(lease, "content_conflict");
  try {
    await finalizeLeasedNfcRecovery({ ...lease, providerAccount: intent.provider_account, ...observation.content });
  } catch (error) {
    if (messageOf(error) !== "NFC_UPLOAD_EXPIRED") throw error;
    await abandonLeasedNfcRecovery(lease);
    return defer(lease, "content_conflict");
  }
  return { status: "completed" };
}

// Dormant one-job machine entry point. No route/cron activation and no file deletion.
// Return only aggregate outcomes, never leases, provider locators or owner metadata.
export async function runAuthorizedNfcRecovery(authorization: string | null): Promise<Result> {
  const batch = await claimAuthorizedNfcRecoveryWork(authorization);
  if (!batch.enabled) return { status: "disabled" };
  const job = batch.jobs[0];
  if (!job) return { status: "idle" };
  const lease = { assetId: job.asset_id, leaseToken: job.lease_token };
  try { return await processLease(lease); }
  catch (error) {
    const message = messageOf(error);
    if (message === "NFC_RECOVERY_LEASE_LOST") return { status: "lease_lost" };
    const outcomes = new Map<string, NfcRecoveryOutcome>([
      ["NFC_UPLOAD_ACTOR_UNAVAILABLE", "actor_unavailable"],
      ["NFC_VERSION_CONFLICT", "tag_changed"], ["NFC_UPLOAD_TAG_UNAVAILABLE", "tag_changed"],
      ["NFC_UPLOAD_FINALIZE_CONFLICT", "content_conflict"], ["NFC_UPLOAD_NOT_AVAILABLE", "content_conflict"],
      ["NFC_UPLOAD_ABANDONED", "content_conflict"],
    ]);
    const outcome = outcomes.get(message);
    if (outcome) {
      try { return await defer(lease, outcome); }
      catch (failure) {
        if (messageOf(failure) === "NFC_RECOVERY_LEASE_LOST") return { status: "lease_lost" };
      }
    }
    // Unknown failures leave the lease to expire for recovery, not a false ACK.
    throw new Error("NFC_RECOVERY_PROCESSING_FAILED");
  }
}
