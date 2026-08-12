import "server-only";
import { assertLiveDestinationProvinceId } from "@/lib/repositories/destination-scope.repository";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { AdminRestaurantFilters, AdminRestaurantMutationInput } from "@/lib/validation/admin-restaurant";
import { firstJoin } from "@/lib/utils/supabase-joins";
import { asRecord, booleanValue, nullableNumber, nullableString, numberValue, stringValue } from "@/lib/utils/record";
import {
  listRestaurantCategoryIds,
  syncAdminRestaurantCategories,
} from "@/lib/repositories/admin-restaurant-category.repository";

export type AdminRestaurantCategorySummary = {
  categoryId: number;
  slug: string;
  nameTh: string;
  nameEn: string | null;
  isActive: boolean;
};

export type AdminRestaurantRow = {
  restaurant_id: number;
  province_id: number;
  slug: string;
  name_th: string;
  name_en: string | null;
  description_th: string | null;
  description_en: string | null;
  food_type: string | null;
  category_ids: number[];
  categories: AdminRestaurantCategorySummary[];
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

function mapRestaurant(rawRow: unknown): AdminRestaurantRow {
  const row = asRecord(rawRow);
  const province = asRecord(firstJoin(row.provinces as { province_name_th?: unknown } | { province_name_th?: unknown }[] | null));
  const categoryAssignments = Array.isArray(row.restaurant_category_assignments)
    ? row.restaurant_category_assignments
      .map((assignment) => asRecord(assignment))
      .sort((left, right) => numberValue(left.display_order) - numberValue(right.display_order))
    : [];
  const categories = categoryAssignments.flatMap<AdminRestaurantCategorySummary>((assignment) => {
    const category = asRecord(firstJoin(assignment.restaurant_categories as Record<string, unknown> | Record<string, unknown>[] | null));
    const categoryId = numberValue(category.category_id);
    if (categoryId <= 0) return [];
    return [{
      categoryId,
      slug: stringValue(category.slug),
      nameTh: stringValue(category.name_th),
      nameEn: nullableString(category.name_en),
      isActive: booleanValue(category.is_active),
    }];
  });

  return {
    restaurant_id: numberValue(row.restaurant_id),
    province_id: numberValue(row.province_id),
    slug: stringValue(row.slug),
    name_th: stringValue(row.name_th),
    name_en: nullableString(row.name_en),
    description_th: nullableString(row.description_th),
    description_en: nullableString(row.description_en),
    food_type: nullableString(row.food_type),
    category_ids: categories.map((category) => category.categoryId),
    categories,
    latitude: nullableNumber(row.latitude),
    longitude: nullableNumber(row.longitude),
    address_text: nullableString(row.address_text),
    opening_hours: nullableString(row.opening_hours),
    contact_info: nullableString(row.contact_info),
    is_published: booleanValue(row.is_published),
    is_active: booleanValue(row.is_active),
    created_at: stringValue(row.created_at),
    updated_at: nullableString(row.updated_at),
    province_name_th: nullableString(province.province_name_th),
    attraction_count: numberValue(row.attraction_count)
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
    latitude: input.latitude,
    longitude: input.longitude,
    address_text: input.addressText,
    opening_hours: input.openingHours,
    contact_info: input.contactInfo,
    is_active: input.isActive
  };
}

const restaurantCategorySelect = `
  restaurant_category_assignments (
    display_order,
    restaurant_categories (category_id, slug, name_th, name_en, is_active)
  )
`;

function escapeAdminRestaurantIlike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&").replace(/,/g, " ").trim();
}

export async function listAdminRestaurants(filters: AdminRestaurantFilters): Promise<PaginatedResult<AdminRestaurantRow>> {
  const supabase = createSupabaseServiceRoleClient();
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let categoryRestaurantIds: number[] | null = null;
  if (filters.categorySlug) {
    const { data: categoryLinks, error: categoryError } = await supabase
      .from("restaurant_category_assignments")
      .select("restaurant_id, restaurant_categories!inner(slug)")
      .eq("restaurant_categories.slug", filters.categorySlug);
    if (categoryError) throw new Error("ADMIN_RESTAURANT_CATEGORY_FILTER_FAILED");
    categoryRestaurantIds = Array.from(new Set(
      (categoryLinks ?? []).map((row) => Number(row.restaurant_id)).filter(Number.isFinite),
    ));
    if (categoryRestaurantIds.length === 0) {
      return { items: [], total: 0, page: filters.page, pageSize: filters.pageSize };
    }
  }

  let query = supabase
    .from("restaurants")
    .select(
      `
        *,
        provinces (province_name_th),
        ${restaurantCategorySelect}
      `,
      { count: "exact" }
    )
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    const escaped = escapeAdminRestaurantIlike(filters.search);
    query = query.or(`name_th.ilike.%${escaped}%,name_en.ilike.%${escaped}%,slug.ilike.%${escaped}%`);
  }
  if (filters.provinceId) query = query.eq("province_id", filters.provinceId);
  if (filters.foodType) query = query.ilike("food_type", `%${escapeAdminRestaurantIlike(filters.foodType)}%`);
  if (categoryRestaurantIds) query = query.in("restaurant_id", categoryRestaurantIds);
  if (filters.isPublished !== undefined) query = query.eq("is_published", filters.isPublished);

  const { data, error, count } = await query;

  if (error) {
    throw new Error("ADMIN_RESTAURANT_LIST_FAILED");
  }

  // Get attraction counts for each restaurant
  const restaurantIds = (data ?? []).map((row) => Number(row.restaurant_id));
  const attractionCounts = new Map<number, number>();

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
        provinces (province_name_th),
        ${restaurantCategorySelect}
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
  await assertLiveDestinationProvinceId(input.provinceId);
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .rpc("create_restaurant_with_categories", {
      p_payload: toPayload(input),
      p_category_ids: input.categoryIds,
      p_is_published: input.isPublished,
    });

  if (error) {
    const message = typeof error.message === "string" ? error.message : "";
    if (error.code === "23505") throw new Error("DUPLICATE_SLUG");
    if (message.includes("RESTAURANT_CATEGORY_REQUIRED")) throw new Error("RESTAURANT_CATEGORY_REQUIRED");
    if (message.includes("RESTAURANT_CATEGORY_INVALID")) throw new Error("RESTAURANT_CATEGORY_INVALID");
    throw new Error("ADMIN_RESTAURANT_CREATE_FAILED");
  }

  const restaurantId = numberValue(data);
  const created = await getAdminRestaurantById(restaurantId);
  if (!created) throw new Error("ADMIN_RESTAURANT_CREATE_FAILED");
  return created;
}

export async function updateAdminRestaurant(restaurantId: number, input: AdminRestaurantMutationInput): Promise<AdminRestaurantRow> {
  await assertLiveDestinationProvinceId(input.provinceId);
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.rpc("update_restaurant_with_categories", {
    p_restaurant_id: restaurantId,
    p_payload: toPayload(input),
    p_category_ids: input.categoryIds,
    p_is_published: input.isPublished,
  });

  if (error) {
    const message = typeof error.message === "string" ? error.message : "";
    if (error.code === "23505") throw new Error("DUPLICATE_SLUG");
    if (message.includes("RESTAURANT_CATEGORY_REQUIRED")) throw new Error("RESTAURANT_CATEGORY_REQUIRED");
    if (message.includes("RESTAURANT_CATEGORY_INVALID")) throw new Error("RESTAURANT_CATEGORY_INVALID");
    throw new Error("ADMIN_RESTAURANT_UPDATE_FAILED");
  }

  const updated = await getAdminRestaurantById(restaurantId);
  if (!updated) throw new Error("ADMIN_RESTAURANT_UPDATE_FAILED");
  return updated;
}

export async function updateAdminRestaurantStatus(
  restaurantId: number,
  patch: { is_published?: boolean; is_active?: boolean }
): Promise<AdminRestaurantRow> {
  const supabase = createSupabaseServiceRoleClient();
  if (patch.is_published !== undefined) {
    const categoryIds = await listRestaurantCategoryIds(restaurantId);
    await syncAdminRestaurantCategories(restaurantId, categoryIds, patch.is_published);
  }

  const directPatch = { ...patch };
  delete directPatch.is_published;
  if (Object.keys(directPatch).length === 0) {
    const current = await getAdminRestaurantById(restaurantId);
    if (!current) throw new Error("ADMIN_RESTAURANT_UPDATE_FAILED");
    return current;
  }

  const { data, error } = await supabase
    .from("restaurants")
    .update(directPatch)
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
