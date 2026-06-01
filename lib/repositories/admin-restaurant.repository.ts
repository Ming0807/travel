import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminRestaurantFilters, AdminRestaurantMutationInput } from "@/lib/validation/admin-restaurant";

export type AdminRestaurantRow = {
  restaurant_id: number;
  province_id: number;
  slug: string;
  name_th: string;
  name_en: string | null;
  description_th: string | null;
  description_en: string | null;
  food_type: string | null;
  latitude: number | null;
  longitude: number | null;
  address_text: string | null;
  opening_hours: string | null;
  contact_info: string | null;
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
function mapRestaurant(row: any): AdminRestaurantRow {
  const province = Array.isArray(row.provinces) ? row.provinces[0] : row.provinces;

  return {
    restaurant_id: Number(row.restaurant_id),
    province_id: Number(row.province_id),
    slug: row.slug,
    name_th: row.name_th,
    name_en: row.name_en,
    description_th: row.description_th,
    description_en: row.description_en,
    food_type: row.food_type,
    latitude: row.latitude === null ? null : Number(row.latitude),
    longitude: row.longitude === null ? null : Number(row.longitude),
    address_text: row.address_text,
    opening_hours: row.opening_hours,
    contact_info: row.contact_info,
    is_published: row.is_published,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
    province_name_th: province?.province_name_th ?? null,
    attraction_count: row.attraction_count ?? 0
  };
}

function toPayload(input: AdminRestaurantMutationInput) {
  return {
    province_id: input.provinceId,
    slug: input.slug,
    name_th: input.nameTh,
    name_en: input.nameEn,
    description_th: input.descriptionTh,
    description_en: input.descriptionEn,
    food_type: input.foodType,
    latitude: input.latitude,
    longitude: input.longitude,
    address_text: input.addressText,
    opening_hours: input.openingHours,
    contact_info: input.contactInfo,
    is_published: input.isPublished,
    is_active: input.isActive
  };
}

export async function listAdminRestaurants(filters: AdminRestaurantFilters): Promise<PaginatedResult<AdminRestaurantRow>> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("restaurants")
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
  if (filters.foodType) query = query.ilike("food_type", `%${filters.foodType}%`);
  if (filters.isPublished !== undefined) query = query.eq("is_published", filters.isPublished);

  const { data, error, count } = await query;

  if (error) {
    throw new Error("ADMIN_RESTAURANT_LIST_FAILED");
  }

  // Get attraction counts for each restaurant
  const restaurantIds = (data ?? []).map((row) => Number(row.restaurant_id));
  let attractionCounts = new Map<number, number>();

  if (restaurantIds.length > 0) {
    const { data: links, error: linkError } = await supabase
      .from("restaurant_attractions")
      .select("restaurant_id")
      .in("restaurant_id", restaurantIds);

    if (!linkError && links) {
      links.forEach((link) => {
        const id = Number(link.restaurant_id);
        attractionCounts.set(id, (attractionCounts.get(id) ?? 0) + 1);
      });
    }
  }

  return {
    items: (data ?? []).map((row) => ({
      ...mapRestaurant(row),
      attraction_count: attractionCounts.get(Number(row.restaurant_id)) ?? 0
    })),
    total: count ?? 0,
    page: filters.page,
    pageSize: filters.pageSize
  };
}

export async function getAdminRestaurantById(restaurantId: number): Promise<AdminRestaurantRow | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("restaurants")
    .select(
      `
        *,
        provinces (province_name_th)
      `
    )
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  if (error) {
    throw new Error("ADMIN_RESTAURANT_READ_FAILED");
  }

  if (!data) return null;

  return mapRestaurant(data);
}

export async function findRestaurantBySlug(slug: string, excludeRestaurantId?: number) {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase.from("restaurants").select("restaurant_id").eq("slug", slug).limit(1);
  if (excludeRestaurantId) query = query.neq("restaurant_id", excludeRestaurantId);

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw new Error("ADMIN_RESTAURANT_READ_FAILED");
  }

  return data ? Number(data.restaurant_id) : null;
}

export async function createAdminRestaurant(input: AdminRestaurantMutationInput): Promise<AdminRestaurantRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("restaurants")
    .insert(toPayload(input))
    .select("*")
    .single();

  if (error) {
    throw new Error(error.code === "23505" ? "DUPLICATE_SLUG" : "ADMIN_RESTAURANT_CREATE_FAILED");
  }

  return mapRestaurant(data);
}

export async function updateAdminRestaurant(restaurantId: number, input: AdminRestaurantMutationInput): Promise<AdminRestaurantRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("restaurants")
    .update(toPayload(input))
    .eq("restaurant_id", restaurantId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.code === "23505" ? "DUPLICATE_SLUG" : "ADMIN_RESTAURANT_UPDATE_FAILED");
  }

  return mapRestaurant(data);
}

export async function updateAdminRestaurantStatus(
  restaurantId: number,
  patch: { is_published?: boolean; is_active?: boolean }
): Promise<AdminRestaurantRow> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("restaurants")
    .update(patch)
    .eq("restaurant_id", restaurantId)
    .select("*")
    .single();

  if (error) {
    throw new Error("ADMIN_RESTAURANT_UPDATE_FAILED");
  }

  return mapRestaurant(data);
}

export async function deleteAdminRestaurant(restaurantId: number): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("restaurants")
    .delete()
    .eq("restaurant_id", restaurantId);

  if (error) {
    throw new Error("ADMIN_RESTAURANT_DELETE_FAILED");
  }
}

export async function getAdminProvinces() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.from("provinces").select("province_id, province_name_th").order("province_name_th");
  if (error) throw new Error("FAILED_TO_FETCH_PROVINCES");
  return data;
}
