import "server-only";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { prepareNfcEvidenceUpload } from "@/lib/repositories/nfc-upload-intent.repository";
import { getNfcUploadDestination, uploadPreparedNfcEvidence } from "@/lib/storage/nfc-prepared-storage";
import { confirmNfcEvidenceUpload } from "@/lib/services/nfc-evidence-confirmation.service";

// Dormant orchestration for server-processed, metadata-stripped WebP bytes.
// Source upload decoding and stable browser request identity are separate gates.
export async function uploadProcessedNfcEvidenceRecoverably(input: unknown, bytes: Buffer) {
  const { adminId } = await requirePermission("checkin_code.manage", { unauthenticated: "throw" });
  const context = z.object({ requestId: z.uuid(), tagId: z.uuid(), version: z.number().int().positive() }).strict().parse(input);
  if (bytes.length < 1 || bytes.length > 2097152) throw new Error("NFC_UPLOAD_CONTENT_MISMATCH");
  const payload = Buffer.from(bytes);
  const metadata = await sharp(payload, { limitInputPixels: 2560 * 2560 }).metadata()
    .catch(() => { throw new Error("NFC_UPLOAD_CONTENT_MISMATCH"); });
  if (metadata.format !== "webp" || !metadata.width || !metadata.height || metadata.width > 2560 || metadata.height > 2560
    || (metadata.pages ?? 1) !== 1 || metadata.exif || metadata.xmp || metadata.iptc) {
    throw new Error("NFC_UPLOAD_CONTENT_MISMATCH");
  }
  const intent = await prepareNfcEvidenceUpload({ request_id: context.requestId, actor_id: adminId,
    nfc_tag_id: context.tagId, tag_version: context.version, ...getNfcUploadDestination(),
    sha256: createHash("sha256").update(payload).digest("hex"), size_bytes: payload.length,
    width: metadata.width, height: metadata.height });
  if (intent.state === "abandoned") throw new Error("NFC_UPLOAD_ABANDONED");
  if (intent.state === "available") return confirmNfcEvidenceUpload({ assetId: intent.asset_id });
  const age = Date.now() - Date.parse(intent.created_at);
  if (!Number.isFinite(age) || age < 0 || age >= 86400000) throw new Error("NFC_UPLOAD_EXPIRED");
  let storagePath: string;
  try { storagePath = (await uploadPreparedNfcEvidence(intent, payload)).storagePath; }
  catch {
    // Upload may have committed even on error/duplicate response. Confirm the same
    // immutable asset once; unavailable recovery propagates without reupload loops.
    return confirmNfcEvidenceUpload({ assetId: intent.asset_id });
  }
  return confirmNfcEvidenceUpload({ assetId: intent.asset_id, storagePath });
}
