import "server-only";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { nfcStatusSchema } from "@/lib/validation/admin-nfc";

const tagSchema = z.object({
  nfc_tag_id: z.uuid(), public_token: z.uuid(), checkin_code_id: z.coerce.number().int().positive(),
  code_snapshot: z.string(), label: z.string(), status: nfcStatusSchema,
  version: z.number().int().positive(), verified_at: z.string().nullable(),
  verification_reference: z.string().nullable(), replaces_tag_id: z.uuid().nullable(),
  created_at: z.string(), updated_at: z.string(),
});
export type AdminNfcTag = z.infer<typeof tagSchema>;
const eventSchema = z.object({ version: z.number().int().positive(), event_type: z.string(), status: nfcStatusSchema, reason: z.string(), occurred_at: z.string() });
export type AdminNfcEvent = z.infer<typeof eventSchema>;
const selection = "nfc_tag_id,public_token,checkin_code_id,code_snapshot,label,status,version,verified_at,verification_reference,replaces_tag_id,created_at,updated_at";

export async function listAdminNfcEvents(tagId: string, beforeVersion?: number) {
  let query = createSupabaseServiceRoleClient().from("nfc_tag_events").select("version,event_type,status,reason,occurred_at").eq("nfc_tag_id", tagId);
  if (beforeVersion) query = query.lt("version", beforeVersion);
  const { data, error } = await query.order("version", { ascending: false }).limit(21);
  if (error) throw new Error("NFC_HISTORY_FAILED");
  const rows = z.array(eventSchema).parse(data ?? []);
  return { rows: rows.slice(0, 20), nextVersion: rows.length > 20 ? rows[19].version : null };
}

export async function readAdminNfcTag(tagId: string): Promise<AdminNfcTag | null> {
  const { data, error } = await createSupabaseServiceRoleClient().from("nfc_tags").select(selection).eq("nfc_tag_id", tagId).maybeSingle();
  if (error) throw new Error("NFC_READ_FAILED");
  return data ? tagSchema.parse(data) : null;
}

export async function listAdminNfcTags(filters: { page: number; status?: string; checkinCodeId?: number; q?: string }) {
  const pageSize = 20;
  let query = createSupabaseServiceRoleClient().from("nfc_tags").select(selection, { count: "exact" });
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.checkinCodeId) query = query.eq("checkin_code_id", filters.checkinCodeId);
  if (filters.q) query = query.ilike("label", `%${filters.q.replace(/[\\%_]/g, "\\$&")}%`);
  const { data, count, error } = await query.order("created_at", { ascending: false }).order("nfc_tag_id").range((filters.page - 1) * pageSize, filters.page * pageSize - 1);
  if (error) throw new Error("NFC_LIST_FAILED");
  return { rows: z.array(tagSchema).parse(data ?? []), total: count ?? 0, page: filters.page, pageSize };
}

export async function insertAdminNfcTag(input: { checkinCodeId: number; label: string; reason: string; replacesTagId?: string }, adminId: string) {
  const { data, error } = await createSupabaseServiceRoleClient().from("nfc_tags").insert({
    checkin_code_id: input.checkinCodeId, label: input.label, last_change_reason: input.reason,
    replaces_tag_id: input.replacesTagId ?? null, created_by: adminId, updated_by: adminId,
  }).select(selection).single();
  if (error) throw new Error("NFC_CREATE_FAILED");
  return tagSchema.parse(data);
}

export async function updateAdminNfcTag(tagId: string, version: number, values: Record<string, string>) {
  const { data, error } = await createSupabaseServiceRoleClient().from("nfc_tags").update(values)
    .eq("nfc_tag_id", tagId).eq("version", version).select(selection).maybeSingle();
  if (error) throw new Error("NFC_UPDATE_FAILED");
  if (!data) throw new Error("NFC_VERSION_CONFLICT");
  return tagSchema.parse(data);
}
