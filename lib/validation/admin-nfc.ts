import { z } from "zod";

export const nfcStatusSchema = z.enum(["draft", "active", "inactive", "revoked"]);
const reason = z.string().trim().min(3).max(500);
export const adminNfcCreateSchema = z.object({
  checkinCodeId: z.coerce.number().int().positive().safe(),
  label: z.string().trim().min(1).max(80),
  reason,
  replacesTagId: z.uuid().optional(),
});
export const adminNfcChangeSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("verify"), tagId: z.uuid(), version: z.number().int().positive(), reason,
    readBackUrl: z.string().url().max(500), verificationReference: z.string().trim().min(3).max(500) }),
  z.object({ operation: z.literal("status"), tagId: z.uuid(), version: z.number().int().positive(), reason,
    status: z.enum(["active", "inactive", "revoked"]) }),
]);
export const adminNfcFiltersSchema = z.object({
  q: z.string().trim().max(80).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  status: nfcStatusSchema.optional(),
  checkinCodeId: z.coerce.number().int().positive().safe().optional(),
});
