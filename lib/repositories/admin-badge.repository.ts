import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { BadgeDefinitionInput, AdminBadgeFilters } from "@/lib/validation/admin-badge";
import type { BadgeDefinition } from "@/types/tourism";

type BadgeDefinitionRow = {
  badge_id: number | string;
  badge_key: string;
  name_th: string;
  name_en: string;
  description_th: string | null;
  description_en: string | null;
  icon_name: string | null;
  icon_color: string | null;
  category: BadgeDefinition["category"];
  requirement_type: string;
  requirement_value: number | string;
  requirement_extra: string | null;
  display_order: number | string;
  is_active: boolean;
};

function mapBadgeDefinition(row: BadgeDefinitionRow): BadgeDefinition {
  return {
    badgeId: Number(row.badge_id),
    badgeKey: row.badge_key,
    nameTh: row.name_th,
    nameEn: row.name_en,
    descriptionTh: row.description_th || null,
    descriptionEn: row.description_en || null,
    iconName: row.icon_name || null,
    iconColor: row.icon_color || "#E18868",
    category: row.category,
    requirementType: row.requirement_type,
    requirementValue: Number(row.requirement_value),
    requirementExtra: row.requirement_extra || null,
    displayOrder: Number(row.display_order),
    isActive: row.is_active,
  };
}

export async function listAdminBadges(filters: AdminBadgeFilters): Promise<{
  items: BadgeDefinition[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const supabase = createSupabaseServiceRoleClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  let query = supabase.from("badge_definitions").select("*", { count: "exact" });
  let countQuery = supabase.from("badge_definitions").select("*", { count: "exact", head: true });

  if (filters.search) {
    const search = `%${filters.search}%`;
    query = query.or(`name_th.ilike.${search},name_en.ilike.${search},badge_key.ilike.${search}`);
    countQuery = countQuery.or(`name_th.ilike.${search},name_en.ilike.${search},badge_key.ilike.${search}`);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
    countQuery = countQuery.eq("category", filters.category);
  }

  if (filters.isActive !== undefined) {
    const isActive = filters.isActive === "true";
    query = query.eq("is_active", isActive);
    countQuery = countQuery.eq("is_active", isActive);
  }

  const { count: total } = await countQuery;
  const { data, error } = await query
    .order("display_order", { ascending: true })
    .range(offset, offset + pageSize - 1);

  if (error) {
    throw new Error(`Failed to fetch badges: ${error.message}`);
  }

  return {
    items: (data ?? []).map(mapBadgeDefinition),
    total: total ?? 0,
    page,
    pageSize,
  };
}

export async function getAdminBadgeById(badgeId: number): Promise<BadgeDefinition | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("badge_definitions")
    .select("*")
    .eq("badge_id", badgeId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`Failed to fetch badge: ${error.message}`);
  }

  return mapBadgeDefinition(data);
}

export async function createAdminBadge(input: BadgeDefinitionInput): Promise<BadgeDefinition> {
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("badge_definitions")
    .insert({
      badge_key: input.badgeKey,
      name_th: input.nameTh,
      name_en: input.nameEn,
      description_th: input.descriptionTh || null,
      description_en: input.descriptionEn || null,
      icon_name: input.iconName || null,
      icon_color: input.iconColor || "#E18868",
      category: input.category,
      requirement_type: input.requirementType,
      requirement_value: input.requirementValue,
      requirement_extra: input.requirementExtra || null,
      display_order: input.displayOrder ?? 0,
      is_active: input.isActive ?? true,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Badge key "${input.badgeKey}" already exists`);
    }
    throw new Error(`Failed to create badge: ${error.message}`);
  }

  return mapBadgeDefinition(data);
}

export async function updateAdminBadge(
  badgeId: number,
  input: BadgeDefinitionInput
): Promise<BadgeDefinition> {
  const supabase = createSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from("badge_definitions")
    .update({
      badge_key: input.badgeKey,
      name_th: input.nameTh,
      name_en: input.nameEn,
      description_th: input.descriptionTh || null,
      description_en: input.descriptionEn || null,
      icon_name: input.iconName || null,
      icon_color: input.iconColor || "#E18868",
      category: input.category,
      requirement_type: input.requirementType,
      requirement_value: input.requirementValue,
      requirement_extra: input.requirementExtra || null,
      display_order: input.displayOrder ?? 0,
      is_active: input.isActive ?? true,
    })
    .eq("badge_id", badgeId)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error(`Badge key "${input.badgeKey}" already exists`);
    }
    throw new Error(`Failed to update badge: ${error.message}`);
  }

  return mapBadgeDefinition(data);
}

export async function toggleBadgeActive(badgeId: number): Promise<BadgeDefinition> {
  const supabase = createSupabaseServiceRoleClient();

  const current = await getAdminBadgeById(badgeId);
  if (!current) {
    throw new Error("Badge not found");
  }

  const { data, error } = await supabase
    .from("badge_definitions")
    .update({ is_active: !current.isActive })
    .eq("badge_id", badgeId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to toggle badge status: ${error.message}`);
  }

  return mapBadgeDefinition(data);
}

export async function deleteAdminBadge(badgeId: number): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();

  const { error } = await supabase
    .from("badge_definitions")
    .delete()
    .eq("badge_id", badgeId);

  if (error) {
    throw new Error(`Failed to delete badge: ${error.message}`);
  }
}
