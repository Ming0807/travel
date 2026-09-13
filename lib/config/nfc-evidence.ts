export function nfcEvidenceUploadEnabled(source: Record<string, string | undefined> = process.env) {
  const flag = source.NFC_EVIDENCE_UPLOAD_ENABLED;
  if (flag === undefined || flag === "" || flag === "false") return false;
  if (flag !== "true") throw new Error("NFC_EVIDENCE_UPLOAD_ENABLED must be exactly true or false");
  return true;
}

export function nfcEvidenceRecoveryEnabled(source: Record<string, string | undefined> = process.env) {
  const flag = source.NFC_EVIDENCE_RECOVERY_ENABLED;
  if (flag === undefined || flag === "" || flag === "false") return false;
  if (flag !== "true") throw new Error("NFC_EVIDENCE_RECOVERY_ENABLED must be exactly true or false");
  return true;
}

export function nfcEvidenceOperatorRetryEnabled(source: Record<string, string | undefined> = process.env) {
  const flag = source.NFC_EVIDENCE_OPERATOR_RETRY_ENABLED;
  if (flag === undefined || flag === "" || flag === "false") return false;
  if (flag !== "true") throw new Error("NFC_EVIDENCE_OPERATOR_RETRY_ENABLED must be exactly true or false");
  return true;
}
