import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminMediaEntityType, AdminMediaFilters, AdminMediaMutationInput } from "@/lib/validation/media";
import type { PaginatedResult } from "./admin-route.repository";
import { asRecord, booleanValue, nullableNumber, nullableString, numberValue, stringValue } from "@/lib/utils/record";

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

function mapMedia(rawRow: unknown): AdminMediaRow {
  const row = asRecord(rawRow);
  const lifecycleStatus = stringValue(row.lifecycle_status, booleanValue(row.is_active) ? "active" : "draft");

  return {
    media_id: numberValue(row.media_id),
    attraction_id: nullableNumber(row.attraction_id),
    restaurant_id: nullableNumber(row.restaurant_id),
    accommodation_id: nullableNumber(row.accommodation_id),
    story_id: nullableNumber(row.story_id),
    route_id: nullableNumber(row.route_id),
    media_type: stringValue(row.media_type),
    storage_path: stringValue(row.storage_path),
    alt_text_th: nullableString(row.alt_text_th),
    alt_text_en: nullableString(row.alt_text_en),
    caption_th: nullableString(row.caption_th),
    caption_en: nullableString(row.caption_en),
    credit_text: nullableString(row.credit_text),
    source_url: nullableString(row.source_url),
    license_type: nullableString(row.license_type),
    usage_notes: nullableString(row.usage_notes),
    lifecycle_status: lifecycleStatus === "archived" || lifecycleStatus === "active" || lifecycleStatus === "draft"
      ? lifecycleStatus
      : "draft",
    archived_at: nullableString(row.archived_at),
    display_order: nullableNumber(row.display_order),
    is_cover: booleanValue(row.is_cover),
    is_active: booleanValue(row.is_active),
    created_at: stringValue(row.created_at),
    updated_at: nullableString(row.updated_at)
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

  // Build dynamic payload — only set the entity column that matches entityType.
  // This avoids sending null for columns that may not exist in the remote DB
  // (e.g., accommodation_id if the migration hasn't been applied yet).
  const payload: Record<string, unknown> = {
    [entityIdColumnByType[input.entityType]]: input.entityId,
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

  return payload;
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
    console.error("ADMIN_MEDIA_LIST_FAILED", { filters, errorMessage: error.message, errorDetails: error.details, errorHint: error.hint, errorCode: error.code });
    throw new Error(`ADMIN_MEDIA_LIST_FAILED: ${error.message} (${error.code || "unknown"})`);
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
    console.error("ADMIN_MEDIA_READ_FAILED", { mediaId, errorMessage: error.message, errorDetails: error.details, errorHint: error.hint, errorCode: error.code });
    throw new Error(`ADMIN_MEDIA_READ_FAILED: ${error.message} (${error.code || "unknown"})`);
  }

  if (!data) return null;

  return mapMedia(data);
}

export async function createAdminMedia(input: AdminMediaMutationInput): Promise<AdminMediaRow> {
  const supabase = createSupabaseServiceRoleClient();
  const payload = toPayload(input);
  const { data, error } = await supabase
    .from("content_media")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("ADMIN_MEDIA_CREATE_FAILED", { payload, errorMessage: error.message, errorDetails: error.details, errorHint: error.hint, errorCode: error.code });
    throw new Error(`ADMIN_MEDIA_CREATE_FAILED: ${error.message} (${error.code || "unknown"})`);
  }

  return mapMedia(data);
}

export async function updateAdminMedia(mediaId: number, input: AdminMediaMutationInput): Promise<AdminMediaRow> {
  const supabase = createSupabaseServiceRoleClient();
  const payload = toPayload(input);
  const { data, error } = await supabase
    .from("content_media")
    .update(payload)
    .eq("media_id", mediaId)
    .select("*")
    .single();

  if (error) {
    console.error("ADMIN_MEDIA_UPDATE_FAILED", { mediaId, payload, errorMessage: error.message, errorDetails: error.details, errorHint: error.hint, errorCode: error.code });
    throw new Error(`ADMIN_MEDIA_UPDATE_FAILED: ${error.message} (${error.code || "unknown"})`);
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
    console.error("ADMIN_MEDIA_STATUS_UPDATE_FAILED", { mediaId, patch, errorMessage: error.message, errorDetails: error.details, errorHint: error.hint, errorCode: error.code });
    throw new Error(`ADMIN_MEDIA_STATUS_UPDATE_FAILED: ${error.message} (${error.code || "unknown"})`);
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
    console.error("ADMIN_MEDIA_ARCHIVE_FAILED", { mediaId, errorMessage: error.message, errorDetails: error.details, errorHint: error.hint, errorCode: error.code });
    throw new Error(`ADMIN_MEDIA_ARCHIVE_FAILED: ${error.message} (${error.code || "unknown"})`);
  }

  return mapMedia(data);
}

/**
 * Get the cover media for an entity (the content_media record with is_cover=true)
 */
export async function getCoverMediaForEntity(
  entityType: AdminMediaEntityType,
  entityId: number
): Promise<{ media_id: number; storage_path: string } | null> {
  const supabase = createSupabaseServiceRoleClient();
  const column = entityIdColumnByType[entityType];

  const { data, error } = await supabase
    .from("content_media")
    .select("media_id, storage_path")
    .eq(column, entityId)
    .eq("is_cover", true)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;

  return {
    media_id: Number(data.media_id),
    storage_path: data.storage_path as string,
  };
}

/**
 * Link an existing content_media record to an entity and mark it as cover.
 * Unsets any previous cover for the same entity first.
 */
export async function linkMediaToEntity(
  mediaId: number,
  entityType: AdminMediaEntityType,
  entityId: number
): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const column = entityIdColumnByType[entityType];

  // Unset any existing cover for this entity
  await supabase
    .from("content_media")
    .update({ is_cover: false })
    .eq(column, entityId)
    .eq("is_cover", true);

  // Link the new cover media to the entity
  const { error } = await supabase
    .from("content_media")
    .update({
      [column]: entityId,
      is_cover: true,
    })
    .eq("media_id", mediaId);

  if (error) {
    console.error("LINK_MEDIA_FAILED", { mediaId, entityType, entityId, errorMessage: error.message });
    throw new Error(`LINK_MEDIA_FAILED: ${error.message}`);
  }
}

export async function clearCoverMediaForEntity(
  entityType: AdminMediaEntityType,
  entityId: number
): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const column = entityIdColumnByType[entityType];

  const { error } = await supabase
    .from("content_media")
    .update({ is_cover: false })
    .eq(column, entityId)
    .eq("is_cover", true);

  if (error) {
    console.error("CLEAR_COVER_MEDIA_FAILED", { entityType, entityId, errorMessage: error.message });
    throw new Error(`CLEAR_COVER_MEDIA_FAILED: ${error.message}`);
  }
}

export async function linkMediaToEntityByStoragePath(
  storagePath: string,
  entityType: AdminMediaEntityType,
  entityId: number
): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const column = entityIdColumnByType[entityType];

  // Unset any existing cover for this entity
  await supabase
    .from("content_media")
    .update({ is_cover: false })
    .eq(column, entityId)
    .eq("is_cover", true);

  // Check if content_media already has this storage_path (even if not linked to this entity)
  const { data: existing } = await supabase
    .from("content_media")
    .select("media_id")
    .eq("storage_path", storagePath)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("content_media")
      .update({
        [column]: entityId,
        is_cover: true,
      })
      .eq("media_id", existing.media_id);
  } else {
    await supabase
      .from("content_media")
      .insert({
        storage_path: storagePath,
        media_type: "image",
        [column]: entityId,
        is_cover: true,
        is_active: true,
        lifecycle_status: "active"
      });
  }
}

export async function deleteAdminMedia(mediaId: number): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("content_media")
    .delete()
    .eq("media_id", mediaId);

  if (error) {
    console.error("ADMIN_MEDIA_DELETE_FAILED", { mediaId, errorMessage: error.message, errorDetails: error.details, errorHint: error.hint, errorCode: error.code });
    throw new Error(`ADMIN_MEDIA_DELETE_FAILED: ${error.message} (${error.code || "unknown"})`);
  }
}
