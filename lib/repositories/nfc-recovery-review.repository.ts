import "server-only";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { nfcRecoveryReviewFilters, nfcRecoveryHistoryFilters, nfcRecoveryReviewRow, nfcRecoveryHistoryRow } from "@/lib/validation/nfc-recovery-review";

const listResponse = z.object({ rows: z.array(nfcRecoveryReviewRow).max(21), page: z.number().int().min(1).max(10000) }).strict()
  .refine(value => new Set(value.rows.map(row => row.asset_id)).size === value.rows.length);
const historyResponse = z.object({ rows: z.array(nfcRecoveryHistoryRow).max(21) }).strict()
  .refine(value => value.rows.every((row, index) => index === 0 || BigInt(row.event_id) < BigInt(value.rows[index - 1].event_id)));

// Explicit SQL projection plus strict response validation prevents private queue fields reaching callers.
export async function listNfcRecoveryReview(input: unknown) {
  const filters = nfcRecoveryReviewFilters.parse(input);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("list_nfc_evidence_recovery", {
    p_tag_id: filters.tagId, p_page: filters.page,
  });
  if (error) throw new Error("NFC_RECOVERY_REVIEW_FAILED");
  const parsed = listResponse.safeParse(data);
  if (!parsed.success || parsed.data.page !== filters.page) throw new Error("NFC_RECOVERY_REVIEW_RESPONSE_INVALID");
  return { rows: parsed.data.rows.slice(0, 20), page: filters.page, pageSize: 20, hasMore: parsed.data.rows.length > 20 };
}

export async function listNfcRecoveryReviewHistory(input: unknown) {
  const filters = nfcRecoveryHistoryFilters.parse(input);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("list_nfc_evidence_recovery_history", {
    p_tag_id: filters.tagId, p_asset_id: filters.assetId, p_before_id: filters.beforeId ?? null,
  });
  if (error) throw new Error("NFC_RECOVERY_REVIEW_FAILED");
  const parsed = historyResponse.safeParse(data);
  if (!parsed.success || (filters.beforeId && parsed.data.rows.some(row => BigInt(row.event_id) >= BigInt(filters.beforeId!)))) {
    throw new Error("NFC_RECOVERY_REVIEW_RESPONSE_INVALID");
  }
  return { rows: parsed.data.rows.slice(0, 20), nextBeforeId: parsed.data.rows.length > 20 ? parsed.data.rows[19].event_id : null };
}
