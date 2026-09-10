export class NfcEvidenceUploadError extends Error {
  constructor(message: string, public readonly retryable: boolean) {
    super(message);
    this.name = "NfcEvidenceUploadError";
  }
}
