import "server-only";

import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

const uuid = z.uuid();
const positiveId = z.coerce.number().int().positive().safe();
const beginResult = z.array(z.object({ entry_session_id: uuid, was_created: z.boolean() })).length(1);
const sessionRow = z.object({
  entry_session_id: uuid,
  checkin_code_id: positiveId,
  code_snapshot: z.string().min(3).max(100),
  attraction_id_snapshot: positiveId,
  photo_spot_id_snapshot: positiveId.nullable(),
  campaign_id_snapshot: positiveId.nullable(),
  entry_channel: z.enum(["qr", "nfc"]),
  nfc_tag_id: uuid.nullable(),
  evidence_scope: z.enum(["unknown", "operational_unclassified", "field_observation", "pilot_internal", "simulated_usability"]),
  research_study_id_snapshot: uuid.nullish().transform((value) => value ?? null),
  research_frozen_at_snapshot: z.iso.datetime({ offset: true }).nullish().transform((value) => value ?? null),
  visit_id: uuid.nullable(),
  created_at: z.iso.datetime({ offset: true }),
  expires_at: z.iso.datetime({ offset: true }),
});

type SessionKey = { sessionId: string; browserHash: string; code: string };
export type CheckinEntrySession = {
  sessionId: string;
  checkinCodeId: number;
  code: string;
  attractionId: number;
  photoSpotId: number | null;
  campaignId: number | null;
  channel: "qr" | "nfc";
  tagId: string | null;
  evidenceScope: z.infer<typeof sessionRow>["evidence_scope"];
  researchStudyId: string | null;
  researchFrozenAt: string | null;
  visitId: string | null;
  createdAt: string;
  expiresAt: string;
};

export async function beginCheckinEntrySession(input: {
  browserHash: string;
  code: string;
  channel: "qr" | "nfc";
  tagId: string | null;
}): Promise<{ sessionId: string; wasCreated: boolean }> {
  const { data, error } = await createSupabaseServiceRoleClient().rpc("begin_checkin_entry", {
    p_browser_hash: input.browserHash,
    p_code: input.code,
    p_channel: input.channel,
    p_tag_id: input.tagId,
  });
  if (error) throw new Error("CHECKIN_ENTRY_BEGIN_FAILED");
  const parsed = beginResult.safeParse(data);
  if (!parsed.success) throw new Error("CHECKIN_ENTRY_BEGIN_INVALID");
  return { sessionId: parsed.data[0].entry_session_id, wasCreated: parsed.data[0].was_created };
}

export async function readCheckinEntrySession(input: SessionKey): Promise<CheckinEntrySession> {
  const { data, error } = await createSupabaseServiceRoleClient().rpc("read_checkin_entry", {
    p_session_id: input.sessionId,
    p_browser_hash: input.browserHash,
    p_code: input.code,
  });
  if (error) throw new Error("CHECKIN_ENTRY_READ_FAILED");
  const parsed = z.array(sessionRow).length(1).safeParse(data);
  if (!parsed.success) throw new Error("CHECKIN_ENTRY_READ_INVALID");
  const row = parsed.data[0];
  return {
    sessionId: row.entry_session_id,
    checkinCodeId: row.checkin_code_id,
    code: row.code_snapshot,
    attractionId: row.attraction_id_snapshot,
    photoSpotId: row.photo_spot_id_snapshot,
    campaignId: row.campaign_id_snapshot,
    channel: row.entry_channel,
    tagId: row.nfc_tag_id,
    evidenceScope: row.evidence_scope,
    researchStudyId: row.research_study_id_snapshot,
    researchFrozenAt: row.research_frozen_at_snapshot,
    visitId: row.visit_id,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  };
}

export async function createVisitFromCheckinEntry(input: SessionKey & { touristId: string }): Promise<string> {
  const { data, error } = await createSupabaseServiceRoleClient().rpc("create_checkin_entry_visit", {
    p_session_id: input.sessionId,
    p_browser_hash: input.browserHash,
    p_code: input.code,
    p_tourist_id: input.touristId,
  });
  if (error) throw new Error("CHECKIN_ENTRY_VISIT_FAILED");
  const parsed = uuid.safeParse(data);
  if (!parsed.success) throw new Error("CHECKIN_ENTRY_VISIT_INVALID");
  return parsed.data;
}
