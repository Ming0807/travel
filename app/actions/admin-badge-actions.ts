"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import { badgeDefinitionSchema } from "@/lib/validation/admin-badge";
import {
  createAdminBadge,
  updateAdminBadge,
  toggleBadgeActive,
  deleteAdminBadge,
} from "@/lib/repositories/admin-badge.repository";

export type ActionResult = { success: true; data?: { id: number } } | { success: false; error: string };

export async function createBadgeAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const guard = await requirePermission("badge.create");

    const parsed = badgeDefinitionSchema.safeParse({
      badgeKey: formData.get("badgeKey"),
      nameTh: formData.get("nameTh"),
      nameEn: formData.get("nameEn"),
      descriptionTh: formData.get("descriptionTh") || undefined,
      descriptionEn: formData.get("descriptionEn") || undefined,
      iconName: formData.get("iconName") || undefined,
      iconColor: formData.get("iconColor") || "#E18868",
      category: formData.get("category"),
      requirementType: formData.get("requirementType"),
      requirementValue: formData.get("requirementValue"),
      requirementExtra: formData.get("requirementExtra") || undefined,
      displayOrder: formData.get("displayOrder") || 0,
      isActive: formData.get("isActive") === "true",
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return { success: false, error: firstIssue?.message || "Invalid form data" };
    }

    const created = await createAdminBadge(parsed.data);

    await logAdminMutation({
      actor: guard,
      action: "badge.create",
      entityType: "badge_definition",
      entityId: String(created.badgeId),
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/badges");
    return { success: true, data: { id: created.badgeId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create badge",
    };
  }
}

export async function updateBadgeAction(
  badgeId: number,
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  try {
    const guard = await requirePermission("badge.update");

    const parsed = badgeDefinitionSchema.safeParse({
      badgeKey: formData.get("badgeKey"),
      nameTh: formData.get("nameTh"),
      nameEn: formData.get("nameEn"),
      descriptionTh: formData.get("descriptionTh") || undefined,
      descriptionEn: formData.get("descriptionEn") || undefined,
      iconName: formData.get("iconName") || undefined,
      iconColor: formData.get("iconColor") || "#E18868",
      category: formData.get("category"),
      requirementType: formData.get("requirementType"),
      requirementValue: formData.get("requirementValue"),
      requirementExtra: formData.get("requirementExtra") || undefined,
      displayOrder: formData.get("displayOrder") || 0,
      isActive: formData.get("isActive") === "true",
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return { success: false, error: firstIssue?.message || "Invalid form data" };
    }

    await updateAdminBadge(badgeId, parsed.data);

    await logAdminMutation({
      actor: guard,
      action: "badge.update",
      entityType: "badge_definition",
      entityId: String(badgeId),
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/badges");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update badge",
    };
  }
}

export async function toggleBadgeActiveAction(formData: FormData): Promise<void> {
  const badgeId = Number(formData.get("badgeId"));
  if (isNaN(badgeId)) return;

  try {
    const guard = await requirePermission("badge.activate");

    const updated = await toggleBadgeActive(badgeId);

    await logAdminMutation({
      actor: guard,
      action: updated.isActive ? "badge.activate" : "badge.deactivate",
      entityType: "badge_definition",
      entityId: String(badgeId),
    });

    revalidatePath("/admin/badges");
  } catch (error) {
    console.error("Failed to toggle badge:", error);
  }
}

export async function deleteBadgeAction(formData: FormData): Promise<void> {
  const badgeId = Number(formData.get("badgeId"));
  if (isNaN(badgeId)) return;

  try {
    const guard = await requirePermission("badge.delete");

    await deleteAdminBadge(badgeId);

    await logAdminMutation({
      actor: guard,
      action: "badge.delete",
      entityType: "badge_definition",
      entityId: String(badgeId),
    });

    revalidatePath("/admin/badges");
  } catch (error) {
    console.error("Failed to delete badge:", error);
  }
}
