"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import {
  createAdminRestaurantCategory,
  deleteUnusedAdminRestaurantCategory,
  setAdminRestaurantCategoryActive,
  updateAdminRestaurantCategory,
} from "@/lib/repositories/admin-restaurant-category.repository";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import { restaurantCategoryMutationSchema } from "@/lib/validation/restaurant-category";

export type RestaurantCategoryActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function categoryFormValues(formData: FormData) {
  return {
    slug: formData.get("slug"),
    nameTh: formData.get("nameTh"),
    nameEn: formData.get("nameEn"),
    sectionKey: formData.get("sectionKey"),
    displayOrder: formData.get("displayOrder"),
    isFeatured: formData.get("isFeatured"),
    isActive: formData.get("isActive"),
  };
}

function actionError(error: unknown): RestaurantCategoryActionState {
  if (error instanceof AdminAuthError) return { success: false, error: error.message };
  const code = error instanceof Error ? error.message : "";
  if (code === "RESTAURANT_CATEGORY_DUPLICATE_SLUG") {
    return {
      success: false,
      error: "Slug นี้ถูกใช้แล้ว",
      fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ไม่ซ้ำ"] },
    };
  }
  if (code === "RESTAURANT_CATEGORY_IN_USE") {
    return { success: false, error: "หมวดหมู่นี้มีร้านอาหารใช้งานอยู่ กรุณาปิดใช้งานแทนการลบ" };
  }
  if (code === "RESTAURANT_CATEGORY_LAST_ACTIVE") {
    return { success: false, error: "ปิดหมวดนี้ไม่ได้ เพราะมีร้านที่เผยแพร่และไม่มีหมวดอื่นรองรับ กรุณาเพิ่มหมวดให้ร้านก่อน" };
  }
  return { success: false, error: "ยังบันทึกหมวดหมู่ไม่ได้ กรุณาลองอีกครั้ง" };
}

function revalidateRestaurantCategoryPaths() {
  revalidatePath("/admin/restaurants");
  revalidatePath("/admin/restaurants/categories");
  revalidatePath("/restaurants");
}

export async function createRestaurantCategoryAction(
  _previous: RestaurantCategoryActionState,
  formData: FormData,
): Promise<RestaurantCategoryActionState> {
  try {
    const guard = await requirePermission("restaurant.create");
    const parsed = restaurantCategoryMutationSchema.safeParse(categoryFormValues(formData));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลหมวดหมู่อีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const created = await createAdminRestaurantCategory(parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "restaurant_category.create",
      entityType: "restaurant_category",
      entityId: created.categoryId,
      newValues: parsed.data,
    });
    revalidateRestaurantCategoryPaths();
    return { success: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateRestaurantCategoryAction(
  categoryId: number,
  _previous: RestaurantCategoryActionState,
  formData: FormData,
): Promise<RestaurantCategoryActionState> {
  try {
    const guard = await requirePermission("restaurant.update");
    const parsed = restaurantCategoryMutationSchema.safeParse(categoryFormValues(formData));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลหมวดหมู่อีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    await updateAdminRestaurantCategory(categoryId, parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "restaurant_category.update",
      entityType: "restaurant_category",
      entityId: categoryId,
      newValues: parsed.data,
    });
    revalidateRestaurantCategoryPaths();
    return { success: true, fieldErrors: undefined };
  } catch (error) {
    return actionError(error);
  }
}

export async function setRestaurantCategoryActiveAction(
  categoryId: number,
  isActive: boolean,
): Promise<RestaurantCategoryActionState> {
  try {
    const guard = await requirePermission("restaurant.update");
    await setAdminRestaurantCategoryActive(categoryId, isActive);
    await logAdminMutation({
      actor: guard.actor,
      action: isActive ? "restaurant_category.activate" : "restaurant_category.archive",
      entityType: "restaurant_category",
      entityId: categoryId,
      newValues: { isActive },
    });
    revalidateRestaurantCategoryPaths();
    return { success: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteRestaurantCategoryAction(
  categoryId: number,
): Promise<RestaurantCategoryActionState> {
  try {
    const guard = await requirePermission("restaurant.delete");
    await deleteUnusedAdminRestaurantCategory(categoryId);
    await logAdminMutation({
      actor: guard.actor,
      action: "restaurant_category.delete",
      entityType: "restaurant_category",
      entityId: categoryId,
    });
    revalidateRestaurantCategoryPaths();
    return { success: true };
  } catch (error) {
    return actionError(error);
  }
}
