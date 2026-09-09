import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { readAdminNfcTag } from "@/lib/repositories/admin-nfc.repository";
import { readNfcEvidenceAsset, registerNfcEvidenceAsset, type NfcEvidenceMetadata } from "@/lib/repositories/nfc-evidence.repository";
import { createPrivateFileSignedUrl, uploadPrivateFile } from "@/lib/storage/private-files";
import { readAndValidateAdminImageFile, renderAdminImageWebpVariant, type UploadableAdminImageFile } from "@/lib/services/admin-image-processing.service";
import { NFC_EVIDENCE_UPLOAD_MAX_BYTES, NFC_EVIDENCE_STORED_MAX_BYTES } from "@/lib/nfc/evidence-upload-policy";

const uploadContext = z.object({ tagId: z.uuid(), version: z.number().int().positive() }).strict();
const maxUploadBytes = NFC_EVIDENCE_UPLOAD_MAX_BYTES;
const maxStoredBytes = NFC_EVIDENCE_STORED_MAX_BYTES;

export async function uploadNfcEvidence(input: unknown, file: UploadableAdminImageFile) {
  const { adminId } = await requirePermission("checkin_code.manage", { unauthenticated: "throw" });
  const context = uploadContext.parse(input);
  const tag = await readAdminNfcTag(context.tagId);
  if (!tag) throw new Error("NFC_NOT_FOUND");
  if (tag.version !== context.version) throw new Error("NFC_VERSION_CONFLICT");
  const assetId = randomUUID();
  // Check schema availability before creating a remote object.
  if (await readNfcEvidenceAsset(assetId)) throw new Error("NFC_EVIDENCE_REQUEST_CONFLICT");
  const decoded = await readAndValidateAdminImageFile(file, { maxSizeMb: 3, maxPixels: 24_000_000 });
  if (decoded.inputBuffer.byteLength > maxUploadBytes || decoded.inputBuffer.byteLength !== file.size) {
    throw new Error("NFC_EVIDENCE_SIZE_INVALID");
  }
  let image = await renderAdminImageWebpVariant(decoded.inputBuffer, { maxWidth: 2560, quality: 82, maxPixels: 24_000_000 });
  if (image.sizeBytes > maxStoredBytes) {
    image = await renderAdminImageWebpVariant(decoded.inputBuffer, { maxWidth: 2560, quality: 72, maxPixels: 24_000_000 });
  }
  if (image.sizeBytes > maxStoredBytes) throw new Error("NFC_EVIDENCE_SIZE_INVALID");
  const stored = await uploadPrivateFile({ bucket: "nfc-evidence", path: `nfc-evidence/${assetId}.webp`, data: image.buffer, contentType: "image/webp" });
  if (stored.provider !== "supabase" && stored.provider !== "cloudinary") throw new Error("NFC_EVIDENCE_PROVIDER_INVALID");
  const metadata: NfcEvidenceMetadata = {
    asset_id: assetId, nfc_tag_id: context.tagId, tag_version: context.version, actor_id: adminId,
    provider: stored.provider, storage_path: stored.storagePath,
    sha256: createHash("sha256").update(image.buffer).digest("hex"), size_bytes: image.sizeBytes,
    width: image.width, height: image.height,
  };
  try {
    await registerNfcEvidenceAsset(metadata);
  } catch (error) {
    // A lost RPC response may already have committed. Never delete uncertain evidence.
    const existing = await readNfcEvidenceAsset(assetId);
    if (!existing || Object.entries(metadata).some(([key, value]) => existing[key as keyof NfcEvidenceMetadata] !== value)) throw error;
  }
  return { assetId, width: image.width, height: image.height, sizeBytes: image.sizeBytes };
}

export async function getNfcEvidencePreview(input: unknown) {
  const { adminId } = await requirePermission("checkin_code.read", { unauthenticated: "throw" });
  const value = z.object({ assetId: z.uuid(), tagId: z.uuid() }).strict().parse(input);
  const asset = await readNfcEvidenceAsset(value.assetId);
  if (!asset || asset.nfc_tag_id !== value.tagId) throw new Error("NFC_EVIDENCE_NOT_AVAILABLE");
  const age = Date.now() - Date.parse(asset.created_at);
  if (asset.nfc_field_check_photos.length === 0 && (asset.actor_id !== adminId || age < 0 || age > 86_400_000)) {
    throw new Error("NFC_EVIDENCE_NOT_AVAILABLE");
  }
  return createPrivateFileSignedUrl("nfc-evidence", asset.storage_path, 60);
}
