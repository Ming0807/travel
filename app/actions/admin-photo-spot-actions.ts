"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import { adminPhotoSpotMutationSchema } from "@/lib/validation/photo-spot";
import {
  createAdminPhotoSpot,
  updateAdminPhotoSpot,
  updateAdminPhotoSpotStatus,
  getAdminPhotoSpotById,
} from "@/lib/repositories/photo-spot.repository";

type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createPhotoSpotAction(formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("photo_spot.create");
    const parsed = adminPhotoSpotMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const created = await createAdminPhotoSpot(parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "photo_spot.create",
      entityType: "photo_spot",
      entityId: created.photo_spot_id,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/photo-spots");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to create photo spot." };
  }
}

export async function updatePhotoSpotAction(photoSpotId: number, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("photo_spot.update");
    const parsed = adminPhotoSpotMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const old = await getAdminPhotoSpotById(photoSpotId);
    const updated = await updateAdminPhotoSpot(photoSpotId, parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "photo_spot.update",
      entityType: "photo_spot",
      entityId: updated.photo_spot_id,
      oldValues: old as unknown as Record<string, unknown>,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/photo-spots");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to update photo spot." };
  }
}

export async function togglePhotoSpotActiveAction(photoSpotId: number): Promise<ActionResult> {
  try {
    const guard = await requirePermission("photo_spot.deactivate");
    const current = await getAdminPhotoSpotById(photoSpotId);
    if (!current) return { success: false, error: "Photo spot not found." };

    const updated = await updateAdminPhotoSpotStatus(photoSpotId, !current.is_active);
    await logAdminMutation({
      actor: guard.actor,
      action: current.is_active ? "photo_spot.deactivate" : "photo_spot.activate",
      entityType: "photo_spot",
      entityId: photoSpotId,
      oldValues: { is_active: current.is_active },
      newValues: { is_active: updated.is_active },
    });

    revalidatePath("/admin/photo-spots");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to toggle active status." };
  }
}
