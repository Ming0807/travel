import "server-only";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { nfcEvidenceInventoryFilters, nfcEvidenceInventoryRow } from "@/lib/validation/nfc-evidence-inventory";
const response = z.object({ rows: z.array(nfcEvidenceInventoryRow).max(21) }).strict()
  .refine(value => value.rows.every((row, index) => index === 0 || row.asset_id > value.rows[index - 1].asset_id));

export async function listNfcEvidenceInventory(input: unknown) {
  const filters = nfcEvidenceInventoryFilters.parse(input);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("list_nfc_evidence_inventory", {
    p_tag_id: filters.tagId, p_after_asset_id: filters.afterAssetId ?? null,
  });
  if (error) throw new Error("NFC_INVENTORY_READ_FAILED");
  const parsed = response.safeParse(data);
  if (!parsed.success || (filters.afterAssetId && parsed.data.rows.some(row => row.asset_id <= filters.afterAssetId!))) {
    throw new Error("NFC_INVENTORY_RESPONSE_INVALID");
  }
  return { rows: parsed.data.rows.slice(0, 20), nextAfterAssetId: parsed.data.rows.length > 20 ? parsed.data.rows[19].asset_id : null };
}
