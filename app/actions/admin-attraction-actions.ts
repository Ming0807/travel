"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import {
  getAttractionPublishCategoryError,
  hasExplicitAttractionCategorySelection,
  parseAdminAttractionMutationFormData,
  parseAdminAttractionSectionFormData,
  type AttractionEditSection,
} from "@/lib/validation/admin-attraction";
import { syncAttractionTypeAssignments } from "@/lib/repositories/attraction-category.repository";
import {
  createAdminAttraction,
  updateAdminAttraction,
  updateAdminAttractionSection,
  updateAdminAttractionStatus,
  findAttractionBySlug,
  getAdminAttractionById,
  updateAdminAttractionField,
  getInlineFieldColumn,
  updateAdminAttractionRelatedContentV2,
  searchAdminAttractionRelatedContent,
  type RelatedContentSearchInput,
  type AdminRelatedContentSearchResult,
} from "@/lib/repositories/admin-attraction.repository";
import type {
  RelatedContentMode,
  RelatedContentType,
} from "@/lib/content/attraction-related-content";

type ActionResult<TData = unknown> = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: TData;
};

export async function createAttractionAction(_prevState: ActionResult<{ id: number }>, formData: FormData): Promise<ActionResult<{ id: number }>> {
  try {
    const guard = await requirePermission("attraction.create");
    const parsed = parseAdminAttractionMutationFormData(formData);
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลสถานที่อีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findAttractionBySlug(parsed.data.slug);
    if (existingSlug !== null) {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }

    const created = await createAdminAttraction(parsed.data);
    await syncAttractionTypeAssignments({
      attractionId: created.attraction_id,
      attractionTypeIds: parsed.data.attractionTypeIds,
      primaryAttractionTypeId: parsed.data.primaryAttractionTypeId,
      isPublished: parsed.data.isPublished,
    });
    await logAdminMutation({
      actor: guard.actor,
      action: "attraction.create",
      entityType: "attraction",
      entityId: created.attraction_id,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath('/', 'layout');
    return { success: true, data: { id: created.attraction_id } };
  } catch (error) {
    console.error("Failed to create attraction:", error);
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังสร้างสถานที่ไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function updateAttractionAction(attractionId: number, _prevState: ActionResult<{ id: number }>, formData: FormData): Promise<ActionResult<{ id: number }>> {
  try {
    const guard = await requirePermission("attraction.update");
    const parsed = parseAdminAttractionMutationFormData(formData);
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลสถานที่อีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findAttractionBySlug(parsed.data.slug, attractionId);
    if (existingSlug !== null) {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }

    const old = await getAdminAttractionById(attractionId);
    const updated = await updateAdminAttraction(attractionId, parsed.data);
    if (hasExplicitAttractionCategorySelection(formData)) {
      await syncAttractionTypeAssignments({
        attractionId,
        attractionTypeIds: parsed.data.attractionTypeIds,
        primaryAttractionTypeId: parsed.data.primaryAttractionTypeId,
        isPublished: parsed.data.isPublished,
      });
    }
    await logAdminMutation({
      actor: guard.actor,
      action: "attraction.update",
      entityType: "attraction",
      entityId: updated.attraction_id,
      oldValues: old as unknown as Record<string, unknown>,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath('/', 'layout');
    return { success: true, data: { id: updated.attraction_id } };
  } catch (error) {
    console.error("Failed to update attraction:", error);
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังบันทึกการแก้ไขสถานที่ไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function updateAttractionSectionAction(
  attractionId: number,
  section: AttractionEditSection,
  _prevState: ActionResult<{ id: number }>,
  formData: FormData,
): Promise<ActionResult<{ id: number }>> {
  try {
    const guard = await requirePermission("attraction.update");
    const parsed = parseAdminAttractionSectionFormData(section, formData);
    if (!parsed.success) {
      return {
        success: false,
        error: "กรุณาตรวจข้อมูลในส่วนนี้อีกครั้ง",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    if (parsed.data.section === "header") {
      const existingSlug = await findAttractionBySlug(parsed.data.values.slug, attractionId);
      if (existingSlug !== null) {
        return {
          success: false,
          error: "Slug นี้ถูกใช้งานแล้ว",
          fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] },
        };
      }
    }

    const old = await getAdminAttractionById(attractionId);
    if (!old) return { success: false, error: "ไม่พบสถานที่นี้ อาจถูกลบหรือย้ายแล้ว" };

    const updated = await updateAdminAttractionSection(attractionId, parsed.data);
    if (parsed.data.section === "settings") {
      await syncAttractionTypeAssignments({
        attractionId,
        attractionTypeIds: parsed.data.values.attractionTypeIds,
        primaryAttractionTypeId: parsed.data.values.primaryAttractionTypeId,
        isPublished: parsed.data.values.isPublished,
      });
    }

    await logAdminMutation({
      actor: guard.actor,
      action: `attraction.update_${section}`,
      entityType: "attraction",
      entityId: attractionId,
      oldValues: old as unknown as Record<string, unknown>,
      newValues: parsed.data.values as unknown as Record<string, unknown>,
    });

    revalidatePath("/", "layout");
    return { success: true, data: { id: updated.attraction_id } };
  } catch (error) {
    console.error(`Failed to update attraction ${section} section:`, error);
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    if (error instanceof Error && error.message === "DUPLICATE_SLUG") {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }
    return { success: false, error: "ยังบันทึกส่วนนี้ไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function toggleAttractionPublishAction(attractionId: number): Promise<ActionResult> {
  try {
    const guard = await requirePermission("attraction.publish");
    const current = await getAdminAttractionById(attractionId);
    if (!current) return { success: false, error: "ไม่พบสถานที่นี้ อาจถูกลบหรือย้ายแล้ว" };
    const categoryError = getAttractionPublishCategoryError(
      current.is_published,
      current.attraction_type_id,
    );
    if (categoryError) return { success: false, error: categoryError };

    const updated = await updateAdminAttractionStatus(attractionId, { is_published: !current.is_published });
    await logAdminMutation({
      actor: guard.actor,
      action: current.is_published ? "attraction.unpublish" : "attraction.publish",
      entityType: "attraction",
      entityId: attractionId,
      oldValues: { is_published: current.is_published },
      newValues: { is_published: updated.is_published },
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังเปลี่ยนสถานะเผยแพร่ไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function toggleAttractionActiveAction(attractionId: number): Promise<ActionResult> {
  try {
    const guard = await requirePermission("attraction.deactivate");
    const current = await getAdminAttractionById(attractionId);
    if (!current) return { success: false, error: "ไม่พบสถานที่นี้ อาจถูกลบหรือย้ายแล้ว" };

    const updated = await updateAdminAttractionStatus(attractionId, { is_active: !current.is_active });
    await logAdminMutation({
      actor: guard.actor,
      action: current.is_active ? "attraction.deactivate" : "attraction.activate",
      entityType: "attraction",
      entityId: attractionId,
      oldValues: { is_active: current.is_active },
      newValues: { is_active: updated.is_active },
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังเปลี่ยนสถานะใช้งานไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

// Inline field update for the visual editor.

export async function updateAttractionFieldAction(
  attractionId: number,
  fieldName: string,
  value: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const guard = await requirePermission("attraction.update");

    const dbField = getInlineFieldColumn(fieldName);
    if (!dbField) {
      return { success: false, error: "Invalid field name" };
    }

    await updateAdminAttractionField(attractionId, fieldName, value);

    await logAdminMutation({
      actor: guard.actor,
      action: "attraction.update",
      entityType: "attraction",
      entityId: attractionId,
      newValues: { [fieldName]: value },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Inline field update failed:", error);
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังบันทึกการแก้ไขไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function searchAttractionRelatedContentAction(
  input: RelatedContentSearchInput,
): Promise<ActionResult<AdminRelatedContentSearchResult>> {
  try {
    await requirePermission("attraction.update");
    const data = await searchAdminAttractionRelatedContent(input);
    return { success: true, data };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    if (error instanceof Error && error.message === "ADMIN_ATTRACTION_RELATED_INVALID_INPUT") {
      return { success: false, error: "กรุณาตรวจสอบข้อมูลการค้นหาอีกครั้ง" };
    }
    return { success: false, error: "ไม่สามารถค้นหาเนื้อหาที่เกี่ยวข้องได้ กรุณาลองอีกครั้ง" };
  }
}

function relatedContentDefaultLimit(type: RelatedContentType): number {
  return type === "stories" ? 3 : 4;
}

type SaveRelatedContentActionInput = {
  attractionId: number;
  type: RelatedContentType;
  relatedIds: number[];
  mode?: RelatedContentMode;
  maxItems?: number;
};

export async function saveAttractionRelatedContentAction(
  input: SaveRelatedContentActionInput,
): Promise<ActionResult> {
  try {
    const guard = await requirePermission("attraction.update");
    const mode = input.mode ?? "manual";
    const maxItems = input.maxItems ?? relatedContentDefaultLimit(input.type);
    const updated = await updateAdminAttractionRelatedContentV2({
      attractionId: input.attractionId,
      contentType: input.type,
      mode,
      maxItems,
      relatedIds: input.relatedIds,
    });

    await logAdminMutation({
      actor: guard.actor,
      action: "attraction.update_related",
      entityType: "attraction",
      entityId: input.attractionId,
      newValues: { type: input.type, relatedIds: input.relatedIds, mode, maxItems, curatedCount: updated.curatedCount },
    });

    revalidatePath(`/admin/attractions/${input.attractionId}/edit`);
    try {
      const attraction = await getAdminAttractionById(input.attractionId);
      if (attraction?.slug) revalidatePath(`/attractions/${attraction.slug}`);
    } catch (revalidationError) {
      console.error("Related content saved but public path revalidation failed:", revalidationError);
    }
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    if (error instanceof Error && error.message === "ADMIN_ATTRACTION_RELATED_INVALID_INPUT") {
      return { success: false, error: "กรุณาตรวจสอบโหมด จำนวน และรายการเนื้อหาที่เลือก" };
    }
    return { success: false, error: "ยังบันทึกข้อมูลเชื่อมโยงไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function updateAttractionRelatedContentAction(
  attractionId: number,
  type: RelatedContentType,
  relatedIds: number[],
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const modeValue = formData.get("mode");
  const maxItemsValue = formData.get("maxItems");
  const mode = typeof modeValue === "string" && modeValue.length > 0
    ? modeValue as RelatedContentMode
    : undefined;
  const parsedMaxItems = typeof maxItemsValue === "string" && maxItemsValue.trim()
    ? Number(maxItemsValue)
    : undefined;
  return saveAttractionRelatedContentAction({
    attractionId,
    type,
    relatedIds,
    mode,
    maxItems: parsedMaxItems,
  });
}
