import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { PaginatedResult } from "@/lib/repositories/admin-attraction.repository";
import type { AdminPhotoSpotFilters, AdminPhotoSpotMutationInput } from "@/lib/validation/photo-spot";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPhotoSpot(row: any): AdminPhotoSpotRow {
  const attraction = Array.isArray(row.attractions) ? row.attractions[0] : row.attractions;
  return {
    photo_spot_id: Number(row.photo_spot_id),
    attraction_id: Number(row.attraction_id),
    spot_name_th: row.spot_name_th,
    spot_name_en: row.spot_name_en,
    description_th: row.description_th,
    description_en: row.description_en,
    sample_image_path: row.sample_image_path,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    display_order: row.display_order,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
    attraction_name_th: attraction?.name_th ?? null
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

export async function listAdminPhotoSpots(filters: AdminPhotoSpotFilters): Promise<PaginatedResult<AdminPhotoSpotRow>> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("photo_spots")
    .select("*, attractions (name_th)", { count: "exact" })
    .order("attraction_id", { ascending: true })
    .order("display_order", { ascending: true, nullsFirst: false })
    .range(from, to);

  if (filters.attractionId) query = query.eq("attraction_id", filters.attractionId);
  if (filters.isActive !== undefined) query = query.eq("is_active", filters.isActive);
  if (filters.search) {
    query = query.or(`spot_name_th.ilike.%${filters.search}%,spot_name_en.ilike.%${filters.search}%`);
  }

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
