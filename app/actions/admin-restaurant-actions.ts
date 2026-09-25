"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import {
  adminRestaurantMutationSchema,
  restaurantMutationFormValues,
} from "@/lib/validation/admin-restaurant";
import { clearCoverMediaForEntity, getAdminMediaById, linkMediaToEntity } from "@/lib/repositories/admin-media.repository";
import {
  createAdminRestaurant,
  updateAdminRestaurant,
  updateAdminRestaurantStatus,
  findRestaurantBySlug,
  getAdminRestaurantById,
} from "@/lib/repositories/admin-restaurant.repository";

type ActionResult<TData = unknown> = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: TData;
};

function restaurantMutationError<TData = unknown>(error: unknown, fallback: string): ActionResult<TData> {
  if (error instanceof AdminAuthError) return { success: false, error: error.message };
  const code = error instanceof Error ? error.message : "";
  if (code === "RESTAURANT_CATEGORY_REQUIRED") {
    return {
      success: false,
      error: "ร้านที่เผยแพร่ต้องมีอย่างน้อย 1 หมวดหมู่",
      fieldErrors: { categoryIds: ["เลือกหมวดหมู่อย่างน้อย 1 หมวดก่อนเผยแพร่"] },
    };
  }
  if (code === "RESTAURANT_CATEGORY_INVALID") {
    return {
      success: false,
      error: "มีหมวดหมู่ที่ปิดใช้งานหรือไม่มีอยู่ในระบบ",
      fieldErrors: { categoryIds: ["กรุณาเลือกหมวดหมู่ที่เปิดใช้งาน"] },
    };
  }
  if (code === "RESTAURANT_ATTRACTION_LIMIT_EXCEEDED") {
    return {
      success: false,
      error: "เลือกสถานที่ท่องเที่ยวใกล้เคียงได้สูงสุด 12 แห่ง",
      fieldErrors: { nearbyAttractionIds: ["กรุณาลดจำนวนสถานที่ให้เหลือไม่เกิน 12 แห่ง"] },
    };
  }
  if (code === "RESTAURANT_ATTRACTION_INVALID") {
    return {
      success: false,
      error: "มีสถานที่ท่องเที่ยวที่ถูกเก็บถาวรหรือไม่มีอยู่ในระบบ",
      fieldErrors: { nearbyAttractionIds: ["กรุณาเลือกเฉพาะสถานที่ที่กำลังใช้งาน"] },
    };
  }
  if (code === "RESTAURANT_COVER_MEDIA_INVALID") {
    return {
      success: false,
      error: "กรุณาเลือกรูปภาพปกจากคลังสื่ออีกครั้ง",
      fieldErrors: { coverMediaId: ["รูปภาพไม่พร้อมใช้งานหรือข้อมูลไฟล์ไม่ตรงกัน"] },
    };
  }
  return { success: false, error: fallback };
}

async function validateRestaurantCoverMedia(formData: FormData, mediaId: number | null) {
  const storagePath = formData.get("coverStoragePath");
  const hasStoragePath = typeof storagePath === "string" && storagePath.trim() !== "";

  if (mediaId === null) {
    if (hasStoragePath) throw new Error("RESTAURANT_COVER_MEDIA_INVALID");
    return null;
  }

  const media = await getAdminMediaById(mediaId);
  if (
    !media ||
    media.media_type !== "image" ||
    !media.is_active ||
    media.lifecycle_status === "archived" ||
    (hasStoragePath && media.storage_path !== storagePath.trim())
  ) {
    throw new Error("RESTAURANT_COVER_MEDIA_INVALID");
  }

  return media.media_id;
}

function revalidateRestaurantPaths(restaurantId?: number) {
  revalidatePath("/admin/restaurants");
  revalidatePath("/restaurants");
  if (restaurantId) revalidatePath(`/admin/restaurants/${restaurantId}/edit`);
}

export async function createRestaurantAction(_prevState: ActionResult<{ id: number }>, formData: FormData): Promise<ActionResult<{ id: number }>> {
  try {
    const guard = await requirePermission("restaurant.create");
    const parsed = adminRestaurantMutationSchema.safeParse(restaurantMutationFormValues(formData));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลร้านอาหารอีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findRestaurantBySlug(parsed.data.slug);
    if (existingSlug !== null) {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }

    const coverMediaId = await validateRestaurantCoverMedia(
      formData,
      parsed.data.coverMediaId,
    );

    const syncNearbyAttractions = formData.get("syncNearbyAttractions") === "true";
    const created = await createAdminRestaurant(parsed.data, { syncNearbyAttractions });

    if (coverMediaId !== null) {
      await linkMediaToEntity(coverMediaId, "restaurant", created.restaurant_id);
    }

    await logAdminMutation({
      actor: guard.actor,
      action: "restaurant.create",
      entityType: "restaurant",
      entityId: created.restaurant_id,
      newValues: { ...parsed.data, coverMediaId: undefined } as unknown as Record<string, unknown>,
    });

    revalidateRestaurantPaths(created.restaurant_id);
    return { success: true, data: { id: created.restaurant_id } };
  } catch (error) {
    return restaurantMutationError<{ id: number }>(error, "ยังสร้างร้านอาหารไม่ได้ กรุณาลองอีกครั้ง");
  }
}

export async function updateRestaurantAction(restaurantId: number, _prevState: ActionResult<{ id: number }>, formData: FormData): Promise<ActionResult<{ id: number }>> {
  try {
    const guard = await requirePermission("restaurant.update");
    const parsed = adminRestaurantMutationSchema.safeParse(restaurantMutationFormValues(formData));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลร้านอาหารอีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findRestaurantBySlug(parsed.data.slug, restaurantId);
    if (existingSlug !== null) {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }

    const old = await getAdminRestaurantById(restaurantId);
    if (!old) return { success: false, error: "ไม่พบร้านอาหารนี้ อาจถูกลบหรือย้ายแล้ว" };

    const coverMediaAction = formData.get("coverMediaAction");
    const shouldSetCover = coverMediaAction === "set" || coverMediaAction === null || coverMediaAction === "";
    const coverMediaId = shouldSetCover && parsed.data.coverMediaId !== null
      ? await validateRestaurantCoverMedia(formData, parsed.data.coverMediaId)
      : null;
    if (coverMediaAction === "set" && coverMediaId === null) {
      throw new Error("RESTAURANT_COVER_MEDIA_INVALID");
    }

    const syncNearbyAttractions = formData.get("syncNearbyAttractions") === "true";
    const updated = await updateAdminRestaurant(restaurantId, parsed.data, { syncNearbyAttractions });

    if (coverMediaAction === "clear") {
      await clearCoverMediaForEntity("restaurant", updated.restaurant_id);
    } else if (coverMediaAction === "set" && coverMediaId !== null) {
      await linkMediaToEntity(coverMediaId, "restaurant", updated.restaurant_id);
    } else if ((coverMediaAction === null || coverMediaAction === "") && coverMediaId !== null) {
      await linkMediaToEntity(coverMediaId, "restaurant", updated.restaurant_id);
    }

    await logAdminMutation({
      actor: guard.actor,
      action: "restaurant.update",
      entityType: "restaurant",
      entityId: updated.restaurant_id,
      oldValues: old as unknown as Record<string, unknown>,
      newValues: { ...parsed.data, coverMediaId: undefined } as unknown as Record<string, unknown>,
    });

    revalidateRestaurantPaths(restaurantId);
    return { success: true };
  } catch (error) {
    return restaurantMutationError<{ id: number }>(error, "ยังบันทึกการแก้ไขร้านอาหารไม่ได้ กรุณาลองอีกครั้ง");
  }
}

export async function toggleRestaurantPublishAction(restaurantId: number): Promise<ActionResult> {
  try {
    const current = await getAdminRestaurantById(restaurantId);
    if (!current) return { success: false, error: "ไม่พบร้านอาหารนี้ อาจถูกลบหรือย้ายแล้ว" };

    const guard = await requirePermission(current.is_published ? "restaurant.unpublish" : "restaurant.publish");

    const updated = await updateAdminRestaurantStatus(restaurantId, { is_published: !current.is_published });
    await logAdminMutation({
      actor: guard.actor,
      action: current.is_published ? "restaurant.unpublish" : "restaurant.publish",
      entityType: "restaurant",
      entityId: restaurantId,
      oldValues: { is_published: current.is_published },
      newValues: { is_published: updated.is_published },
    });

    revalidateRestaurantPaths(restaurantId);
    return { success: true };
  } catch (error) {
    return restaurantMutationError(error, "ยังเปลี่ยนสถานะเผยแพร่ไม่ได้ กรุณาลองอีกครั้ง");
  }
}

export async function toggleRestaurantActiveAction(restaurantId: number): Promise<ActionResult> {
  try {
    const current = await getAdminRestaurantById(restaurantId);
    if (!current) return { success: false, error: "ไม่พบร้านอาหารนี้ อาจถูกลบหรือย้ายแล้ว" };

    const guard = await requirePermission(current.is_active ? "restaurant.deactivate" : "restaurant.activate");

    const updated = await updateAdminRestaurantStatus(restaurantId, { is_active: !current.is_active });
    await logAdminMutation({
      actor: guard.actor,
      action: current.is_active ? "restaurant.deactivate" : "restaurant.activate",
      entityType: "restaurant",
      entityId: restaurantId,
      oldValues: { is_active: current.is_active },
      newValues: { is_active: updated.is_active },
    });

    revalidateRestaurantPaths(restaurantId);
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังเปลี่ยนสถานะใช้งานไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function archiveRestaurantAction(restaurantId: number): Promise<ActionResult> {
  try {
    const guard = await requirePermission("restaurant.delete");
    const current = await getAdminRestaurantById(restaurantId);
    if (!current) return { success: false, error: "ไม่พบร้านอาหารนี้ อาจถูกลบหรือย้ายแล้ว" };

    await updateAdminRestaurantStatus(restaurantId, {
      is_active: false,
      is_published: false,
    });
    await logAdminMutation({
      actor: guard.actor,
      action: "restaurant.archive",
      entityType: "restaurant",
      entityId: restaurantId,
      oldValues: {
        is_active: current.is_active,
        is_published: current.is_published,
      },
      newValues: { is_active: false, is_published: false },
    });

    revalidateRestaurantPaths(restaurantId);
    return { success: true };
  } catch (error) {
    return restaurantMutationError(error, "ยังลบร้านอาหารออกจากระบบไม่ได้ กรุณาลองอีกครั้ง");
  }
}
