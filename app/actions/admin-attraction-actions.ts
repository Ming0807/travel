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
    const parsed = adminAttractionMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findAttractionBySlug(parsed.data.slug);
    if (existingSlug !== null) {
      return { success: false, error: "Slug already exists.", fieldErrors: { slug: ["This slug is already in use."] } };
    }

    const created = await createAdminAttraction(parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "attraction.create",
      entityType: "attraction",
      entityId: created.attraction_id,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/attractions");
    return { success: true, data: { id: created.attraction_id } };
  } catch (error: any) {
    console.error("Failed to create attraction:", error);
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to create attraction: " + (error.message || "Unknown error") };
  }
}

export async function updateAttractionAction(attractionId: number, prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("attraction.update");
    const parsed = adminAttractionMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findAttractionBySlug(parsed.data.slug, attractionId);
    if (existingSlug !== null) {
      return { success: false, error: "Slug already exists.", fieldErrors: { slug: ["This slug is already in use."] } };
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

    revalidatePath("/admin/attractions");
    return { success: true, data: { id: updated.attraction_id } };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to update attraction." };
  }
}

export async function toggleAttractionPublishAction(attractionId: number): Promise<ActionResult> {
  try {
    const guard = await requirePermission("attraction.publish");
    const current = await getAdminAttractionById(attractionId);
    if (!current) return { success: false, error: "Attraction not found." };

    const updated = await updateAdminAttractionStatus(attractionId, { is_published: !current.is_published });
    await logAdminMutation({
      actor: guard.actor,
      action: current.is_published ? "attraction.unpublish" : "attraction.publish",
      entityType: "attraction",
      entityId: attractionId,
      oldValues: { is_published: current.is_published },
      newValues: { is_published: updated.is_published },
    });

    revalidatePath("/admin/attractions");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to toggle publish status." };
  }
}

export async function toggleAttractionActiveAction(attractionId: number): Promise<ActionResult> {
  try {
    const guard = await requirePermission("attraction.deactivate");
    const current = await getAdminAttractionById(attractionId);
    if (!current) return { success: false, error: "Attraction not found." };

    const updated = await updateAdminAttractionStatus(attractionId, { is_active: !current.is_active });
    await logAdminMutation({
      actor: guard.actor,
      action: current.is_active ? "attraction.deactivate" : "attraction.activate",
      entityType: "attraction",
      entityId: attractionId,
      oldValues: { is_active: current.is_active },
      newValues: { is_active: updated.is_active },
    });

    revalidatePath("/admin/attractions");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to toggle active status." };
  }
}
