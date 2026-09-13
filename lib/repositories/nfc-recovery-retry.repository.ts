import "server-only";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { nfcRecoveryRetryInput } from "@/lib/validation/nfc-recovery-retry";

const inputSchema = nfcRecoveryRetryInput.extend({ operatorId: z.uuid() });
const knownErrors = new Set([
  "NFC_RECOVERY_RETRY_INPUT_INVALID", "NFC_RECOVERY_RETRY_FORBIDDEN", "NFC_RECOVERY_RETRY_REQUEST_CONFLICT",
  "NFC_RECOVERY_RETRY_SCOPE_INVALID", "NFC_RECOVERY_RETRY_UNAVAILABLE", "NFC_RECOVERY_RETRY_STALE",
  "NFC_UPLOAD_ACTOR_UNAVAILABLE", "NFC_UPLOAD_TAG_UNAVAILABLE", "NFC_VERSION_CONFLICT",
]);

// SQL owns queue + receipt + journal + mandatory audit. Do not split these writes.
export async function enqueueNfcRecoveryRetry(input: unknown): Promise<string> {
  const value = inputSchema.parse(input);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("request_nfc_evidence_recovery_retry", {
    p_request_id: value.requestId, p_tag_id: value.tagId, p_asset_id: value.assetId,
    p_operator_id: value.operatorId, p_attempt_count: value.expectedAttemptCount, p_reason: value.reason,
  });
  if (error) throw new Error(knownErrors.has(error.message) ? error.message : "NFC_RECOVERY_RETRY_FAILED");
  if (data !== value.requestId) throw new Error("NFC_RECOVERY_RETRY_RESPONSE_INVALID");
  return value.requestId;
}
