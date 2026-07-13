import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { PaginatedResult } from "@/lib/repositories/admin-attraction.repository";
import type { AdminPhotoSpotFilters, AdminPhotoSpotMutationInput } from "@/lib/validation/photo-spot";
import { firstJoin } from "@/lib/utils/supabase-joins";
import { asRecord, booleanValue, nullableNumber, nullableString, numberValue, stringValue } from "@/lib/utils/record";

export type AdminPhotoSpotRow = {
  photo_spot_id: number;
  attraction_id: number;
  spot_name_th: string;
  spot_name_en: string | null;
  description_th: string | null;
  description_en: string | null;
  sample_image_path: string | null;
  latitude: number | null;
  longitude: number | null;
  display_order: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  attraction_name_th: string | null;
};

function mapPhotoSpot(rawRow: unknown): AdminPhotoSpotRow {
  const row = asRecord(rawRow);
  const attraction = asRecord(firstJoin(row.attractions as { name_th?: unknown } | { name_th?: unknown }[] | null));

  return {
    photo_spot_id: numberValue(row.photo_spot_id),
    attraction_id: numberValue(row.attraction_id),
    spot_name_th: stringValue(row.spot_name_th),
    spot_name_en: nullableString(row.spot_name_en),
    description_th: nullableString(row.description_th),
    description_en: nullableString(row.description_en),
    sample_image_path: nullableString(row.sample_image_path),
    latitude: nullableNumber(row.latitude),
    longitude: nullableNumber(row.longitude),
    display_order: nullableNumber(row.display_order),
    is_active: booleanValue(row.is_active),
    created_at: stringValue(row.created_at),
    updated_at: nullableString(row.updated_at),
    attraction_name_th: nullableString(attraction.name_th)
  };
}

function toPayload(input: AdminPhotoSpotMutationInput) {
  return {
    attraction_id: input.attractionId,
    spot_name_th: input.spotNameTh,
    spot_name_en: input.spotNameEn,
    description_th: input.descriptionTh,
    description_en: input.descriptionEn,
    sample_image_path: input.sampleImagePath,
    latitude: input.latitude,
    longitude: input.longitude,
    display_order: input.displayOrder,
    is_active: input.isActive
  };
}

function escapeIlikePattern(value: string) {
  return value.replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export async function listAdminPhotoSpots(filters: AdminPhotoSpotFilters): Promise<PaginatedResult<AdminPhotoSpotRow>> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("photo_spots")
    .select("*, attractions (name_th)", { count: "exact" })
    .order("attraction_id", { ascending: true })
    .order("display_order", { ascending: true, nullsFirst: false });

  if (filters.attractionId) query = query.eq("attraction_id", filters.attractionId);
  if (filters.isActive !== undefined) query = query.eq("is_active", filters.isActive);
  if (filters.search) {
    const search = escapeIlikePattern(filters.search);
    query = query.or(`spot_name_th.ilike.%${search}%,spot_name_en.ilike.%${search}%`);
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    throw new Error("ADMIN_PHOTO_SPOT_LIST_FAILED");
  }

  return {
    items: (data ?? []).map(mapPhotoSpot),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize
  };
}

export async function exportAdminPhotoSpots(
  filters: Omit<AdminPhotoSpotFilters, "page" | "pageSize">,
  limit?: number
): Promise<AdminPhotoSpotRow[]> {
  const supabase = createSupabaseServiceRoleClient();

  let query = supabase
    .from("photo_spots")
    .select("*, attractions (name_th)")
    .order("attraction_id", { ascending: true })
    .order("display_order", { ascending: true, nullsFirst: false });

  if (filters.attractionId) query = query.eq("attraction_id", filters.attractionId);
  if (filters.isActive !== undefined) query = query.eq("is_active", filters.isActive);
  if (filters.search) {
    const search = escapeIlikePattern(filters.search);
    query = query.or(`spot_name_th.ilike.%${search}%,spot_name_en.ilike.%${search}%`);
  }

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw new Error("ADMIN_PHOTO_SPOT_EXPORT_FAILED");

  return (data ?? []).map(mapPhotoSpot);
}

export async function getAdminPhotoSpotById(photoSpotId: number): Promise<AdminPhotoSpotRow | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("photo_spots")
    .select("*, attractions (name_th)")
    .eq("photo_spot_id", photoSpotId)
    .maybeSingle();

  if (error) {
    throw new Error("ADMIN_PHOTO_SPOT_READ_FAILED");
  }

  return data ? mapPhotoSpot(data) : null;
}

export async function createAdminPhotoSpot(input: AdminPhotoSpotMutationInput): Promise<AdminPhotoSpotRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("photo_spots")
    .insert(toPayload(input))
    .select("*")
    .single();

  if (error) {
    throw new Error("ADMIN_PHOTO_SPOT_CREATE_FAILED");
  }

  return mapPhotoSpot(data);
}

export async function updateAdminPhotoSpot(photoSpotId: number, input: AdminPhotoSpotMutationInput): Promise<AdminPhotoSpotRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("photo_spots")
    .update(toPayload(input))
    .eq("photo_spot_id", photoSpotId)
    .select("*")
    .single();

  if (error) {
    throw new Error("ADMIN_PHOTO_SPOT_UPDATE_FAILED");
  }

  return mapPhotoSpot(data);
}

export async function updateAdminPhotoSpotStatus(photoSpotId: number, isActive: boolean): Promise<AdminPhotoSpotRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("photo_spots")
    .update({ is_active: isActive })
    .eq("photo_spot_id", photoSpotId)
    .select("*")
    .single();

  if (error) {
    throw new Error("ADMIN_PHOTO_SPOT_UPDATE_FAILED");
  }

  return mapPhotoSpot(data);
}
