import { z } from "zod";

const timestamp = z.iso.datetime({ offset: true });
const outcome = z.enum(["provider_unavailable", "absent", "content_conflict", "namespace_changed", "actor_unavailable", "tag_changed"]);
const eventId = z.string().regex(/^[1-9][0-9]{0,18}$/).pipe(z.string().refine(value => BigInt(value) <= 9223372036854775807n));
export const nfcRecoveryReviewFilters = z.object({ tagId: z.uuid(), page: z.number().int().min(1).max(10000).default(1) }).strict();
export const nfcRecoveryHistoryFilters = z.object({ tagId: z.uuid(), assetId: z.uuid(), beforeId: eventId.optional() }).strict();
export const nfcRecoveryReviewRow = z.object({
  asset_id: z.uuid(), tag_version: z.number().int().positive().safe(),
  intent_state: z.enum(["prepared", "available", "abandoned"]), created_at: timestamp,
  attempt_count: z.number().int().nonnegative().safe(), last_attempt_at: timestamp.nullable(),
  next_attempt_at: timestamp, last_outcome: outcome.nullable(), completed_at: timestamp.nullable(),
  status: z.enum(["waiting", "ready", "processing", "review", "completed"]),
}).strict().refine(row => (row.status === "completed") === (row.completed_at !== null));
export const nfcRecoveryHistoryRow = z.object({
  event_id: eventId, occurred_at: timestamp,
  event_type: z.enum(["snapshot", "queued", "claimed", "renewed", "deferred", "review", "completed"]),
  attempt_count: z.number().int().nonnegative().safe(), outcome: outcome.nullable(), next_attempt_at: timestamp,
}).strict();
export type NfcRecoveryReviewRow = z.infer<typeof nfcRecoveryReviewRow>;
export type NfcRecoveryHistoryRow = z.infer<typeof nfcRecoveryHistoryRow>;
