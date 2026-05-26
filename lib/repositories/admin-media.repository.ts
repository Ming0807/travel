import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminMediaEntityType, AdminMediaFilters, AdminMediaMutationInput } from "@/lib/validation/media";
import type { PaginatedResult } from "./admin-route.repository";

export type AdminMediaRow = {
  media_id: number;
  attraction_id: number | null;
  restaurant_id: number | null;
  accommodation_id: number | null;
  story_id: number | null;
  route_id: number | null;
  media_type: string;
  storage_path: string;
  alt_text_th: string | null;
  alt_text_en: string | null;
  caption_th: string | null;
  caption_en: string | null;
  credit_text: string | null;
  source_url: string | null;
  license_type: string | null;
  usage_notes: string | null;
  lifecycle_status: "draft" | "active" | "archived";
  archived_at: string | null;
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
    attraction_id: row.attraction_id ? Number(row.attraction_id) : null,
    restaurant_id: row.restaurant_id ? Number(row.restaurant_id) : null,
    accommodation_id: row.accommodation_id ? Number(row.accommodation_id) : null,
    story_id: row.story_id ? Number(row.story_id) : null,
    route_id: row.route_id ? Number(row.route_id) : null,
    media_type: row.media_type,
    storage_path: row.storage_path,
    alt_text_th: row.alt_text_th,
    alt_text_en: row.alt_text_en,
    caption_th: row.caption_th,
    caption_en: row.caption_en,
    credit_text: row.credit_text ?? null,
    source_url: row.source_url ?? null,
    license_type: row.license_type ?? null,
    usage_notes: row.usage_notes ?? null,
    lifecycle_status: row.lifecycle_status ?? (row.is_active ? "active" : "draft"),
    archived_at: row.archived_at ?? null,
    display_order: row.display_order === null || row.display_order === undefined ? null : Number(row.display_order),
    is_cover: row.is_cover,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

const entityIdColumnByType: Record<AdminMediaEntityType, "attraction_id" | "restaurant_id" | "accommodation_id" | "story_id" | "route_id"> = {
  attraction: "attraction_id",
  restaurant: "restaurant_id",
  accommodation: "accommodation_id",
  story: "story_id",
  route: "route_id",
};

function toPayload(input: AdminMediaMutationInput) {
  const isArchived = input.lifecycleStatus === "archived";

  return {
    attraction_id: input.entityType === 'attraction' ? input.entityId : null,
    restaurant_id: input.entityType === 'restaurant' ? input.entityId : null,
    accommodation_id: input.entityType === 'accommodation' ? input.entityId : null,
    story_id: input.entityType === 'story' ? input.entityId : null,
    route_id: input.entityType === 'route' ? input.entityId : null,
    media_type: input.mediaType,
    storage_path: input.storagePath,
    alt_text_th: input.altTextTh,
    alt_text_en: input.altTextEn,
    caption_th: input.captionTh,
    caption_en: input.captionEn,
    credit_text: input.creditText,
    source_url: input.sourceUrl,
    license_type: input.licenseType,
    usage_notes: input.usageNotes,
    lifecycle_status: input.lifecycleStatus,
    archived_at: isArchived ? new Date().toISOString() : null,
    display_order: input.displayOrder,
    is_cover: input.isCover,
    is_active: isArchived ? false : input.isActive
  };
}

export async function listAdminMedia(filters: AdminMediaFilters): Promise<PaginatedResult<AdminMediaRow>> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("content_media")
    .select("*", { count: "exact" })
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.entityType && filters.entityId) {
    query = query.eq(entityIdColumnByType[filters.entityType], filters.entityId);
  }
  if (filters.mediaType) query = query.eq("media_type", filters.mediaType);
  if (filters.isActive !== undefined) query = query.eq("is_active", filters.isActive);
  if (filters.lifecycleStatus) query = query.eq("lifecycle_status", filters.lifecycleStatus);

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
    .from("content_media")
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
    .from("content_media")
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
    .from("content_media")
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
  patch: { is_active?: boolean; is_cover?: boolean; lifecycle_status?: "draft" | "active" | "archived"; archived_at?: string | null }
): Promise<AdminMediaRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("content_media")
    .update(patch)
    .eq("media_id", mediaId)
    .select("*")
    .single();

  if (error) {
    throw new Error("ADMIN_MEDIA_UPDATE_FAILED");
  }

  return mapMedia(data);
}

export async function archiveAdminMedia(mediaId: number): Promise<AdminMediaRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("content_media")
    .update({
      is_active: false,
      lifecycle_status: "archived",
      archived_at: new Date().toISOString()
    })
    .eq("media_id", mediaId)
    .select("*")
    .single();

  if (error) {
    throw new Error("ADMIN_MEDIA_ARCHIVE_FAILED");
  }

  return mapMedia(data);
}

export async function deleteAdminMedia(mediaId: number): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("content_media")
    .delete()
    .eq("media_id", mediaId);

  if (error) {
    throw new Error("ADMIN_MEDIA_DELETE_FAILED");
  }
}
