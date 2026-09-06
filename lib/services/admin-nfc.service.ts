import "server-only";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { buildNfcPayload } from "@/lib/nfc/contract";
import { adminNfcChangeSchema, adminNfcCreateSchema, adminNfcFiltersSchema } from "@/lib/validation/admin-nfc";
import * as repository from "@/lib/repositories/admin-nfc.repository";

function payload(tag: repository.AdminNfcTag) {
  return buildNfcPayload(process.env.NEXT_PUBLIC_APP_URL ?? "", tag.code_snapshot, tag.public_token);
}

export async function getNfcHistory(input: unknown) {
  await requirePermission("checkin_code.read");
  const parsed = z.object({ tagId: z.uuid(), beforeVersion: z.number().int().positive().optional() }).parse(input);
  return repository.listAdminNfcEvents(parsed.tagId, parsed.beforeVersion);
}

export async function listNfcManagement(input: unknown) {
  await requirePermission("checkin_code.read");
  return repository.listAdminNfcTags(adminNfcFiltersSchema.parse(input));
}

export async function createNfcTag(input: unknown) {
  const { adminId } = await requirePermission("checkin_code.manage");
  return repository.insertAdminNfcTag(adminNfcCreateSchema.parse(input), adminId);
}

export async function changeNfcTag(input: unknown) {
  const { adminId } = await requirePermission("checkin_code.manage");
  const parsed = adminNfcChangeSchema.parse(input);
  const tag = await repository.readAdminNfcTag(parsed.tagId);
  if (!tag) throw new Error("NFC_NOT_FOUND");
  if (tag.version !== parsed.version) throw new Error("NFC_VERSION_CONFLICT");
  if (tag.status === "revoked") throw new Error("NFC_REVOKED_IMMUTABLE");
  const values: Record<string, string> = { updated_by: adminId, last_change_reason: parsed.reason };
  if (parsed.operation === "verify") {
    if (tag.status !== "draft" || tag.verified_at) throw new Error("NFC_VERIFICATION_IMMUTABLE");
    if (parsed.readBackUrl !== payload(tag)) throw new Error("NFC_READBACK_MISMATCH");
    Object.assign(values, { verified_at: new Date().toISOString(), verified_by: adminId, verification_reference: parsed.verificationReference });
  } else {
    const allowed = tag.status === "draft" ? ["active", "revoked"] : tag.status === "active" ? ["inactive", "revoked"] : ["active", "revoked"];
    if (!allowed.includes(parsed.status)) throw new Error("NFC_INVALID_TRANSITION");
    if (parsed.status === "active" && !tag.verified_at) throw new Error("NFC_VERIFICATION_REQUIRED");
    values.status = parsed.status;
  }
  return repository.updateAdminNfcTag(parsed.tagId, parsed.version, values);
}
