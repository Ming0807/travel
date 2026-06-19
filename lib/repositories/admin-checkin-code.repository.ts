import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { PaginatedResult } from "@/lib/repositories/admin-attraction.repository";
import type { AdminCheckinCodeFilters, AdminCheckinCodeMutationInput } from "@/lib/validation/checkin-code";

export type AdminCheckinCodeRow = {
  checkin_code_id: number;
  code: string;
  attraction_id: number;
  photo_spot_id: number | null;
  campaign_id: number | null;
  label: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string | null;
  attraction_name_th: string | null;
  attraction_is_active: boolean | null;
  attraction_is_published: boolean | null;
  photo_spot_name_th: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCheckinCode(row: any): AdminCheckinCodeRow {
  const attraction = Array.isArray(row.attractions) ? row.attractions[0] : row.attractions;
  const photoSpot = Array.isArray(row.photo_spots) ? row.photo_spots[0] : row.photo_spots;
  return {
    checkin_code_id: Number(row.checkin_code_id),
    code: row.code,
    attraction_id: Number(row.attraction_id),
    photo_spot_id: row.photo_spot_id === null ? null : Number(row.photo_spot_id),
    campaign_id: row.campaign_id === null ? null : Number(row.campaign_id),
    label: row.label,
    is_active: row.is_active,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    attraction_name_th: attraction?.name_th ?? null,
    attraction_is_active: attraction?.is_active ?? null,
    attraction_is_published: attraction?.is_published ?? null,
    photo_spot_name_th: photoSpot?.spot_name_th ?? null,
  };
}

function toPayload(input: AdminCheckinCodeMutationInput) {
  return {
    code: input.code,
    attraction_id: input.attractionId,
    photo_spot_id: input.photoSpotId,
    label: input.label,
    is_active: input.isActive,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
  };
}

export async function listAdminCheckinCodes(filters: AdminCheckinCodeFilters): Promise<PaginatedResult<AdminCheckinCodeRow>> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("checkin_codes")
    .select("*, attractions (name_th, is_active, is_published), photo_spots (spot_name_th)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.attractionId) query = query.eq("attraction_id", filters.attractionId);
  if (filters.photoSpotId) query = query.eq("photo_spot_id", filters.photoSpotId);
  if (filters.isActive !== undefined) query = query.eq("is_active", filters.isActive);
  if (filters.search) {
    query = query.or(`code.ilike.%${filters.search}%,label.ilike.%${filters.search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw new Error("ADMIN_CHECKIN_CODE_LIST_FAILED");

  return {
    items: (data ?? []).map(mapCheckinCode),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function getAdminCheckinCodeById(checkinCodeId: number): Promise<AdminCheckinCodeRow | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("checkin_codes")
    .select("*, attractions (name_th, is_active, is_published), photo_spots (spot_name_th)")
    .eq("checkin_code_id", checkinCodeId)
    .maybeSingle();

  if (error) throw new Error("ADMIN_CHECKIN_CODE_READ_FAILED");
  return data ? mapCheckinCode(data) : null;
}

export async function findCheckinCodeByCode(code: string, excludeId?: number) {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase.from("checkin_codes").select("checkin_code_id").eq("code", code).limit(1);
  if (excludeId) query = query.neq("checkin_code_id", excludeId);

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error("ADMIN_CHECKIN_CODE_READ_FAILED");
  return data ? Number(data.checkin_code_id) : null;
}

export async function photoSpotBelongsToAttraction(photoSpotId: number | null, attractionId: number) {
  if (!photoSpotId) return true;

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("photo_spots")
    .select("attraction_id")
    .eq("photo_spot_id", photoSpotId)
    .maybeSingle();

  if (error || !data) return false;
  return Number(data.attraction_id) === attractionId;
}

export async function createAdminCheckinCode(input: AdminCheckinCodeMutationInput): Promise<AdminCheckinCodeRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("checkin_codes")
    .insert(toPayload(input))
    .select("*")
    .single();

  if (error) throw new Error(error.code === "23505" ? "DUPLICATE_CODE" : "ADMIN_CHECKIN_CODE_CREATE_FAILED");
  return mapCheckinCode(data);
}

export async function updateAdminCheckinCode(checkinCodeId: number, input: AdminCheckinCodeMutationInput): Promise<AdminCheckinCodeRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("checkin_codes")
    .update(toPayload(input))
    .eq("checkin_code_id", checkinCodeId)
    .select("*")
    .single();

  if (error) throw new Error(error.code === "23505" ? "DUPLICATE_CODE" : "ADMIN_CHECKIN_CODE_UPDATE_FAILED");
  return mapCheckinCode(data);
}

export async function updateAdminCheckinCodeStatus(checkinCodeId: number, isActive: boolean): Promise<AdminCheckinCodeRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("checkin_codes")
    .update({ is_active: isActive })
    .eq("checkin_code_id", checkinCodeId)
    .select("*")
    .single();

  if (error) throw new Error("ADMIN_CHECKIN_CODE_UPDATE_FAILED");
  return mapCheckinCode(data);
}
