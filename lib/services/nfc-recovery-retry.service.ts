import "server-only";
import { requirePermission } from "@/lib/auth/guards";
import { nfcEvidenceRecoveryEnabled, nfcEvidenceOperatorRetryEnabled } from "@/lib/config/nfc-evidence";
import { enqueueNfcRecoveryRetry } from "@/lib/repositories/nfc-recovery-retry.repository";
import { nfcRecoveryRetryInput } from "@/lib/validation/nfc-recovery-retry";

// Permission-checked operator entry; both rollout gates remain disabled by default.
export async function requestNfcRecoveryRetry(input: unknown) {
  const { adminId } = await requirePermission("checkin_code.manage", { unauthenticated: "throw" });
  const value = nfcRecoveryRetryInput.parse(input);
  if (!nfcEvidenceRecoveryEnabled() || !nfcEvidenceOperatorRetryEnabled()) return { enabled: false as const };
  const requestId = await enqueueNfcRecoveryRetry({ ...value, operatorId: adminId });
  return { enabled: true as const, requestId };
}
