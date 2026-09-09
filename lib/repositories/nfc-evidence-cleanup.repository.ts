import "server-only";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

const claimSchema = z.object({
  asset_id: z.uuid(), provider: z.enum(["supabase", "cloudinary"]),
  storage_path: z.string().min(1).max(1000),
}).strict().refine(row => row.provider === "supabase"
  ? row.storage_path === `nfc-evidence/${row.asset_id}.webp`
  : new RegExp(`^cloudinary:image:authenticated:v[0-9]+:webp:(?:[a-zA-Z0-9_/-]+/)?nfc-evidence/${row.asset_id}$`).test(row.storage_path));

export async function claimNfcEvidenceCleanup(limit: number) {
  z.number().int().min(1).max(100).parse(limit);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("claim_nfc_evidence_cleanup", { p_limit: limit });
  if (error) throw new Error("NFC_CLEANUP_CLAIM_FAILED");
  const result = z.array(claimSchema).max(limit).refine(rows => new Set(rows.map(row => row.asset_id)).size === rows.length).safeParse(data);
  if (!result.success) throw new Error("NFC_CLEANUP_RESPONSE_INVALID");
  return result.data;
}

export async function completeNfcEvidenceCleanup(assetId: string) {
  z.uuid().parse(assetId);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("complete_nfc_evidence_cleanup", { p_asset_id: assetId });
  if (error || data !== true) throw new Error("NFC_CLEANUP_COMPLETE_FAILED");
}
