import { z } from "zod";

export const nfcRecoveryRetryInput = z.object({
  requestId: z.uuid(), tagId: z.uuid(), assetId: z.uuid(),
  expectedAttemptCount: z.number().int().min(1).max(2147483647),
  reason: z.enum(["provider_restored", "connectivity_restored", "recheck_requested"]),
}).strict();
export type NfcRecoveryRetryInput = z.infer<typeof nfcRecoveryRetryInput>;
