"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import { assertLiveDestinationProvinceId } from "@/lib/repositories/destination-scope.repository";
import { adminAccommodationMutationSchema } from "@/lib/validation/admin-accommodation";
import { clearCoverMediaForEntity, getAdminMediaById, linkMediaToEntity } from "@/lib/repositories/admin-media.repository";
import {
  createAdminAccommodation,
  updateAdminAccommodation,
  updateAdminAccommodationStatus,
  findAccommodationBySlug,
  getAdminAccommodationById,
} from "@/lib/repositories/admin-accommodation.repository";

type ActionResult<TData = unknown> = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: TData;
};

async function validateAccommodationCoverMedia(mediaId: number | null, previewUrl: string | null) {
  if (mediaId === null) {
    if (previewUrl) throw new Error("ACCOMMODATION_COVER_MEDIA_INVALID");
    return null;
  }
  const media = await getAdminMediaById(mediaId);
  if (!media || media.media_type !== "image" || !media.is_active || media.lifecycle_status === "archived") {
    throw new Error("ACCOMMODATION_COVER_MEDIA_INVALID");
  }
  return media.media_id;
}

function accommodationActionError<TData = unknown>(error: unknown, fallback: string): ActionResult<TData> {
  if (error instanceof AdminAuthError) return { success: false, error: error.message };
  if (error instanceof Error && error.message === "ACCOMMODATION_COVER_MEDIA_INVALID") {
    return { success: false, error: "กรุณาเลือกรูปภาพปกจากคลังสื่ออีกครั้ง", fieldErrors: { coverMediaId: ["รูปภาพไม่พร้อมใช้งาน"] } };
  }
  if (error instanceof Error && error.message === "DESTINATION_PROVINCE_NOT_AVAILABLE") {
    return { success: false, error: "จังหวัดที่เลือกยังไม่เปิดให้ใช้งาน", fieldErrors: { provinceId: ["เลือกจังหวัดที่เปิดให้บริการ"] } };
  }
  return { success: false, error: fallback };
}

export async function createAccommodationAction(_prevState: ActionResult<{ id: number }>, formData: FormData): Promise<ActionResult<{ id: number }>> {
  try {
    const guard = await requirePermission("attraction.create"); // Uses attraction.create permission for accommodations by default
    const parsed = adminAccommodationMutationSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลที่พักอีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findAccommodationBySlug(parsed.data.slug);
    if (existingSlug !== null) {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }

    const coverMediaId = await validateAccommodationCoverMedia(parsed.data.coverMediaId, parsed.data.coverMediaUrl);
    const created = await createAdminAccommodation(parsed.data);

    // Link cover media if provided
    if (coverMediaId !== null) {
      await linkMediaToEntity(coverMediaId, "accommodation", created.accommodation_id);
    }

    await logAdminMutation({
      actor: guard.actor,
      action: "accommodation.create",
      entityType: "accommodation",
      entityId: created.accommodation_id,
      newValues: { ...parsed.data, coverMediaId: undefined } as unknown as Record<string, unknown>,
    });

    revalidatePath('/', 'layout');
    return { success: true, data: { id: created.accommodation_id } };
  } catch (error) {
    console.error("Failed to create accommodation:", error);
    return accommodationActionError(error, "ยังสร้างที่พักไม่ได้ กรุณาลองอีกครั้ง");
  }
}

export async function updateAccommodationAction(accommodationId: number, _prevState: ActionResult<{ id: number }>, formData: FormData): Promise<ActionResult<{ id: number }>> {
  try {
    const guard = await requirePermission("attraction.update");
    const parsed = adminAccommodationMutationSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลที่พักอีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findAccommodationBySlug(parsed.data.slug, accommodationId);
    if (existingSlug !== null) {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }

    const old = await getAdminAccommodationById(accommodationId);
    if (!old) return { success: false, error: "ไม่พบที่พักนี้ อาจถูกลบหรือย้ายแล้ว" };
    if (old.province_id !== parsed.data.provinceId) {
      await assertLiveDestinationProvinceId(parsed.data.provinceId);
    }

    const coverMediaId = await validateAccommodationCoverMedia(parsed.data.coverMediaId, parsed.data.coverMediaUrl);
    const updated = await updateAdminAccommodation(accommodationId, parsed.data);

    // Link cover media if provided
    if (coverMediaId !== null) {
      await linkMediaToEntity(coverMediaId, "accommodation", updated.accommodation_id);
    } else {
      await clearCoverMediaForEntity("accommodation", updated.accommodation_id);
    }

    await logAdminMutation({
      actor: guard.actor,
      action: "accommodation.update",
      entityType: "accommodation",
      entityId: updated.accommodation_id,
      oldValues: old as unknown as Record<string, unknown>,
      newValues: { ...parsed.data, coverMediaId: undefined } as unknown as Record<string, unknown>,
    });

    revalidatePath('/', 'layout');
    return { success: true, data: { id: updated.accommodation_id } };
  } catch (error) {
    return accommodationActionError(error, "ยังบันทึกการแก้ไขที่พักไม่ได้ กรุณาลองอีกครั้ง");
  }
}

export async function toggleAccommodationPublishAction(accommodationId: number): Promise<ActionResult> {
  try {
    const guard = await requirePermission("attraction.publish");
    const current = await getAdminAccommodationById(accommodationId);
    if (!current) return { success: false, error: "ไม่พบที่พักนี้ อาจถูกลบหรือย้ายแล้ว" };

    const updated = await updateAdminAccommodationStatus(accommodationId, { is_published: !current.is_published });
    await logAdminMutation({
      actor: guard.actor,
      action: current.is_published ? "accommodation.unpublish" : "accommodation.publish",
      entityType: "accommodation",
      entityId: accommodationId,
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

export async function toggleAccommodationActiveAction(accommodationId: number): Promise<ActionResult> {
  try {
    const guard = await requirePermission("attraction.deactivate");
    const current = await getAdminAccommodationById(accommodationId);
    if (!current) return { success: false, error: "ไม่พบที่พักนี้ อาจถูกลบหรือย้ายแล้ว" };

    const updated = await updateAdminAccommodationStatus(accommodationId, { is_active: !current.is_active });
    await logAdminMutation({
      actor: guard.actor,
      action: current.is_active ? "accommodation.deactivate" : "accommodation.activate",
      entityType: "accommodation",
      entityId: accommodationId,
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

export async function archiveAccommodationAction(accommodationId: number): Promise<ActionResult> {
  try {
    const guard = await requirePermission("attraction.delete");
    const current = await getAdminAccommodationById(accommodationId);
    if (!current) return { success: false, error: "ไม่พบที่พักนี้ อาจถูกลบหรือย้ายแล้ว" };

    await updateAdminAccommodationStatus(accommodationId, {
      is_active: false,
      is_published: false,
    });
    await logAdminMutation({
      actor: guard.actor,
      action: "accommodation.archive",
      entityType: "accommodation",
      entityId: accommodationId,
      oldValues: {
        is_active: current.is_active,
        is_published: current.is_published,
      },
      newValues: { is_active: false, is_published: false },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังลบที่พักออกจากระบบไม่ได้ กรุณาลองอีกครั้ง" };
  }
}
