import { expect, it } from "vitest";
import { nfcEvidenceUploadEnabled } from "@/lib/config/nfc-evidence";
it("is disabled unless explicitly true and rejects malformed flags", () => {
  for (const flag of [undefined, "", "false"]) expect(nfcEvidenceUploadEnabled({ NFC_EVIDENCE_UPLOAD_ENABLED: flag })).toBe(false);
  expect(nfcEvidenceUploadEnabled({ NFC_EVIDENCE_UPLOAD_ENABLED: "true" })).toBe(true);
  for (const flag of ["1", "TRUE", "yes"]) expect(() => nfcEvidenceUploadEnabled({ NFC_EVIDENCE_UPLOAD_ENABLED: flag })).toThrow();
});
