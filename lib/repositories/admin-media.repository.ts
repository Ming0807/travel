import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminMediaFilters, AdminMediaMutationInput } from "@/lib/validation/media";
import type { PaginatedResult } from "./admin-route.repository";

export type AdminMediaRow = {
  media_id: number;
  attraction_id: number;
  media_type: string;
  storage_path: string;
  alt_text_th: string | null;
  alt_text_en: string | null;
  caption_th: string | null;
  caption_en: string | null;
  display_order: number | null;
  is_cover: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMedia(row: any): AdminMediaRow {
  return {
    media_id: Number(row.media_id),
    attraction_id: Number(row.attraction_id),
    media_type: row.media_type,
    storage_path: row.storage_path,
    alt_text_th: row.alt_text_th,
    alt_text_en: row.alt_text_en,
    caption_th: row.caption_th,
    caption_en: row.caption_en,
    display_order: row.display_order ? Number(row.display_order) : null,
    is_cover: row.is_cover,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function toPayload(input: AdminMediaMutationInput) {
  return {
    attraction_id: input.attractionId,
    media_type: input.mediaType,
    storage_path: input.storagePath,
    alt_text_th: input.altTextTh,
    alt_text_en: input.altTextEn,
    caption_th: input.captionTh,
    caption_en: input.captionEn,
    display_order: input.displayOrder,
    is_cover: input.isCover,
    is_active: input.isActive
  };
}

export async function listAdminMedia(filters: AdminMediaFilters): Promise<PaginatedResult<AdminMediaRow>> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("attraction_media")
    .select("*", { count: "exact" })
    .order("display_order", { ascending: true, nullsLast: true })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.attractionId) query = query.eq("attraction_id", filters.attractionId);
  if (filters.mediaType) query = query.eq("media_type", filters.mediaType);
  if (filters.isActive !== undefined) query = query.eq("is_active", filters.isActive);

  const { data, error, count } = await query;

  if (error) {
    throw new Error("ADMIN_MEDIA_LIST_FAILED");
  }

  return {
    items: (data ?? []).map(mapMedia),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize
  };
}

export async function getAdminMediaById(mediaId: number): Promise<AdminMediaRow | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("attraction_media")
    .select("*")
    .eq("media_id", mediaId)
    .maybeSingle();

  if (error) {
    throw new Error("ADMIN_MEDIA_READ_FAILED");
  }

  if (!data) return null;

  return mapMedia(data);
}

export async function createAdminMedia(input: AdminMediaMutationInput): Promise<AdminMediaRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("attraction_media")
    .insert(toPayload(input))
    .select("*")
    .single();

  if (error) {
    throw new Error("ADMIN_MEDIA_CREATE_FAILED");
  }

  return mapMedia(data);
}

export async function updateAdminMedia(mediaId: number, input: AdminMediaMutationInput): Promise<AdminMediaRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("attraction_media")
    .update(toPayload(input))
    .eq("media_id", mediaId)
    .select("*")
    .single();

  if (error) {
    throw new Error("ADMIN_MEDIA_UPDATE_FAILED");
  }

  return mapMedia(data);
}

export async function updateAdminMediaStatus(
  mediaId: number,
  patch: { is_active?: boolean; is_cover?: boolean }
): Promise<AdminMediaRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("attraction_media")
    .update(patch)
    .eq("media_id", mediaId)
    .select("*")
    .single();

  if (error) {
    throw new Error("ADMIN_MEDIA_UPDATE_FAILED");
  }

  return mapMedia(data);
}

export async function deleteAdminMedia(mediaId: number): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("attraction_media")
    .delete()
    .eq("media_id", mediaId);

  if (error) {
    throw new Error("ADMIN_MEDIA_DELETE_FAILED");
  }
}
