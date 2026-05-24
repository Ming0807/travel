"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import { adminRestaurantMutationSchema } from "@/lib/validation/admin-restaurant";
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
};

export async function createRestaurantAction(formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("restaurant.create");
    const parsed = adminRestaurantMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findRestaurantBySlug(parsed.data.slug);
    if (existingSlug !== null) {
      return { success: false, error: "Slug already exists.", fieldErrors: { slug: ["This slug is already in use."] } };
    }

    const created = await createAdminRestaurant(parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "restaurant.create",
      entityType: "restaurant",
      entityId: created.restaurant_id,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/restaurants");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to create restaurant." };
  }
}

export async function updateRestaurantAction(restaurantId: number, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("restaurant.update");
    const parsed = adminRestaurantMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findRestaurantBySlug(parsed.data.slug, restaurantId);
    if (existingSlug !== null) {
      return { success: false, error: "Slug already exists.", fieldErrors: { slug: ["This slug is already in use."] } };
    }

    const old = await getAdminRestaurantById(restaurantId);
    if (!old) return { success: false, error: "Restaurant not found." };

    const updated = await updateAdminRestaurant(restaurantId, parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "restaurant.update",
      entityType: "restaurant",
      entityId: updated.restaurant_id,
      oldValues: old as unknown as Record<string, unknown>,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/restaurants");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to update restaurant." };
  }
}

export async function toggleRestaurantPublishAction(restaurantId: number): Promise<ActionResult> {
  try {
    const current = await getAdminRestaurantById(restaurantId);
    if (!current) return { success: false, error: "Restaurant not found." };

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
    return { success: false, error: "Failed to toggle publish status." };
  }
}

export async function toggleRestaurantActiveAction(restaurantId: number): Promise<ActionResult> {
  try {
    const current = await getAdminRestaurantById(restaurantId);
    if (!current) return { success: false, error: "Restaurant not found." };

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
    return { success: false, error: "Failed to toggle active status." };
  }
}
