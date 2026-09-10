import "server-only";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { readOwnedNfcUploadIntent, finalizeNfcEvidenceUpload } from "@/lib/repositories/nfc-upload-intent.repository";
import { verifyNfcEvidenceReadback } from "@/lib/storage/nfc-evidence-readback";

// Dormant service; no route until complete retry/discovery and staging gates pass.
export async function confirmNfcEvidenceUpload(input: unknown) {
  const { adminId } = await requirePermission("checkin_code.manage", { unauthenticated: "throw" });
  const value = z.object({ assetId: z.uuid(), storagePath: z.string().min(1).max(500).optional() }).strict().parse(input);
  const intent = await readOwnedNfcUploadIntent(value.assetId, adminId);
  if (!intent || intent.asset_id !== value.assetId || intent.actor_id !== adminId) throw new Error("NFC_UPLOAD_NOT_FOUND");
  if (intent.state === "abandoned") throw new Error("NFC_UPLOAD_ABANDONED");
  const storagePath = intent.storage_path ?? value.storagePath ?? (intent.provider === "supabase" ? intent.object_key : null);
  if (!storagePath) throw new Error("NFC_UPLOAD_LOCATOR_REQUIRED");
  if (intent.storage_path && value.storagePath && value.storagePath !== intent.storage_path) throw new Error("NFC_UPLOAD_FINALIZE_CONFLICT");
  // The optional locator is only a candidate. Readback enforces the exact durable
  // provider/key/hash; no browser-supplied hash or account is trusted.
  const verified = await verifyNfcEvidenceReadback({ ...intent, storage_path: storagePath });
  await finalizeNfcEvidenceUpload({ assetId: intent.asset_id, actorId: adminId,
    providerAccount: intent.provider_account, ...verified });
  return { assetId: intent.asset_id, width: intent.width, height: intent.height, sizeBytes: intent.size_bytes };
}
