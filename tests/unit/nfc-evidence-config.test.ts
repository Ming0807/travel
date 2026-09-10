import { expect, it } from "vitest";
import { nfcEvidenceUploadEnabled, nfcEvidenceRecoveryEnabled } from "@/lib/config/nfc-evidence";
it("is disabled unless explicitly true and rejects malformed flags", () => {
  for (const flag of [undefined, "", "false"]) expect(nfcEvidenceUploadEnabled({ NFC_EVIDENCE_UPLOAD_ENABLED: flag })).toBe(false);
  expect(nfcEvidenceUploadEnabled({ NFC_EVIDENCE_UPLOAD_ENABLED: "true" })).toBe(true);
  for (const flag of ["1", "TRUE", "yes"]) expect(() => nfcEvidenceUploadEnabled({ NFC_EVIDENCE_UPLOAD_ENABLED: flag })).toThrow();
});
it("keeps recovery independently disabled and accepts only literal true", () => {
  for (const flag of [undefined, "", "false"]) expect(nfcEvidenceRecoveryEnabled({ NFC_EVIDENCE_RECOVERY_ENABLED: flag, NFC_EVIDENCE_UPLOAD_ENABLED: "true" })).toBe(false);
  expect(nfcEvidenceRecoveryEnabled({ NFC_EVIDENCE_RECOVERY_ENABLED: "true" })).toBe(true);
  for (const flag of ["1", "TRUE", "yes"]) expect(() => nfcEvidenceRecoveryEnabled({ NFC_EVIDENCE_RECOVERY_ENABLED: flag })).toThrow();
});
