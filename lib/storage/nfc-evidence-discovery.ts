import "server-only";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { getServerEnv } from "@/lib/config/server-env";
import { getNfcUploadDestination } from "@/lib/storage/nfc-prepared-storage";

const bindingSchema = z.object({asset_id:z.uuid(),provider:z.enum(["supabase","cloudinary"]),
  provider_account:z.string(),storage_prefix:z.string(),object_key:z.string()});
const resourceSchema = z.object({public_id:z.string(),resource_type:z.literal("image"),type:z.literal("authenticated"),
  format:z.literal("webp"),version:z.number().int().positive().safe()});

// Exact-key metadata discovery only. Callers must still verify actual private bytes.
export async function discoverNfcEvidenceLocator(input: unknown): Promise<string> {
  const binding = bindingSchema.parse(input);
  const destination = getNfcUploadDestination();
  if (binding.provider !== destination.provider || binding.provider_account !== destination.provider_account
    || binding.storage_prefix !== destination.storage_prefix) throw new Error("NFC_UPLOAD_DESTINATION_CHANGED");
  const key = `${binding.storage_prefix}/${binding.asset_id}${binding.provider === "supabase" ? ".webp" : ""}`;
  if (binding.object_key !== key) throw new Error("NFC_UPLOAD_DISCOVERY_CONFLICT");
  if (binding.provider === "supabase") return key;
  const env = getServerEnv();
  if (env.CLOUDINARY_CLOUD_NAME !== binding.provider_account || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error("NFC_UPLOAD_DESTINATION_CHANGED");
  }
  let response: unknown;
  try {
    response = await cloudinary.api.resource(key, { cloud_name: binding.provider_account,
      api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET,
      resource_type: "image", type: "authenticated", timeout: 15000 });
  } catch { throw new Error("NFC_UPLOAD_DISCOVERY_UNAVAILABLE"); }
  const parsed = resourceSchema.safeParse(response);
  if (!parsed.success || parsed.data.public_id !== key) throw new Error("NFC_UPLOAD_DISCOVERY_CONFLICT");
  return `cloudinary:image:authenticated:v${parsed.data.version}:webp:${key}`;
}
