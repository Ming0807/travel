import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminAccommodationFilters, AdminAccommodationMutationInput } from "@/lib/validation/admin-accommodation";

export type AdminAccommodationRow = {
  accommodation_id: number;
  province_id: number;
  slug: string;
  name_th: string;
  name_en: string | null;
  description_th: string | null;
  description_en: string | null;
  accommodation_type: string | null;
  latitude: number | null;
  longitude: number | null;
  address_text: string | null;
  contact_info: string | null;
  cover_image_url: string | null;
  price_range: string | null;
  is_published: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  province_name_th: string | null;
  attraction_count: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAccommodation(row: any): AdminAccommodationRow {
  const province = Array.isArray(row.provinces) ? row.provinces[0] : row.provinces;

  return {
    accommodation_id: Number(row.accommodation_id),
    province_id: Number(row.province_id),
    slug: row.slug,
    name_th: row.name_th,
    name_en: row.name_en,
    description_th: row.description_th,
    description_en: row.description_en,
    accommodation_type: row.accommodation_type,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    address_text: row.address_text,
    contact_info: row.contact_info,
    cover_image_url: row.cover_image_url,
    price_range: row.price_range,
    is_published: row.is_published,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
    province_name_th: province?.province_name_th ?? null,
    attraction_count: row.attraction_count ?? 0
  };
}

function toPayload(input: AdminAccommodationMutationInput) {
  return {
    province_id: input.provinceId,
    slug: input.slug,
    name_th: input.nameTh,
    name_en: input.nameEn,
    description_th: input.descriptionTh,
    description_en: input.descriptionEn,
    accommodation_type: input.accommodationType,
    latitude: input.latitude,
    longitude: input.longitude,
    address_text: input.addressText,
    contact_info: input.contactInfo,
    cover_image_url: input.coverImageUrl,
    price_range: input.priceRange,
    is_published: input.isPublished,
    is_active: input.isActive
  };
}

export async function listAdminAccommodations(filters: AdminAccommodationFilters): Promise<PaginatedResult<AdminAccommodationRow>> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("accommodations")
    .select(
      `
        *,
        provinces (province_name_th)
      `,
      { count: "exact" }
    )
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    query = query.or(`name_th.ilike.%${filters.search}%,name_en.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
  }
  if (filters.provinceId) query = query.eq("province_id", filters.provinceId);
  if (filters.accommodationType) query = query.ilike("accommodation_type", `%${filters.accommodationType}%`);
  if (filters.isPublished !== undefined) query = query.eq("is_published", filters.isPublished);

  const { data, error, count } = await query;

  if (error) {
    throw new Error("ADMIN_ACCOMMODATION_LIST_FAILED");
  }

  // Get attraction counts for each accommodation
  const accommodationIds = (data ?? []).map((row) => Number(row.accommodation_id));
  let attractionCounts = new Map<number, number>();

  if (accommodationIds.length > 0) {
    const { data: links, error: linkError } = await supabase
      .from("attraction_related_accommodations")
      .select("accommodation_id")
      .in("accommodation_id", accommodationIds);

    if (!linkError && links) {
      links.forEach((link) => {
        const id = Number(link.accommodation_id);
        attractionCounts.set(id, (attractionCounts.get(id) ?? 0) + 1);
      });
    }
  }

  return {
    items: (data ?? []).map((row) => ({
      ...mapAccommodation(row),
      attraction_count: attractionCounts.get(Number(row.accommodation_id)) ?? 0
    })),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize
  };
}

export async function getAdminAccommodationById(accommodationId: number): Promise<AdminAccommodationRow | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("accommodations")
    .select(
      `
        *,
        provinces (province_name_th)
      `
    )
    .eq("accommodation_id", accommodationId)
    .maybeSingle();

  if (error) {
    throw new Error("ADMIN_ACCOMMODATION_READ_FAILED");
  }

  if (!data) return null;

  return mapAccommodation(data);
}

export async function findAccommodationBySlug(slug: string, excludeAccommodationId?: number) {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase.from("accommodations").select("accommodation_id").eq("slug", slug).limit(1);
  if (excludeAccommodationId) query = query.neq("accommodation_id", excludeAccommodationId);

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error("ADMIN_ACCOMMODATION_READ_FAILED");
  }

  return data ? Number(data.accommodation_id) : null;
}

export async function createAdminAccommodation(input: AdminAccommodationMutationInput): Promise<AdminAccommodationRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("accommodations")
    .insert(toPayload(input))
    .select("*")
    .single();

  if (error) {
    throw new Error(error.code === "23505" ? "DUPLICATE_SLUG" : "ADMIN_ACCOMMODATION_CREATE_FAILED");
  }

  return mapAccommodation(data);
}

export async function updateAdminAccommodation(accommodationId: number, input: AdminAccommodationMutationInput): Promise<AdminAccommodationRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("accommodations")
    .update(toPayload(input))
    .eq("accommodation_id", accommodationId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.code === "23505" ? "DUPLICATE_SLUG" : "ADMIN_ACCOMMODATION_UPDATE_FAILED");
  }

  return mapAccommodation(data);
}

export async function updateAdminAccommodationStatus(
  accommodationId: number,
  patch: { is_published?: boolean; is_active?: boolean }
): Promise<AdminAccommodationRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("accommodations")
    .update(patch)
    .eq("accommodation_id", accommodationId)
    .select("*")
    .single();

  if (error) {
    throw new Error("ADMIN_ACCOMMODATION_UPDATE_FAILED");
  }

  return mapAccommodation(data);
}

export async function deleteAdminAccommodation(accommodationId: number): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("accommodations")
    .delete()
    .eq("accommodation_id", accommodationId);

  if (error) {
    throw new Error("ADMIN_ACCOMMODATION_DELETE_FAILED");
  }
}

export async function getAdminProvinces() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("provinces").select("province_id, province_name_th").order("province_name_th");
  if (error) throw new Error("FAILED_TO_FETCH_PROVINCES");
  return data;
}
