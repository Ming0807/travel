import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  RestaurantCategoryMutationInput,
  RestaurantCategorySection,
} from "@/lib/validation/restaurant-category";
import {
  asRecord,
  booleanValue,
  nullableString,
  numberValue,
  stringValue,
} from "@/lib/utils/record";

export type AdminRestaurantCategory = {
  categoryId: number;
  slug: string;
  nameTh: string;
  nameEn: string | null;
  sectionKey: RestaurantCategorySection;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  restaurantCount: number;
  createdAt: string;
  updatedAt: string | null;
};

function mapCategory(raw: unknown, restaurantCount = 0): AdminRestaurantCategory {
  const row = asRecord(raw);
  const section = stringValue(row.section_key, "other");
  return {
    categoryId: numberValue(row.category_id),
    slug: stringValue(row.slug),
    nameTh: stringValue(row.name_th),
    nameEn: nullableString(row.name_en),
    sectionKey: ["local", "meals", "cafes", "other"].includes(section)
      ? section as RestaurantCategorySection
      : "other",
    displayOrder: numberValue(row.display_order),
    isFeatured: booleanValue(row.is_featured),
    isActive: booleanValue(row.is_active),
    restaurantCount,
    createdAt: stringValue(row.created_at),
    updatedAt: nullableString(row.updated_at),
  };
}

function categoryPayload(input: RestaurantCategoryMutationInput) {
  return {
    slug: input.slug,
    name_th: input.nameTh,
    name_en: input.nameEn,
    section_key: input.sectionKey,
    display_order: input.displayOrder,
    is_featured: input.isFeatured,
    is_active: input.isActive,
  };
}

export async function listAdminRestaurantCategories(options?: {
  activeOnly?: boolean;
}): Promise<AdminRestaurantCategory[]> {
  const supabase = createSupabaseServiceRoleClient();
  let query = supabase
    .from("restaurant_categories")
    .select("category_id, slug, name_th, name_en, section_key, display_order, is_featured, is_active, created_at, updated_at");
  if (options?.activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query
    .order("display_order", { ascending: true })
    .order("category_id", { ascending: true });
  if (error) throw new Error("RESTAURANT_CATEGORY_LIST_FAILED");

  const { data: usageRows, error: usageError } = await supabase
    .rpc("list_restaurant_category_usage");
  if (usageError) throw new Error("RESTAURANT_CATEGORY_COUNTS_FAILED");

  const counts = new Map<number, number>();
  for (const raw of usageRows ?? []) {
    const row = asRecord(raw);
    counts.set(numberValue(row.category_id), numberValue(row.restaurant_count));
  }

  return (data ?? []).map((row) => {
    const categoryId = numberValue(asRecord(row).category_id);
    return mapCategory(row, counts.get(categoryId) ?? 0);
  });
}

export async function createAdminRestaurantCategory(
  input: RestaurantCategoryMutationInput,
): Promise<AdminRestaurantCategory> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("restaurant_categories")
    .insert(categoryPayload(input))
    .select("*")
    .single();
  if (error) {
    throw new Error(error.code === "23505"
      ? "RESTAURANT_CATEGORY_DUPLICATE_SLUG"
      : "RESTAURANT_CATEGORY_CREATE_FAILED");
  }
  return mapCategory(data);
}

export async function updateAdminRestaurantCategory(
  categoryId: number,
  input: RestaurantCategoryMutationInput,
): Promise<AdminRestaurantCategory> {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.rpc("update_restaurant_category", {
    p_category_id: categoryId,
    p_payload: categoryPayload(input),
  });
  if (error) {
    const message = typeof error.message === "string" ? error.message : "";
    if (error.code === "23505") throw new Error("RESTAURANT_CATEGORY_DUPLICATE_SLUG");
    if (message.includes("RESTAURANT_CATEGORY_LAST_ACTIVE")) {
      throw new Error("RESTAURANT_CATEGORY_LAST_ACTIVE");
    }
    throw new Error("RESTAURANT_CATEGORY_UPDATE_FAILED");
  }
  const updated = (await listAdminRestaurantCategories()).find((category) => category.categoryId === categoryId);
  if (!updated) throw new Error("RESTAURANT_CATEGORY_UPDATE_FAILED");
  return updated;
}

export async function setAdminRestaurantCategoryActive(
  categoryId: number,
  isActive: boolean,
): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.rpc("set_restaurant_category_active", {
    p_category_id: categoryId,
    p_is_active: isActive,
  });
  if (error) {
    const message = typeof error.message === "string" ? error.message : "";
    if (message.includes("RESTAURANT_CATEGORY_LAST_ACTIVE")) {
      throw new Error("RESTAURANT_CATEGORY_LAST_ACTIVE");
    }
    throw new Error("RESTAURANT_CATEGORY_UPDATE_FAILED");
  }
}

export async function deleteUnusedAdminRestaurantCategory(categoryId: number): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { data: assignments, error: assignmentError } = await supabase
    .from("restaurant_category_assignments")
    .select("restaurant_id")
    .eq("category_id", categoryId)
    .limit(1);
  if (assignmentError) throw new Error("RESTAURANT_CATEGORY_READ_FAILED");
  if ((assignments ?? []).length > 0) throw new Error("RESTAURANT_CATEGORY_IN_USE");

  const { error } = await supabase
    .from("restaurant_categories")
    .delete()
    .eq("category_id", categoryId);
  if (error) throw new Error("RESTAURANT_CATEGORY_DELETE_FAILED");
}

export async function syncAdminRestaurantCategories(
  restaurantId: number,
  categoryIds: number[],
  isPublished: boolean | null,
): Promise<void> {
  const normalizedIds = Array.from(new Set(categoryIds));
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.rpc("sync_restaurant_categories", {
    p_restaurant_id: restaurantId,
    p_category_ids: normalizedIds,
    p_is_published: isPublished,
  });
  if (error) {
    const message = typeof error.message === "string" ? error.message : "";
    if (message.includes("RESTAURANT_CATEGORY_REQUIRED")) {
      throw new Error("RESTAURANT_CATEGORY_REQUIRED");
    }
    if (message.includes("RESTAURANT_CATEGORY_INVALID")) {
      throw new Error("RESTAURANT_CATEGORY_INVALID");
    }
    throw new Error("RESTAURANT_CATEGORY_SYNC_FAILED");
  }
}

export async function listRestaurantCategoryIds(restaurantId: number): Promise<number[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("restaurant_category_assignments")
    .select("category_id")
    .eq("restaurant_id", restaurantId)
    .order("display_order", { ascending: true });
  if (error) throw new Error("RESTAURANT_CATEGORY_ASSIGNMENTS_FAILED");
  return (data ?? []).map((row) => numberValue(asRecord(row).category_id)).filter((id) => id > 0);
}
