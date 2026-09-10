import "server-only";
import { readAndValidateAdminImageFile, renderAdminImageWebpVariant, type UploadableAdminImageFile } from "@/lib/services/admin-image-processing.service";
import { NFC_EVIDENCE_UPLOAD_MAX_BYTES, NFC_EVIDENCE_STORED_MAX_BYTES } from "@/lib/nfc/evidence-upload-policy";

// Shared policy for legacy and recoverable staff evidence, never tourist photos.
export async function processNfcEvidenceImage(file: UploadableAdminImageFile) {
  const decoded = await readAndValidateAdminImageFile(file, { maxSizeMb: 3, maxPixels: 24_000_000 });
  if (decoded.inputBuffer.byteLength > NFC_EVIDENCE_UPLOAD_MAX_BYTES || decoded.inputBuffer.byteLength !== file.size) {
    throw new Error("NFC_EVIDENCE_SIZE_INVALID");
  }
  let image = await renderAdminImageWebpVariant(decoded.inputBuffer, { maxWidth: 2560, quality: 82, maxPixels: 24_000_000 });
  if (image.sizeBytes > NFC_EVIDENCE_STORED_MAX_BYTES) {
    image = await renderAdminImageWebpVariant(decoded.inputBuffer, { maxWidth: 2560, quality: 72, maxPixels: 24_000_000 });
  }
  if (image.sizeBytes > NFC_EVIDENCE_STORED_MAX_BYTES) throw new Error("NFC_EVIDENCE_SIZE_INVALID");
  return image;
}
