"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import { adminStoryMutationSchema } from "@/lib/validation/story";
import {
  createAdminStory,
  updateAdminStory,
  updateAdminStoryStatus,
  findStoryBySlug,
  getAdminStoryById,
} from "@/lib/repositories/admin-story.repository";

type ActionResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
};

export async function createStoryAction(formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("story.create");
    const parsed = adminStoryMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findStoryBySlug(parsed.data.slug);
    if (existingSlug !== null) {
      return { success: false, error: "Slug already exists.", fieldErrors: { slug: ["This slug is already in use."] } };
    }

    const created = await createAdminStory(parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "story.create",
      entityType: "travel_story",
      entityId: created.story_id,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/stories");
    return { success: true, data: { id: created.story_id } };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to create story." };
  }
}

export async function updateStoryAction(storyId: number, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("story.update");
    const parsed = adminStoryMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "Validation failed.", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findStoryBySlug(parsed.data.slug, storyId);
    if (existingSlug !== null) {
      return { success: false, error: "Slug already exists.", fieldErrors: { slug: ["This slug is already in use."] } };
    }

    const old = await getAdminStoryById(storyId);
    if (!old) return { success: false, error: "Story not found." };

    const updated = await updateAdminStory(storyId, parsed.data);
    await logAdminMutation({
      actor: guard.actor,
      action: "story.update",
      entityType: "travel_story",
      entityId: updated.story_id,
      oldValues: old as unknown as Record<string, unknown>,
      newValues: parsed.data as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/stories");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to update story." };
  }
}

export async function toggleStoryPublishAction(storyId: number): Promise<ActionResult> {
  try {
    const current = await getAdminStoryById(storyId);
    if (!current) return { success: false, error: "Story not found." };

    const guard = await requirePermission(current.is_published ? "story.unpublish" : "story.publish");

    const updated = await updateAdminStoryStatus(storyId, { is_published: !current.is_published });
    await logAdminMutation({
      actor: guard.actor,
      action: current.is_published ? "story.unpublish" : "story.publish",
      entityType: "travel_story",
      entityId: storyId,
      oldValues: { is_published: current.is_published },
      newValues: { is_published: updated.is_published },
    });

    revalidatePath("/admin/stories");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "Failed to toggle publish status." };
  }
}
