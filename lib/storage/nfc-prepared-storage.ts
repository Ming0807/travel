import "server-only";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import { getServerEnv } from "@/lib/config/server-env";
import { getPublicEnv } from "@/lib/config/public-env";
import { uploadPrivateFile } from "@/lib/storage/private-files";

export function getNfcUploadDestination() {
  const env = getServerEnv();
  if (env.STORAGE_PROVIDER === "supabase") {
    const endpoint = new URL(getPublicEnv().NEXT_PUBLIC_SUPABASE_URL);
    if (endpoint.username || endpoint.password || endpoint.search || endpoint.hash) throw new Error("NFC_UPLOAD_DESTINATION_INVALID");
    const canonical = `${endpoint.origin}${endpoint.pathname.replace(/\/+$/, "")}`;
    return { provider: "supabase" as const, provider_account: createHash("sha256").update(canonical).digest("hex"), storage_prefix: "nfc-evidence" };
  }
  if (env.STORAGE_PROVIDER === "cloudinary") {
    const account = env.CLOUDINARY_CLOUD_NAME;
    const folder = env.CLOUDINARY_UPLOAD_FOLDER.split("/").map(part => part.trim()).filter(Boolean).join("/");
    const prefix = [folder, "nfc-evidence"].filter(Boolean).join("/");
    if (!account || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/.test(account)
      || prefix.length > 200 || !/^([A-Za-z0-9_-]+\/)*nfc-evidence$/.test(prefix)) throw new Error("NFC_UPLOAD_DESTINATION_INVALID");
    return { provider: "cloudinary" as const, provider_account: account, storage_prefix: prefix };
  }
  throw new Error("NFC_UPLOAD_DESTINATION_INVALID");
}

const uploadBinding = z.object({
  asset_id: z.uuid(), state: z.literal("prepared"), provider: z.enum(["supabase", "cloudinary"]),
  provider_account: z.string(), storage_prefix: z.string(), object_key: z.string(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/), size_bytes: z.number().int().min(1).max(2097152),
  width: z.number().int().min(1).max(2560), height: z.number().int().min(1).max(2560),
});

// Dormant: input must come from the authorized, validated durable-intent read.
// Upload acknowledgement is NOT independent verification of remote bytes.
export async function uploadPreparedNfcEvidence(input: unknown, bytes: Buffer) {
  const intent = uploadBinding.parse(input);
  if (bytes.length !== intent.size_bytes) throw new Error("NFC_UPLOAD_CONTENT_MISMATCH");
  // Preserve the validated bytes while decoding yields to other requests/callers.
  const payload = Buffer.from(bytes);
  const assertDestination = () => {
    const current = getNfcUploadDestination();
    if (current.provider !== intent.provider || current.provider_account !== intent.provider_account
      || current.storage_prefix !== intent.storage_prefix) throw new Error("NFC_UPLOAD_DESTINATION_CHANGED");
  };
  assertDestination();
  const logicalPath = `nfc-evidence/${intent.asset_id}.webp`;
  const expectedKey = intent.provider === "supabase" ? logicalPath : `${intent.storage_prefix}/${intent.asset_id}`;
  if (intent.object_key !== expectedKey) throw new Error("NFC_UPLOAD_DESTINATION_CHANGED");
  if (createHash("sha256").update(payload).digest("hex") !== intent.sha256) {
    throw new Error("NFC_UPLOAD_CONTENT_MISMATCH");
  }
  try {
    const metadata = await sharp(payload, { limitInputPixels: 2560 * 2560 }).metadata();
    if (metadata.format !== "webp" || metadata.width !== intent.width || metadata.height !== intent.height
      || (metadata.pages ?? 1) !== 1) throw new Error("NFC_UPLOAD_CONTENT_MISMATCH");
  } catch { throw new Error("NFC_UPLOAD_CONTENT_MISMATCH"); }
  // Recheck after asynchronous decoding and immediately before provider selection.
  assertDestination();
  const stored = await uploadPrivateFile({ bucket: "nfc-evidence", path: logicalPath, data: payload, contentType: "image/webp" });
  const pathMatches = intent.provider === "supabase" ? stored.storagePath === expectedKey
    : /^cloudinary:image:authenticated:v[1-9][0-9]{0,15}:webp:/.test(stored.storagePath)
      && stored.storagePath.replace(/^cloudinary:image:authenticated:v[1-9][0-9]{0,15}:webp:/, "") === expectedKey;
  if (stored.provider !== intent.provider || stored.bucket !== "nfc-evidence" || !pathMatches) {
    // The object may exist even on mismatched/ambiguous responses; never delete here.
    throw new Error("NFC_UPLOAD_STORAGE_RESPONSE_INVALID");
  }
  return stored;
}
