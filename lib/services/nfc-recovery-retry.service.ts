import "server-only";
import { requirePermission } from "@/lib/auth/guards";
import { nfcEvidenceRecoveryEnabled, nfcEvidenceOperatorRetryEnabled } from "@/lib/config/nfc-evidence";
import { enqueueNfcRecoveryRetry } from "@/lib/repositories/nfc-recovery-retry.repository";
import { nfcRecoveryRetryInput } from "@/lib/validation/nfc-recovery-retry";

// Dormant operator entry; no route or browser action calls it yet.
export async function requestNfcRecoveryRetry(input: unknown) {
  const { adminId } = await requirePermission("checkin_code.manage");
  const value = nfcRecoveryRetryInput.parse(input);
  if (!nfcEvidenceRecoveryEnabled() || !nfcEvidenceOperatorRetryEnabled()) return { enabled: false as const };
  const requestId = await enqueueNfcRecoveryRetry({ ...value, operatorId: adminId });
  return { enabled: true as const, requestId };
}
