import "server-only";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import { getPublicEnv } from "@/lib/config/public-env";
import { getNfcUploadDestination } from "@/lib/storage/nfc-prepared-storage";
import { createPrivateFileSignedUrl } from "@/lib/storage/private-files";

const schema = z.object({
  asset_id: z.uuid(), provider: z.enum(["supabase", "cloudinary"]), provider_account: z.string(),
  storage_prefix: z.string(), object_key: z.string(), storage_path: z.string(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/), size_bytes: z.number().int().min(1).max(2097152),
  width: z.number().int().min(1).max(2560), height: z.number().int().min(1).max(2560),
});

// Server-only, authorized durable metadata only. No browser-provided fetch URL.
// Missing/error responses are not proof of permanent absence or safe deletion.
async function readNfcEvidenceContent(input: unknown) {
  const expected = schema.parse(input);
  const assertDestination = () => {
    const destination = getNfcUploadDestination();
    if (destination.provider !== expected.provider || destination.provider_account !== expected.provider_account
      || destination.storage_prefix !== expected.storage_prefix) throw new Error("NFC_UPLOAD_DESTINATION_CHANGED");
  };
  assertDestination();
  const key = `${expected.storage_prefix}/${expected.asset_id}${expected.provider === "supabase" ? ".webp" : ""}`;
  const pathMatches = expected.provider === "supabase" ? expected.storage_path === key
    : /^cloudinary:image:authenticated:v[1-9][0-9]{0,15}:webp:/.test(expected.storage_path)
      && expected.storage_path.replace(/^cloudinary:image:authenticated:v[1-9][0-9]{0,15}:webp:/, "") === key;
  if (expected.object_key !== key || !pathMatches) throw new Error("NFC_READBACK_URL_INVALID");
  let signed: string;
  let signingDeadline: ReturnType<typeof setTimeout> | undefined;
  try {
    signed = await Promise.race([
      createPrivateFileSignedUrl("nfc-evidence", expected.storage_path, 60),
      new Promise<never>((_, reject) => { signingDeadline = setTimeout(() => reject(new Error("NFC_READBACK_UNAVAILABLE")), 15000); }),
    ]);
  }
  catch { throw new Error("NFC_READBACK_UNAVAILABLE"); }
  finally { if (signingDeadline !== undefined) clearTimeout(signingDeadline); }
  assertDestination();
  let url: URL;
  try { url = new URL(signed); } catch { throw new Error("NFC_READBACK_URL_INVALID"); }
  const allowedOrigin = expected.provider === "supabase"
    ? new URL(getPublicEnv().NEXT_PUBLIC_SUPABASE_URL).origin : "https://api.cloudinary.com";
  if (url.origin !== allowedOrigin || url.username || url.password || url.hash
    || (url.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))) {
    throw new Error("NFC_READBACK_URL_INVALID");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let bytes: Buffer;
  try {
    const response = await fetch(url, { cache: "no-store", redirect: "error", signal: controller.signal });
    assertDestination();
    if (response.status === 404) throw new Error("NFC_READBACK_ABSENT");
    if (!response.ok || !response.body) throw new Error("NFC_READBACK_UNAVAILABLE");
    reader = response.body.getReader();
    const chunks: Buffer[] = []; let size = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > expected.size_bytes) throw new Error("NFC_READBACK_CONTENT_MISMATCH");
      chunks.push(Buffer.from(chunk.value));
    }
    bytes = Buffer.concat(chunks, size);
  } catch (error) {
    if (error instanceof Error && ["NFC_READBACK_CONTENT_MISMATCH", "NFC_READBACK_ABSENT", "NFC_UPLOAD_DESTINATION_CHANGED"].includes(error.message)) throw error;
    throw new Error("NFC_READBACK_UNAVAILABLE");
  } finally {
    controller.abort(); clearTimeout(timeout);
    if (reader) { await reader.cancel().catch(() => undefined); reader.releaseLock(); }
  }
  assertDestination();
  if (bytes.length !== expected.size_bytes || createHash("sha256").update(bytes).digest("hex") !== expected.sha256) {
    throw new Error("NFC_READBACK_CONTENT_MISMATCH");
  }
  try {
    const metadata = await sharp(bytes, { limitInputPixels: 2560 * 2560 }).metadata();
    if (metadata.format !== "webp" || metadata.width !== expected.width || metadata.height !== expected.height
      || (metadata.pages ?? 1) !== 1) throw new Error("NFC_READBACK_CONTENT_MISMATCH");
  } catch { throw new Error("NFC_READBACK_CONTENT_MISMATCH"); }
  return { storagePath: expected.storage_path, sha256: expected.sha256, sizeBytes: bytes.length,
    width: expected.width, height: expected.height };
}

export async function verifyNfcEvidenceReadback(input: unknown) {
  try { return await readNfcEvidenceContent(input); }
  catch (error) {
    if (error instanceof Error && error.message === "NFC_READBACK_ABSENT") throw new Error("NFC_READBACK_UNAVAILABLE");
    throw error;
  }
}

export type NfcRecoveryReadbackObservation = {
  status: "verified"; content: Awaited<ReturnType<typeof readNfcEvidenceContent>>;
} | { status: "absent" | "provider_unavailable" | "namespace_changed" | "content_conflict" };

// Internal observation only. A signed endpoint 404 is not permanent absence,
// cleanup permission or permission to complete a recovery job.
export async function inspectNfcRecoveryReadback(input: unknown): Promise<NfcRecoveryReadbackObservation> {
  try { return { status: "verified", content: await readNfcEvidenceContent(input) }; }
  catch (error) {
    if (!(error instanceof Error)) throw error;
    switch (error.message) {
      case "NFC_READBACK_ABSENT": return { status: "absent" };
      case "NFC_READBACK_UNAVAILABLE": return { status: "provider_unavailable" };
      case "NFC_UPLOAD_DESTINATION_CHANGED": return { status: "namespace_changed" };
      case "NFC_READBACK_URL_INVALID":
      case "NFC_READBACK_CONTENT_MISMATCH": return { status: "content_conflict" };
      default: throw error;
    }
  }
}
