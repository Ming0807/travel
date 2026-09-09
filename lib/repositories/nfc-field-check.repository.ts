import "server-only";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { nfcFieldCheckSchema, nfcFieldResultSchema, type NfcFieldCheckInput } from "@/lib/validation/nfc-field-check";

const recordSchema = z.object({
  request_id: z.uuid(), nfc_tag_id: z.uuid(), tag_version: z.number().int().positive(),
  tag_status: z.enum(["draft", "active", "inactive", "revoked"]), actor_id: z.uuid(),
  location_note: z.string(), device_label: z.string(), platform: z.enum(["ios", "android", "other"]),
  nfc_result: nfcFieldResultSchema, qr_result: nfcFieldResultSchema,
  notes: z.string(), evidence_reference: z.string(), reported_at: z.string(),
  photos: z.array(z.object({ asset_id: z.uuid(), position: z.number().int().min(1).max(3) })).max(3).optional(),
});
export type NfcFieldCheckRecord = z.infer<typeof recordSchema>;
const selection = "request_id,nfc_tag_id,tag_version,tag_status,actor_id,location_note,device_label,platform,nfc_result,qr_result,notes,evidence_reference,reported_at";

export async function insertNfcFieldCheck(input: NfcFieldCheckInput, actorId: string): Promise<string> {
  const value = nfcFieldCheckSchema.parse(input);
  const actor = z.uuid().parse(actorId);
  const { data, error } = await createSupabaseServiceRoleClient().rpc(value.assetIds === undefined ? "record_nfc_field_check" : "record_nfc_field_check_with_photos", {
    p_request_id: value.requestId, p_tag_id: value.tagId, p_version: value.version, p_actor_id: actor,
    p_location: value.locationNote, p_device: value.deviceLabel, p_platform: value.platform,
    p_nfc_result: value.nfcResult, p_qr_result: value.qrResult, p_notes: value.notes,
    p_evidence_reference: value.evidenceReference,
    ...(value.assetIds === undefined ? {} : { p_asset_ids: value.assetIds }),
  });
  if (error) {
    const known = ["NFC_VERSION_CONFLICT", "NFC_FIELD_REQUEST_CONFLICT", "NFC_FIELD_PASS_NOT_ELIGIBLE", "NFC_NOT_FOUND", "NFC_EVIDENCE_NOT_AVAILABLE", "NFC_EVIDENCE_INPUT_INVALID"];
    throw new Error(known.includes(error.message) ? error.message : "NFC_FIELD_SAVE_FAILED");
  }
  if (data !== value.requestId) throw new Error("NFC_FIELD_RESPONSE_INVALID");
  return data;
}

export async function listNfcFieldChecks(tagId: string, page: number, includePhotos = false) {
  z.uuid().parse(tagId);
  z.number().int().min(1).max(10000).parse(page);
  const pageSize = 10;
  const { data, error, count } = await createSupabaseServiceRoleClient().from("nfc_field_checks")
    .select(includePhotos ? `${selection},photos:nfc_field_check_photos(asset_id,position)` : selection, { count: "exact" }).eq("nfc_tag_id", tagId)
    .order("reported_at", { ascending: false }).order("request_id", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (error) throw new Error("NFC_FIELD_LIST_FAILED");
  const rows = z.array(recordSchema).parse(data ?? []);
  for (const row of rows) row.photos?.sort((left, right) => left.position - right.position);
  return { rows, total: count ?? 0, page, pageSize };
}
