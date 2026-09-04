import "server-only";

import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { nfcTokenSchema, type NfcAssignment } from "@/lib/nfc/contract";

const id = z.coerce.number().int().positive().safe();
const codeRow = z.object({
  checkin_code_id: id, code: z.string(), attraction_id: id,
  photo_spot_id: id.nullable(), campaign_id: id.nullable(),
});
const registryRow = z.object({
  nfc_tag_id: z.uuid(), status: z.enum(["draft", "active", "inactive", "revoked"]),
  checkin_code_id: id, code_snapshot: z.string(), attraction_id_snapshot: id,
  photo_spot_id_snapshot: id.nullable(), campaign_id_snapshot: id.nullable(),
  checkin_codes: z.union([codeRow, z.array(codeRow).max(1)]).nullable(),
});

export type NfcTagResolutionRecord = {
  tagId: string;
  status: "draft" | "active" | "inactive" | "revoked";
  assignment: NfcAssignment;
  currentAssignment: NfcAssignment | null;
};

export async function findNfcTagByToken(token: string): Promise<NfcTagResolutionRecord | null> {
  if (!nfcTokenSchema.safeParse(token).success) return null;
  const { data, error } = await createSupabaseServiceRoleClient()
    .from("nfc_tags")
    .select(`nfc_tag_id, status, checkin_code_id, code_snapshot, attraction_id_snapshot,
      photo_spot_id_snapshot, campaign_id_snapshot,
      checkin_codes (checkin_code_id, code, attraction_id, photo_spot_id, campaign_id)`)
    .eq("public_token", token)
    .maybeSingle();
  if (error) throw new Error("NFC_REGISTRY_UNAVAILABLE");
  if (!data) return null;
  const parsed = registryRow.safeParse(data);
  if (!parsed.success) throw new Error("NFC_REGISTRY_INVALID");
  const row = parsed.data;
  const current = Array.isArray(row.checkin_codes) ? row.checkin_codes[0] : row.checkin_codes;
  return {
    tagId: row.nfc_tag_id,
    status: row.status,
    assignment: {
      checkinCodeId: row.checkin_code_id, code: row.code_snapshot,
      attractionId: row.attraction_id_snapshot, photoSpotId: row.photo_spot_id_snapshot,
      campaignId: row.campaign_id_snapshot,
    },
    currentAssignment: current ? {
      checkinCodeId: current.checkin_code_id, code: current.code,
      attractionId: current.attraction_id, photoSpotId: current.photo_spot_id,
      campaignId: current.campaign_id,
    } : null,
  };
}
