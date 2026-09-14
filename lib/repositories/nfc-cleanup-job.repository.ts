import "server-only";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

const uuid = z.uuid().transform(value => value.toLowerCase());
const timestamp = z.iso.datetime({ offset: true });
const outcome = z.enum(["provider_unavailable", "absent", "content_conflict", "namespace_changed", "settlement_unproven"]);
const lease = z.object({ assetId: uuid, leaseToken: uuid }).strict();
const job = z.object({
  asset_id: uuid, next_attempt_at: timestamp, attempt_count: z.number().int().positive().safe(),
  lease_token: uuid, lease_expires_at: timestamp, last_attempt_at: timestamp,
  last_outcome: outcome.nullable(), review_required: z.literal(false),
}).strict().refine(value => Date.parse(value.lease_expires_at) > Date.parse(value.last_attempt_at)
  && Date.parse(value.next_attempt_at) <= Date.parse(value.last_attempt_at));
const binding = z.object({
  asset_id: uuid, provider: z.enum(["supabase", "cloudinary"]),
  provider_account: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/),
  storage_prefix: z.string().max(200).regex(/^([A-Za-z0-9_-]+\/)*nfc-evidence$/),
  object_key: z.string().max(250), storage_path: z.string().max(500),
  sha256: z.string().regex(/^[0-9a-f]{64}$/), size_bytes: z.number().int().min(1).max(2097152),
  width: z.number().int().min(1).max(2560), height: z.number().int().min(1).max(2560),
}).strict().refine(value => {
  const key = `${value.storage_prefix}/${value.asset_id}${value.provider === "supabase" ? ".webp" : ""}`;
  if (value.object_key !== key) return false;
  if (value.provider === "supabase") return value.storage_prefix === "nfc-evidence" && value.storage_path === key;
  const prefix = /^cloudinary:image:authenticated:v[1-9][0-9]{0,15}:webp:/;
  return prefix.test(value.storage_path) && value.storage_path.replace(prefix, "") === key;
});
export type NfcCleanupJob = z.infer<typeof job>;
export type NfcCleanupBinding = z.infer<typeof binding>;
export type NfcCleanupOutcome = z.infer<typeof outcome>;

// Internal machine-authorized callers only. Binding/lease reads do not authorize deletion.
export async function claimNfcCleanupJobs(limit = 1): Promise<NfcCleanupJob[]> {
  z.number().int().min(1).max(5).parse(limit);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("claim_nfc_cleanup_jobs", { p_limit: limit });
  if (error) throw new Error("NFC_CLEANUP_CLAIM_FAILED");
  const parsed = z.array(job).max(limit).refine(rows => new Set(rows.map(row => row.asset_id)).size === rows.length
    && new Set(rows.map(row => row.lease_token)).size === rows.length).safeParse(data);
  if (!parsed.success) throw new Error("NFC_CLEANUP_RESPONSE_INVALID");
  return parsed.data;
}

export async function readNfcCleanupBinding(input: unknown): Promise<NfcCleanupBinding> {
  const value = lease.parse(input);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("read_leased_nfc_cleanup_binding", {
    p_asset_id: value.assetId, p_lease_token: value.leaseToken,
  });
  if (error) throw new Error(error.message === "NFC_CLEANUP_LEASE_LOST" ? error.message : "NFC_CLEANUP_READ_FAILED");
  const parsed = binding.safeParse(data);
  if (!parsed.success || parsed.data.asset_id !== value.assetId) throw new Error("NFC_CLEANUP_RESPONSE_INVALID");
  return parsed.data;
}

export async function renewNfcCleanupLease(input: unknown): Promise<string> {
  const value = lease.parse(input);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("renew_nfc_cleanup_job", {
    p_asset_id: value.assetId, p_lease_token: value.leaseToken,
  });
  if (error) throw new Error(error.message === "NFC_CLEANUP_LEASE_LOST" ? error.message : "NFC_CLEANUP_RENEW_FAILED");
  const parsed = timestamp.safeParse(data);
  if (!parsed.success) throw new Error("NFC_CLEANUP_RESPONSE_INVALID");
  return parsed.data;
}

export async function deferNfcCleanupJob(input: unknown): Promise<true> {
  const value = lease.extend({ outcome }).parse(input);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("defer_nfc_cleanup_job", {
    p_asset_id: value.assetId, p_lease_token: value.leaseToken, p_outcome: value.outcome,
  });
  if (error) throw new Error(error.message === "NFC_CLEANUP_LEASE_LOST" ? error.message : "NFC_CLEANUP_DEFER_FAILED");
  if (data !== true) throw new Error("NFC_CLEANUP_RESPONSE_INVALID");
  return true;
}
