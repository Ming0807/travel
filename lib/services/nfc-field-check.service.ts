import "server-only";
import { z } from "zod";
import { requirePermission } from "@/lib/auth/guards";
import { nfcFieldCheckSchema } from "@/lib/validation/nfc-field-check";
import { insertNfcFieldCheck, listNfcFieldChecks } from "@/lib/repositories/nfc-field-check.repository";

export async function recordNfcFieldCheck(input: unknown) {
  const { adminId } = await requirePermission("checkin_code.manage");
  return insertNfcFieldCheck(nfcFieldCheckSchema.parse(input), adminId);
}

export async function getNfcFieldChecks(input: unknown) {
  await requirePermission("checkin_code.read");
  const parsed = z.object({ tagId: z.uuid(), page: z.number().int().min(1).max(10000).default(1) }).strict().parse(input);
  return listNfcFieldChecks(parsed.tagId, parsed.page);
}
