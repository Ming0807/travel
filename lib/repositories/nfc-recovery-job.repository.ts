import "server-only";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

const outcome = z.enum(["provider_unavailable", "absent", "content_conflict", "namespace_changed", "actor_unavailable", "tag_changed"]);
const timestamp = z.iso.datetime({ offset: true });
const lease = z.object({ assetId: z.uuid(), leaseToken: z.uuid() }).strict();
const job = z.object({
  asset_id: z.uuid(), next_attempt_at: timestamp, attempt_count: z.number().int().positive().safe(),
  lease_token: z.uuid(), lease_expires_at: timestamp, last_attempt_at: timestamp,
  last_outcome: outcome.nullable(), review_required: z.literal(false), completed_at: z.null(),
}).strict().refine(value => Date.parse(value.lease_expires_at) > Date.parse(value.last_attempt_at)
  && Date.parse(value.next_attempt_at) <= Date.parse(value.last_attempt_at));
export type NfcRecoveryJob = z.infer<typeof job>;
export type NfcRecoveryOutcome = z.infer<typeof outcome>;

// Server-only worker adapters. Machine authorization is required upstream;
// a claimed job alone confers no finalization or deletion authority.
export async function claimNfcRecoveryJobs(limit = 1): Promise<NfcRecoveryJob[]> {
  z.number().int().min(1).max(5).parse(limit);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("claim_nfc_evidence_recovery", { p_limit: limit });
  if (error) throw new Error("NFC_RECOVERY_CLAIM_FAILED");
  const parsed = z.array(job).max(limit).refine(rows => new Set(rows.map(row => row.asset_id)).size === rows.length
    && new Set(rows.map(row => row.lease_token)).size === rows.length).safeParse(data);
  if (!parsed.success) throw new Error("NFC_RECOVERY_RESPONSE_INVALID");
  return parsed.data;
}

export async function renewNfcRecoveryLease(input: unknown): Promise<string> {
  const value = lease.parse(input);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("renew_nfc_evidence_recovery", {
    p_asset_id: value.assetId, p_lease_token: value.leaseToken,
  });
  if (error) throw new Error(error.message === "NFC_RECOVERY_LEASE_LOST" ? error.message : "NFC_RECOVERY_RENEW_FAILED");
  const parsed = timestamp.safeParse(data);
  if (!parsed.success) throw new Error("NFC_RECOVERY_RESPONSE_INVALID");
  return parsed.data;
}

export async function deferNfcRecoveryJob(input: unknown): Promise<true> {
  const value = lease.extend({ outcome }).parse(input);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("defer_nfc_evidence_recovery", {
    p_asset_id: value.assetId, p_lease_token: value.leaseToken, p_outcome: value.outcome,
  });
  if (error) throw new Error(error.message === "NFC_RECOVERY_LEASE_LOST" ? error.message : "NFC_RECOVERY_DEFER_FAILED");
  if (data !== true) throw new Error("NFC_RECOVERY_RESPONSE_INVALID");
  return true;
}

const verifiedContent = lease.extend({
  providerAccount: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/),
  storagePath: z.string().min(1).max(500), sha256: z.string().regex(/^[0-9a-f]{64}$/),
  sizeBytes: z.number().int().min(1).max(2097152),
  width: z.number().int().min(1).max(2560), height: z.number().int().min(1).max(2560),
});
const finalizationOutcomes = new Set([
  "NFC_RECOVERY_LEASE_LOST", "NFC_UPLOAD_ACTOR_UNAVAILABLE", "NFC_UPLOAD_TAG_UNAVAILABLE",
  "NFC_VERSION_CONFLICT", "NFC_UPLOAD_FINALIZE_CONFLICT", "NFC_UPLOAD_NOT_AVAILABLE",
  "NFC_UPLOAD_EXPIRED", "NFC_UPLOAD_ABANDONED", "NFC_UPLOAD_NOT_FOUND",
]);

// Caller must verify remote content and its durable namespace first. SQL derives
// the owner and atomically completes the job; a lost acknowledgement is not deletion permission.
export async function finalizeLeasedNfcRecovery(input: unknown): Promise<string> {
  const value = verifiedContent.parse(input);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("finalize_leased_nfc_recovery", {
    p_asset_id: value.assetId, p_lease_token: value.leaseToken, p_account: value.providerAccount,
    p_path: value.storagePath, p_sha256: value.sha256, p_size: value.sizeBytes,
    p_width: value.width, p_height: value.height,
  });
  if (error) throw new Error(finalizationOutcomes.has(error.message) ? error.message : "NFC_RECOVERY_FINALIZE_FAILED");
  if (data !== value.assetId) throw new Error("NFC_RECOVERY_RESPONSE_INVALID");
  return value.assetId;
}

const abandonmentOutcomes = new Set([
  "NFC_RECOVERY_LEASE_LOST", "NFC_UPLOAD_ACTOR_UNAVAILABLE", "NFC_UPLOAD_NOT_FOUND",
  "NFC_UPLOAD_NOT_ABANDONABLE", "NFC_UPLOAD_NOT_STALE",
]);

// Retires an expired intent only; caller must still reconcile/defer the retained job.
export async function abandonLeasedNfcRecovery(input: unknown): Promise<true> {
  const value = lease.parse(input);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("abandon_leased_nfc_recovery", {
    p_asset_id: value.assetId, p_lease_token: value.leaseToken,
  });
  if (error) throw new Error(abandonmentOutcomes.has(error.message) ? error.message : "NFC_RECOVERY_ABANDON_FAILED");
  if (data !== true) throw new Error("NFC_RECOVERY_RESPONSE_INVALID");
  return true;
}
