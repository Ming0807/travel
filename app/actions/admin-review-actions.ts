"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import { adminReviewFiltersSchema } from "@/lib/validation/admin-review";
import {
  listAdminReviews,
  getAdminReviewById,
  updateReviewModeration,
  softDeleteReview,
  getReviewStatsByAttraction,
  getReviewStatsByRestaurant,
} from "@/lib/repositories/admin-review.repository";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function getAdminReviewsAction(formData: FormData) {
  try {
    await requirePermission("review.read");
    const parsed = adminReviewFiltersSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Invalid filters." };
    }

    const result = await listAdminReviews(parsed.data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ไม่สามารถโหลดรีวิวได้" };
  }
}

export async function approveReviewAction(reviewId: number): Promise<ActionResult> {
  try {
    const guard = await requirePermission("review.approve");
    const current = await getAdminReviewById(reviewId);
    if (!current) return { success: false, error: "Review not found." };

    const updated = await updateReviewModeration(reviewId, guard.actor.adminId, { is_approved: true, is_published: true });
    await logAdminMutation({
      actor: guard.actor,
      action: "review.approve",
      entityType: "review",
      entityId: reviewId,
      oldValues: { is_approved: current.is_approved, is_published: current.is_published },
      newValues: { is_approved: updated.is_approved, is_published: updated.is_published },
    });

    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ไม่สามารถอนุมัติรีวิวได้" };
  }
}

export async function rejectReviewAction(reviewId: number): Promise<ActionResult> {
  try {
    const guard = await requirePermission("review.reject");
    const current = await getAdminReviewById(reviewId);
    if (!current) return { success: false, error: "Review not found." };

    const updated = await updateReviewModeration(reviewId, guard.actor.adminId, { is_approved: false, is_published: false });
    await logAdminMutation({
      actor: guard.actor,
      action: "review.reject",
      entityType: "review",
      entityId: reviewId,
      oldValues: { is_approved: current.is_approved, is_published: current.is_published },
      newValues: { is_approved: updated.is_approved, is_published: updated.is_published },
    });

    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ไม่สามารถปฏิเสธรีวิวได้" };
  }
}

export async function deleteReviewAction(reviewId: number): Promise<ActionResult> {
  try {
    const guard = await requirePermission("review.delete");
    await softDeleteReview(reviewId);
    await logAdminMutation({
      actor: guard.actor,
      action: "review.delete",
      entityType: "review",
      entityId: reviewId,
    });

    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ไม่สามารถลบรีวิวได้" };
  }
}

export async function getReviewStatsByAttractionAction(attractionId: number) {
  try {
    await requirePermission("review.read");
    return await getReviewStatsByAttraction(attractionId);
  } catch {
    return null;
  }
}

export async function getReviewStatsByRestaurantAction(restaurantId: number) {
  try {
    await requirePermission("review.read");
    return await getReviewStatsByRestaurant(restaurantId);
  } catch {
    return null;
  }
}
