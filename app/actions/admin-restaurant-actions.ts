"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import {
  adminRestaurantMutationSchema,
  restaurantMutationFormValues,
} from "@/lib/validation/admin-restaurant";
import { clearCoverMediaForEntity, linkMediaToEntity, linkMediaToEntityByStoragePath } from "@/lib/repositories/admin-media.repository";
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
  return { success: false, error: fallback };
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
