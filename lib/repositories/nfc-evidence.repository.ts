import "server-only";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export const nfcEvidenceMetadataSchema = z.object({
  asset_id: z.uuid(), nfc_tag_id: z.uuid(), tag_version: z.number().int().positive(),
  actor_id: z.uuid(), provider: z.enum(["supabase", "cloudinary"]), storage_path: z.string().min(1).max(1000),
  sha256: z.string().regex(/^[0-9a-f]{64}$/), size_bytes: z.number().int().min(1).max(2 * 1024 * 1024),
  width: z.number().int().min(1).max(2560), height: z.number().int().min(1).max(2560),
}).strict();
export type NfcEvidenceMetadata = z.infer<typeof nfcEvidenceMetadataSchema>;
const rowSchema = nfcEvidenceMetadataSchema.extend({
  created_at: z.iso.datetime({ offset: true }),
  nfc_field_check_photos: z.union([
    z.object({ request_id: z.uuid() }), z.array(z.object({ request_id: z.uuid() })).max(1),
  ]).nullable().transform(value => Array.isArray(value) ? value : value ? [value] : []),
});
const selection = "asset_id,nfc_tag_id,tag_version,actor_id,provider,storage_path,sha256,size_bytes,width,height,created_at,nfc_field_check_photos(request_id)";

export async function readNfcEvidenceAsset(assetId: string) {
  z.uuid().parse(assetId);
  const { data, error } = await createSupabaseServiceRoleClient().from("nfc_evidence_assets")
    .select(selection).eq("asset_id", assetId).maybeSingle();
  if (error) throw new Error("NFC_EVIDENCE_READ_FAILED");
  return data ? rowSchema.parse(data) : null;
}

export async function registerNfcEvidenceAsset(input: NfcEvidenceMetadata) {
  const value = nfcEvidenceMetadataSchema.parse(input);
  const { data, error } = await createSupabaseServiceRoleClient().rpc("register_nfc_evidence_asset", {
    p_asset_id: value.asset_id, p_tag_id: value.nfc_tag_id, p_version: value.tag_version,
    p_actor_id: value.actor_id, p_provider: value.provider, p_path: value.storage_path,
    p_sha256: value.sha256, p_size: value.size_bytes, p_width: value.width, p_height: value.height,
  });
  if (error) {
    const known = ["NFC_VERSION_CONFLICT", "NFC_EVIDENCE_REQUEST_CONFLICT", "NFC_NOT_FOUND"];
    throw new Error(known.includes(error.message) ? error.message : "NFC_EVIDENCE_REGISTER_FAILED");
  }
  if (data !== value.asset_id) throw new Error("NFC_EVIDENCE_RESPONSE_INVALID");
  return value.asset_id;
}
