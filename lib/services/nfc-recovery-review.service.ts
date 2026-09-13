import "server-only";
import { requirePermission } from "@/lib/auth/guards";
import { nfcEvidenceRecoveryEnabled, nfcEvidenceOperatorRetryEnabled } from "@/lib/config/nfc-evidence";
import { listNfcRecoveryReview, listNfcRecoveryReviewHistory } from "@/lib/repositories/nfc-recovery-review.repository";
import { nfcRecoveryReviewFilters, nfcRecoveryHistoryFilters } from "@/lib/validation/nfc-recovery-review";
import { logAuditAction } from "@/lib/services/audit-log.service";

export async function getNfcRecoveryReview(input: unknown) {
  const guard = await requirePermission("checkin_code.manage");
  const filters = nfcRecoveryReviewFilters.parse(input);
  if (!nfcEvidenceRecoveryEnabled()) return { enabled: false as const };
  const result = await listNfcRecoveryReview(filters);
  await logAuditAction({ actor: guard.actor, action: "nfc_recovery.review_read", entityType: "nfc_tag", entityId: filters.tagId,
    metadata: { page: result.page, count: result.rows.length, hasMore: result.hasMore } });
  let retryEnabled = false;
  try { retryEnabled = nfcEvidenceOperatorRetryEnabled(); } catch { /* Invalid mutation rollout must not hide read-only review. */ }
  return { enabled: true as const, ...result, retryEnabled };
}

export async function getNfcRecoveryReviewHistory(input: unknown) {
  const guard = await requirePermission("checkin_code.manage");
  const filters = nfcRecoveryHistoryFilters.parse(input);
  if (!nfcEvidenceRecoveryEnabled()) return { enabled: false as const };
  const result = await listNfcRecoveryReviewHistory(filters);
  await logAuditAction({ actor: guard.actor, action: "nfc_recovery.history_read", entityType: "nfc_evidence", entityId: filters.assetId,
    metadata: { tagId: filters.tagId, count: result.rows.length, hasMore: result.nextBeforeId !== null } });
  return { enabled: true as const, ...result };
}
