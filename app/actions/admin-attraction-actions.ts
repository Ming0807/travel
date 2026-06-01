"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import { adminAttractionMutationSchema } from "@/lib/validation/admin-attraction";
import {
  createAdminAttraction,
  updateAdminAttraction,
  updateAdminAttractionStatus,
  findAttractionBySlug,
  getAdminAttractionById,
  updateAdminAttractionField,
  getInlineFieldColumn,
  updateAdminAttractionRelatedContent,
} from "@/lib/repositories/admin-attraction.repository";

type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: any;
};

export async function createAttractionAction(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("attraction.create");
    const parsed = adminAttractionMutationSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลสถานที่อีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findAttractionBySlug(parsed.data.slug);
    if (existingSlug !== null) {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }

    const created = await createAdminAttraction(parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "attraction.create",
      entityType: "attraction",
      entityId: created.attraction_id,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath('/', 'layout');
    return { success: true, data: { id: created.attraction_id } };
  } catch (error: any) {
    console.error("Failed to create attraction:", error);
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังสร้างสถานที่ไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function updateAttractionAction(attractionId: number, prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("attraction.update");
    const parsed = adminAttractionMutationSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลสถานที่อีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findAttractionBySlug(parsed.data.slug, attractionId);
    if (existingSlug !== null) {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }

    const old = await getAdminAttractionById(attractionId);
    const updated = await updateAdminAttraction(attractionId, parsed.data);
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
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังบันทึกการแก้ไขสถานที่ไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function toggleAttractionPublishAction(attractionId: number): Promise<ActionResult> {
  try {
    const guard = await requirePermission("attraction.publish");
    const current = await getAdminAttractionById(attractionId);
    if (!current) return { success: false, error: "ไม่พบสถานที่นี้ อาจถูกลบหรือย้ายแล้ว" };

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

export async function updateAttractionRelatedContentAction(
  attractionId: number,
  type: 'attractions' | 'restaurants' | 'accommodations' | 'stories',
  relatedIds: number[]
): Promise<ActionResult> {
  try {
    const guard = await requirePermission("attraction.update");
    await updateAdminAttractionRelatedContent(attractionId, type, relatedIds);

    await logAdminMutation({
      actor: guard.actor,
      action: "attraction.update_related",
      entityType: "attraction",
      entityId: attractionId,
      newValues: { type, relatedIds },
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังบันทึกข้อมูลเชื่อมโยงไม่ได้ กรุณาลองอีกครั้ง" };
  }
}
