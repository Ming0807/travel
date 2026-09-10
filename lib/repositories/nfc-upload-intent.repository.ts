import "server-only";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

const bindingSchema = z.object({
  request_id: z.uuid(), actor_id: z.uuid(), nfc_tag_id: z.uuid(),
  tag_version: z.number().int().positive(), provider: z.enum(["supabase", "cloudinary"]),
  provider_account: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,199}$/),
  storage_prefix: z.string().max(200).regex(/^([A-Za-z0-9_-]+\/)*nfc-evidence$/),
  sha256: z.string().regex(/^[0-9a-f]{64}$/), size_bytes: z.number().int().min(1).max(2097152),
  width: z.number().int().min(1).max(2560), height: z.number().int().min(1).max(2560),
});
const preparedSchema = bindingSchema.extend({
  asset_id: z.uuid(), object_key: z.string(), state: z.literal("prepared"),
  created_at: z.iso.datetime({ offset: true }),
}).strict();
export type NfcEvidenceUploadIntent = z.infer<typeof preparedSchema>;
const knownErrors = new Set([
  "NFC_UPLOAD_INPUT_INVALID", "NFC_UPLOAD_ACTOR_UNAVAILABLE", "NFC_UPLOAD_TAG_UNAVAILABLE",
  "NFC_UPLOAD_REQUEST_CONFLICT", "NFC_VERSION_CONFLICT", "NFC_UPLOAD_PENDING_LIMIT",
]);

// Dormant server-only adapter. The caller must authorize checkin_code.manage.
export async function prepareNfcEvidenceUpload(input: unknown): Promise<NfcEvidenceUploadIntent> {
  const binding = bindingSchema.strict().parse(input);
  if (binding.provider === "supabase" && binding.storage_prefix !== "nfc-evidence") {
    throw new Error("NFC_UPLOAD_INPUT_INVALID");
  }
  const { data, error } = await createSupabaseServiceRoleClient().rpc("prepare_nfc_evidence_upload", {
    p_request_id: binding.request_id, p_tag_id: binding.nfc_tag_id, p_version: binding.tag_version,
    p_actor_id: binding.actor_id, p_provider: binding.provider, p_account: binding.provider_account,
    p_prefix: binding.storage_prefix, p_sha256: binding.sha256, p_size: binding.size_bytes,
    p_width: binding.width, p_height: binding.height,
  });
  if (error) throw new Error(knownErrors.has(error.message) ? error.message : "NFC_UPLOAD_PREPARE_FAILED");
  const parsed = z.array(preparedSchema).length(1).safeParse(data);
  if (!parsed.success) throw new Error("NFC_UPLOAD_RESPONSE_INVALID");
  const intent = parsed.data[0];
  const objectKey = `${binding.storage_prefix}/${intent.asset_id}${binding.provider === "supabase" ? ".webp" : ""}`;
  if (intent.object_key !== objectKey || Object.entries(binding).some(([key, value]) => intent[key as keyof NfcEvidenceUploadIntent] !== value)) {
    throw new Error("NFC_UPLOAD_RESPONSE_INVALID");
  }
  return intent;
}
