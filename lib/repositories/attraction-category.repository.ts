import "server-only";

import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { firstJoin, type SupabaseJoin } from "@/lib/utils/supabase-joins";

export type AttractionTypeAssignment = {
  attractionTypeId: number;
  isPrimary: boolean;
  displayOrder: number;
  nameTh: string;
  nameEn: string;
  isActive: boolean;
};

type AssignmentRow = {
  attraction_type_id: number;
  is_primary: boolean;
  display_order: number;
  attraction_types?: SupabaseJoin<{
    type_name_th: string;
    type_name_en: string;
    is_active: boolean;
  }>;
};

export async function listAttractionTypeAssignments(attractionId: number): Promise<AttractionTypeAssignment[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("attraction_type_assignments")
    .select("attraction_type_id, is_primary, display_order, attraction_types(type_name_th, type_name_en, is_active)")
    .eq("attraction_id", attractionId)
    .order("display_order", { ascending: true });

  if (error) throw new Error("ATTRACTION_CATEGORIES_LOAD_FAILED");

  return ((data ?? []) as AssignmentRow[]).flatMap((row) => {
    const category = firstJoin(row.attraction_types);
    if (!category) return [];
    return [{
      attractionTypeId: Number(row.attraction_type_id),
      isPrimary: Boolean(row.is_primary),
      displayOrder: Number(row.display_order),
      nameTh: category.type_name_th,
      nameEn: category.type_name_en,
      isActive: Boolean(category.is_active),
    }];
  }).sort((left, right) => Number(right.isPrimary) - Number(left.isPrimary) || left.displayOrder - right.displayOrder);
}

export async function syncAttractionTypeAssignments(input: {
  attractionId: number;
  attractionTypeIds: number[];
  primaryAttractionTypeId: number | null;
  isPublished: boolean;
}): Promise<void> {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase.rpc("sync_attraction_types", {
    p_attraction_id: input.attractionId,
    p_attraction_type_ids: input.attractionTypeIds,
    p_primary_attraction_type_id: input.primaryAttractionTypeId,
    p_is_published: input.isPublished,
  });
  if (error) {
    const message = typeof error.message === "string" ? error.message : "";
    if (message.includes("ATTRACTION_CATEGORY_LIMIT_EXCEEDED")) throw new Error("ATTRACTION_CATEGORY_LIMIT_EXCEEDED");
    if (message.includes("ATTRACTION_PRIMARY_CATEGORY")) throw new Error("ATTRACTION_PRIMARY_CATEGORY_INVALID");
    if (message.includes("ATTRACTION_CATEGORY_INVALID")) throw new Error("ATTRACTION_CATEGORY_INVALID");
    throw new Error("ATTRACTION_CATEGORIES_SYNC_FAILED");
  }
}
