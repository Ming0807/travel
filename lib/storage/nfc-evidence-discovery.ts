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
async function lookupNfcEvidenceLocator(input: unknown): Promise<string> {
  const binding = bindingSchema.parse(input);
  const assertDestination = () => {
    const destination = getNfcUploadDestination();
    if (binding.provider !== destination.provider || binding.provider_account !== destination.provider_account
      || binding.storage_prefix !== destination.storage_prefix) throw new Error("NFC_UPLOAD_DESTINATION_CHANGED");
  };
  assertDestination();
  const key = `${binding.storage_prefix}/${binding.asset_id}${binding.provider === "supabase" ? ".webp" : ""}`;
  if (binding.object_key !== key) throw new Error("NFC_UPLOAD_DISCOVERY_CONFLICT");
  if (binding.provider === "supabase") return key;
  const env = getServerEnv();
  if (env.CLOUDINARY_CLOUD_NAME !== binding.provider_account || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error("NFC_UPLOAD_DESTINATION_CHANGED");
  }
  let response: unknown;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  try {
    // SDK timeout is a socket timeout. Bound our wait independently; timeout is
    // not cancellation of provider work and never establishes permanent absence.
    response = await Promise.race([
      cloudinary.api.resource(key, { cloud_name: binding.provider_account,
        api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET,
        resource_type: "image", type: "authenticated", timeout: 15000 }),
      new Promise<never>((_, reject) => { deadline = setTimeout(() => reject(new Error("NFC_UPLOAD_DISCOVERY_UNAVAILABLE")), 15000); }),
    ]);
  } catch (error) {
    assertDestination();
    // Only the SDK's parsed resource-not-found response for this exact key is
    // an absence observation. Transport errors and malformed JSON are not.
    const absent = z.object({ error: z.object({ http_code: z.literal(404),
      message: z.literal(`Resource not found - ${key}`) }) }).safeParse(error);
    throw new Error(absent.success ? "NFC_UPLOAD_PROVIDER_ABSENT" : "NFC_UPLOAD_DISCOVERY_UNAVAILABLE");
  }
  finally { if (deadline !== undefined) clearTimeout(deadline); }
  assertDestination();
  const parsed = resourceSchema.safeParse(response);
  if (!parsed.success || parsed.data.public_id !== key) throw new Error("NFC_UPLOAD_DISCOVERY_CONFLICT");
  return `cloudinary:image:authenticated:v${parsed.data.version}:webp:${key}`;
}

export async function discoverNfcEvidenceLocator(input: unknown): Promise<string> {
  try { return await lookupNfcEvidenceLocator(input); }
  catch (error) {
    if (error instanceof Error && error.message === "NFC_UPLOAD_PROVIDER_ABSENT") {
      throw new Error("NFC_UPLOAD_DISCOVERY_UNAVAILABLE");
    }
    throw error;
  }
}

export type NfcRecoveryLocatorObservation = { status: "located"; storagePath: string }
  | { status: "absent" | "provider_unavailable" | "namespace_changed" | "content_conflict" };

// A located key still requires byte verification (Supabase keys are deterministic).
// Absence is one observation only: never settlement, completion or deletion authority.
export async function inspectNfcRecoveryLocator(input: unknown): Promise<NfcRecoveryLocatorObservation> {
  try { return { status: "located", storagePath: await lookupNfcEvidenceLocator(input) }; }
  catch (error) {
    if (!(error instanceof Error)) throw error;
    switch (error.message) {
      case "NFC_UPLOAD_PROVIDER_ABSENT": return { status: "absent" };
      case "NFC_UPLOAD_DISCOVERY_UNAVAILABLE": return { status: "provider_unavailable" };
      case "NFC_UPLOAD_DESTINATION_CHANGED": return { status: "namespace_changed" };
      case "NFC_UPLOAD_DISCOVERY_CONFLICT": return { status: "content_conflict" };
      default: throw error;
    }
  }
}
