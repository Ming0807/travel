import type { NfcRecoveryReviewRow } from "@/lib/validation/nfc-recovery-review";
const states = ["review", "processing", "completed", "waiting", "ready"] as const;
const rows: NfcRecoveryReviewRow[] = states.map((status, index) => ({
  asset_id: `40000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`, tag_version: 2,
  intent_state: status === "completed" ? "available" : status === "review" ? "abandoned" : "prepared",
  created_at: "2026-09-11T00:00:00Z", attempt_count: index + 1, last_attempt_at: "2026-09-11T01:00:00Z",
  next_attempt_at: "2026-09-11T01:05:00Z", last_outcome: status === "review" ? "content_conflict" : status === "waiting" ? "provider_unavailable" : null,
  completed_at: status === "completed" ? "2026-09-11T01:01:00Z" : null, status,
}));
export async function getAdminNfcRecoveryAction(input: { page?: number }) {
  return { success: true as const, enabled: true as const, retryEnabled: true, rows: input.page === 2 ? [] : rows, page: input.page ?? 1, pageSize: 20, hasMore: input.page !== 2 };
}
export async function getAdminNfcRecoveryHistoryAction(input: { beforeId?: string }) {
  return { success: true as const, enabled: true as const, nextBeforeId: input.beforeId ? null : "20",
    rows: [{ event_id: input.beforeId ? "19" : "20", occurred_at: "2026-09-11T01:00:00Z", event_type: "review" as const,
      attempt_count: 1, outcome: "content_conflict" as const, next_attempt_at: "2026-09-11T01:05:00Z" }] };
}
