import "server-only";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { readAdminNfcTag } from "@/lib/repositories/admin-nfc.repository";
import type { UploadableAdminImageFile } from "@/lib/services/admin-image-processing.service";
import { processNfcEvidenceImage } from "@/lib/services/nfc-evidence-image.service";
import { uploadProcessedNfcEvidenceRecoverably } from "@/lib/services/nfc-recoverable-upload.service";

// Source-file entry point remains dormant until route/client rollout is accepted.
export async function uploadNfcEvidenceRecoverably(input: unknown, file: UploadableAdminImageFile) {
  await requirePermission("checkin_code.manage", { unauthenticated: "throw" });
  const context = z.object({ requestId: z.uuid(), tagId: z.uuid(), version: z.number().int().positive().safe() }).strict().parse(input);
  const tag = await readAdminNfcTag(context.tagId);
  if (!tag || tag.status === "revoked") throw new Error("NFC_UPLOAD_TAG_UNAVAILABLE");
  if (tag.version !== context.version) throw new Error("NFC_VERSION_CONFLICT");
  const image = await processNfcEvidenceImage(file);
  return uploadProcessedNfcEvidenceRecoverably(context, image.buffer);
}
