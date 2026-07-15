import "server-only";

import { siteMediaImageUrl } from "@/lib/media/storage-paths";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { PaginatedResult } from "@/lib/repositories/admin-attraction.repository";
import type { AdminMediaLibraryFilters } from "@/lib/validation/media-library";
import { asRecord, nullableString, numberValue, stringValue } from "@/lib/utils/record";

const MEDIA_LIBRARY_COLUMNS =
  "id,file_name,storage_path,thumbnail_storage_path,mime_type,size_bytes,category,lifecycle_status,created_at";

const MIME_TYPE_BY_FILTER = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

export type AdminMediaLibraryAsset = {
  id: string;
  file_name: string;
  storage_path: string;
  thumbnail_storage_path: string | null;
  mime_type: string;
  size_bytes: number;
  category: string;
  lifecycle_status: "active" | "archived";
  created_at: string;
  url: string;
  thumbnail_url: string | null;
  is_active: boolean;
};

function mapMediaLibraryAsset(rawRow: unknown): AdminMediaLibraryAsset {
  const row = asRecord(rawRow);
  const storagePath = stringValue(row.storage_path);
  const thumbnailStoragePath = nullableString(row.thumbnail_storage_path);
  const lifecycleStatus = stringValue(row.lifecycle_status, "active") === "archived" ? "archived" : "active";

  return {
    id: stringValue(row.id),
    file_name: stringValue(row.file_name),
    storage_path: storagePath,
    thumbnail_storage_path: thumbnailStoragePath,
    mime_type: stringValue(row.mime_type),
    size_bytes: numberValue(row.size_bytes),
    category: stringValue(row.category, "General"),
    lifecycle_status: lifecycleStatus,
    created_at: stringValue(row.created_at),
    url: siteMediaImageUrl(storagePath) ?? "",
    thumbnail_url: thumbnailStoragePath ? siteMediaImageUrl(thumbnailStoragePath) : null,
    is_active: lifecycleStatus === "active",
  };
}

function mediaSearchExpression(search: string) {
  const escaped = search
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/"/g, '\\"');
  const pattern = `"%${escaped}%"`;
  return ["file_name", "storage_path", "category", "mime_type"]
    .map((column) => `${column}.ilike.${pattern}`)
    .join(",");
}

export async function listAdminMediaLibraryAssets(
  filters: AdminMediaLibraryFilters,
): Promise<PaginatedResult<AdminMediaLibraryAsset>> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("media_assets")
    .select(MEDIA_LIBRARY_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.search) query = query.or(mediaSearchExpression(filters.search));
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.lifecycleStatus !== "all") {
    query = query.eq("lifecycle_status", filters.lifecycleStatus);
  }
  if (filters.mediaType) query = query.eq("mime_type", MIME_TYPE_BY_FILTER[filters.mediaType]);

  const { data, error, count } = await query.range(from, to);
  if (error) throw new Error("ADMIN_MEDIA_LIBRARY_LIST_FAILED");

  return {
    items: (data ?? []).map(mapMediaLibraryAsset),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize,
  };
}

export async function exportAdminMediaLibraryAssets(
  filters: Omit<AdminMediaLibraryFilters, "page" | "pageSize">,
  limit: number,
): Promise<AdminMediaLibraryAsset[]> {
  const supabase = createSupabaseServiceRoleClient();

  let query = supabase
    .from("media_assets")
    .select(MEDIA_LIBRARY_COLUMNS)
    .order("created_at", { ascending: false });

  if (filters.search) query = query.or(mediaSearchExpression(filters.search));
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.lifecycleStatus !== "all") {
    query = query.eq("lifecycle_status", filters.lifecycleStatus);
  }
  if (filters.mediaType) query = query.eq("mime_type", MIME_TYPE_BY_FILTER[filters.mediaType]);

  const { data, error } = await query.limit(limit);
  if (error) throw new Error("ADMIN_MEDIA_LIBRARY_EXPORT_FAILED");

  return (data ?? []).map(mapMediaLibraryAsset);
}
