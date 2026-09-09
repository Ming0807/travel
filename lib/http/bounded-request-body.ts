export class RequestBodyLimitError extends Error {}

export async function readBoundedRequestBody(request: Request, limit: number): Promise<ArrayBuffer> {
  if (!Number.isSafeInteger(limit) || limit < 1) throw new Error("INVALID_BODY_LIMIT");
  const length = request.headers.get("content-length");
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > limit)) throw new RequestBodyLimitError();
  if (!request.body) throw new RequestBodyLimitError();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limit) {
        void reader.cancel().catch(() => undefined);
        throw new RequestBodyLimitError();
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  if (total === 0 || (length !== null && Number(length) !== total)) throw new RequestBodyLimitError();
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.byteLength; }
  return result.buffer;
}
