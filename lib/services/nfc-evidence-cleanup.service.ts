import "server-only";
import { requirePermission } from "@/lib/auth/guards";
import { claimNfcEvidenceCleanup, completeNfcEvidenceCleanup } from "@/lib/repositories/nfc-evidence-cleanup.repository";
import { deletePrivateFile } from "@/lib/storage/private-files";

// Not exposed through a route or scheduler until staging/reconciliation gates pass.
export async function runNfcEvidenceCleanup(limit = 25) {
  if (process.env.NFC_EVIDENCE_CLEANUP_ENABLED !== "true") throw new Error("NFC_CLEANUP_DISABLED");
  await requirePermission("checkin_code.manage", { unauthenticated: "throw" });
  const assets = await claimNfcEvidenceCleanup(limit);
  let completed = 0;
  for (const asset of assets) {
    try {
      await deletePrivateFile({ bucket: "nfc-evidence", path: asset.storage_path });
      // A failed acknowledgement keeps the durable claim; deletion can be retried.
      await completeNfcEvidenceCleanup(asset.asset_id);
      completed++;
    } catch {
      // Continue the bounded batch without leaking provider paths or credentials.
    }
  }
  return { claimed: assets.length, completed, failed: assets.length - completed };
}
