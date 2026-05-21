"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import { adminMediaMutationSchema } from "@/lib/validation/media";
import {
  createAdminMedia,
  updateAdminMedia,
  updateAdminMediaStatus,
  deleteAdminMedia,
  getAdminMediaById,
} from "@/lib/repositories/admin-media.repository";

type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createMediaAction(formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("attraction.update");
    const parsed = adminMediaMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const created = await createAdminMedia(parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "media.create",
      entityType: "attraction_media",
      entityId: created.media_id,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath(`/admin/attractions/${parsed.data.attractionId}/media`);
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to create media." };
  }
}

export async function updateMediaAction(mediaId: number, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("attraction.update");
    const parsed = adminMediaMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const old = await getAdminMediaById(mediaId);
    if (!old) return { success: false, error: "Media not found." };

    const updated = await updateAdminMedia(mediaId, parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "media.update",
      entityType: "attraction_media",
      entityId: updated.media_id,
      oldValues: old as unknown as Record<string, unknown>,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath(`/admin/attractions/${parsed.data.attractionId}/media`);
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to update media." };
  }
}

export async function toggleMediaActiveAction(mediaId: number): Promise<ActionResult> {
  try {
    const current = await getAdminMediaById(mediaId);
    if (!current) return { success: false, error: "Media not found." };

    const guard = await requirePermission("attraction.update");

    const updated = await updateAdminMediaStatus(mediaId, { is_active: !current.is_active });
    await logAdminMutation({
      actor: guard.actor,
      action: current.is_active ? "media.deactivate" : "media.activate",
      entityType: "attraction_media",
      entityId: mediaId,
      oldValues: { is_active: current.is_active },
      newValues: { is_active: updated.is_active },
    });

    revalidatePath(`/admin/attractions/${current.attraction_id}/media`);
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to toggle active status." };
  }
}

export async function deleteMediaAction(mediaId: number): Promise<ActionResult> {
  try {
    const current = await getAdminMediaById(mediaId);
    if (!current) return { success: false, error: "Media not found." };

    const guard = await requirePermission("attraction.update");

    await deleteAdminMedia(mediaId);
    await logAdminMutation({
      actor: guard.actor,
      action: "media.delete",
      entityType: "attraction_media",
      entityId: mediaId,
      oldValues: current as unknown as Record<string, unknown>,
    });

    revalidatePath(`/admin/attractions/${current.attraction_id}/media`);
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to delete media." };
  }
}
