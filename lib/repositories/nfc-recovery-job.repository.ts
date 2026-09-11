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

// Server-only scheduling adapter. Machine authorization is required upstream;
// these calls alone confer no finalization or deletion authority.
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
