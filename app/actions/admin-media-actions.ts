"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import { adminMediaMutationSchema } from "@/lib/validation/media";
import {
  createAdminMedia,
  updateAdminMedia,
  updateAdminMediaStatus,
  archiveAdminMedia,
  getAdminMediaById,
} from "@/lib/repositories/admin-media.repository";

type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function adminMediaEntityPath(entityType: string, entityId: number) {
  const segmentByEntity: Record<string, string> = {
    attraction: "attractions",
    restaurant: "restaurants",
    story: "stories",
    route: "routes",
  };

  return `/admin/${segmentByEntity[entityType] ?? `${entityType}s`}/${entityId}/media`;
}

export async function createMediaAction(prevState: any, formData: FormData): Promise<ActionResult> {
  try {
    const parsed = adminMediaMutationSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      console.error("CREATE_MEDIA_VALIDATION_ERROR", parsed.error.flatten().fieldErrors);
      return { success: false, error: "กรุณาตรวจข้อมูลสื่ออีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const guard = await requirePermission("media.upload");
    const created = await createAdminMedia(parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "media.create",
      entityType: "content_media",
      entityId: created.media_id,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error("CREATE_MEDIA_ERROR", error);
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังบันทึกสื่อไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function updateMediaAction(mediaId: number, prevState: any, formData: FormData): Promise<ActionResult> {
  try {
    const parsed = adminMediaMutationSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      console.error("UPDATE_MEDIA_VALIDATION_ERROR", parsed.error.flatten().fieldErrors);
      return { success: false, error: "กรุณาตรวจข้อมูลสื่ออีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const guard = await requirePermission("media.update");
    const old = await getAdminMediaById(mediaId);
    if (!old) return { success: false, error: "ไม่พบสื่อนี้ อาจถูกลบหรือย้ายแล้ว" };

    const updated = await updateAdminMedia(mediaId, parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "media.update",
      entityType: "content_media",
      entityId: updated.media_id,
      oldValues: old as unknown as Record<string, unknown>,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error("UPDATE_MEDIA_ERROR", error);
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังบันทึกการแก้ไขสื่อไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function toggleMediaActiveAction(mediaId: number): Promise<ActionResult> {
  try {
    const current = await getAdminMediaById(mediaId);
    if (!current) return { success: false, error: "ไม่พบสื่อนี้ อาจถูกลบหรือย้ายแล้ว" };

    const guard = await requirePermission("media.deactivate");

    const shouldActivate = !current.is_active;
    const updated = await updateAdminMediaStatus(mediaId, {
      is_active: shouldActivate,
      lifecycle_status: shouldActivate ? "active" : "draft",
      archived_at: shouldActivate ? null : current.archived_at,
    });
    await logAdminMutation({
      actor: guard.actor,
      action: current.is_active ? "media.deactivate" : "media.activate",
      entityType: "content_media",
      entityId: mediaId,
      oldValues: { is_active: current.is_active, lifecycle_status: current.lifecycle_status },
      newValues: { is_active: updated.is_active, lifecycle_status: updated.lifecycle_status },
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังเปลี่ยนสถานะใช้งานสื่อไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function deleteMediaAction(mediaId: number): Promise<ActionResult> {
  try {
    const current = await getAdminMediaById(mediaId);
    if (!current) return { success: false, error: "ไม่พบสื่อนี้ อาจถูกลบหรือย้ายแล้ว" };

    const guard = await requirePermission("media.deactivate");

    const archived = await archiveAdminMedia(mediaId);
    await logAdminMutation({
      actor: guard.actor,
      action: "media.archive",
      entityType: "content_media",
      entityId: mediaId,
      oldValues: current as unknown as Record<string, unknown>,
      newValues: {
        is_active: archived.is_active,
        lifecycle_status: archived.lifecycle_status,
        archived_at: archived.archived_at,
      },
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังลบสื่อไม่ได้ กรุณาลองอีกครั้ง" };
  }
}
