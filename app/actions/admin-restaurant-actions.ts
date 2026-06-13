"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import { adminRestaurantMutationSchema } from "@/lib/validation/admin-restaurant";
import { clearCoverMediaForEntity, linkMediaToEntity, linkMediaToEntityByStoragePath } from "@/lib/repositories/admin-media.repository";
import {
  createAdminRestaurant,
  updateAdminRestaurant,
  updateAdminRestaurantStatus,
  findRestaurantBySlug,
  getAdminRestaurantById,
} from "@/lib/repositories/admin-restaurant.repository";

type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
};

export async function createRestaurantAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("restaurant.create");
    const parsed = adminRestaurantMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลร้านอาหารอีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findRestaurantBySlug(parsed.data.slug);
    if (existingSlug !== null) {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }

    const created = await createAdminRestaurant(parsed.data);

    // Link cover media if provided
    const coverMediaId = parsed.data.coverMediaId ? Number(parsed.data.coverMediaId) : null;
    if (coverMediaId && Number.isFinite(coverMediaId)) {
      await linkMediaToEntity(coverMediaId, "restaurant", created.restaurant_id);
    }

    await logAdminMutation({
      actor: guard.actor,
      action: "restaurant.create",
      entityType: "restaurant",
      entityId: created.restaurant_id,
      newValues: { ...parsed.data, coverMediaId: undefined } as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/restaurants");
    return { success: true, data: { id: created.restaurant_id } };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังสร้างร้านอาหารไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function updateRestaurantAction(restaurantId: number, _prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("restaurant.update");
    const parsed = adminRestaurantMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลร้านอาหารอีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findRestaurantBySlug(parsed.data.slug, restaurantId);
    if (existingSlug !== null) {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }

    const old = await getAdminRestaurantById(restaurantId);
    if (!old) return { success: false, error: "ไม่พบร้านอาหารนี้ อาจถูกลบหรือย้ายแล้ว" };

    const updated = await updateAdminRestaurant(restaurantId, parsed.data);

    const coverMediaAction = formData.get("coverMediaAction");

    // Link or clear cover media only when the cover editor explicitly asks for it.
    const coverStoragePath = formData.get("coverStoragePath");
    const coverMediaId = parsed.data.coverMediaId ? Number(parsed.data.coverMediaId) : null;
    if (coverMediaAction === "clear") {
      await clearCoverMediaForEntity("restaurant", updated.restaurant_id);
    } else if (coverMediaAction === "set" && typeof coverStoragePath === "string" && coverStoragePath.trim() !== "") {
      await linkMediaToEntityByStoragePath(coverStoragePath.trim(), "restaurant", updated.restaurant_id);
    } else if (coverMediaId && Number.isFinite(coverMediaId)) {
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

    revalidatePath("/admin/restaurants");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังบันทึกการแก้ไขร้านอาหารไม่ได้ กรุณาลองอีกครั้ง" };
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

    revalidatePath("/admin/restaurants");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังเปลี่ยนสถานะเผยแพร่ไม่ได้ กรุณาลองอีกครั้ง" };
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

    revalidatePath("/admin/restaurants");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังเปลี่ยนสถานะใช้งานไม่ได้ กรุณาลองอีกครั้ง" };
  }
}
