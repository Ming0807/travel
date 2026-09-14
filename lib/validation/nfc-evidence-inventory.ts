import { z } from "zod";
const uuid = z.uuid().transform(value => value.toLowerCase());
export const nfcEvidenceInventoryFilters = z.object({ tagId: uuid, afterAssetId: uuid.optional() }).strict();
export const nfcEvidenceInventoryRow = z.object({
  asset_id: uuid, created_at: z.iso.datetime({ offset: true }), provider: z.enum(["supabase", "cloudinary"]),
  attached: z.boolean(), has_intent: z.boolean(), cleanup_state: z.enum(["none", "pending", "acknowledged"]),
}).strict().refine(row => !row.attached || row.cleanup_state === "none");
export type NfcEvidenceInventoryRow = z.infer<typeof nfcEvidenceInventoryRow>;
