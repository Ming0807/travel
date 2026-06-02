"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import { adminStoryMutationSchema } from "@/lib/validation/story";
import { linkMediaToEntity } from "@/lib/repositories/admin-media.repository";
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

export async function createStoryAction(_prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("story.create");
    const parsed = adminStoryMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลเรื่องราวอีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findStoryBySlug(parsed.data.slug);
    if (existingSlug !== null) {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }

    const created = await createAdminStory(parsed.data);

    // Link cover media if provided
    const coverMediaId = parsed.data.coverMediaId ? Number(parsed.data.coverMediaId) : null;
    if (coverMediaId && Number.isFinite(coverMediaId)) {
      await linkMediaToEntity(coverMediaId, "story", created.story_id);
    }

    await logAdminMutation({
      actor: guard.actor,
      action: "story.create",
      entityType: "travel_story",
      entityId: created.story_id,
      newValues: { ...parsed.data, coverMediaId: undefined } as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/stories");
    return { success: true, data: { id: created.story_id, slug: created.slug } };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังสร้างเรื่องราวไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function updateStoryAction(storyId: number, _prevState: ActionResult, formData: FormData): Promise<ActionResult> {
  try {
    const guard = await requirePermission("story.update");
    const parsed = adminStoryMutationSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { success: false, error: "กรุณาตรวจข้อมูลเรื่องราวอีกครั้ง", fieldErrors: parsed.error.flatten().fieldErrors };
    }

    const existingSlug = await findStoryBySlug(parsed.data.slug, storyId);
    if (existingSlug !== null) {
      return { success: false, error: "Slug นี้ถูกใช้งานแล้ว", fieldErrors: { slug: ["กรุณาใช้ slug อื่นที่ยังไม่ซ้ำ"] } };
    }

    const old = await getAdminStoryById(storyId);
    if (!old) return { success: false, error: "ไม่พบเรื่องราวนี้ อาจถูกลบหรือย้ายแล้ว" };

    const payload = { ...parsed.data };
    if (payload.status) {
      payload.isPublished = payload.status === 'published';
    }

    const updated = await updateAdminStory(storyId, payload);

    // Link cover media if provided
    const coverMediaId = parsed.data.coverMediaId ? Number(parsed.data.coverMediaId) : null;
    if (coverMediaId && Number.isFinite(coverMediaId)) {
      await linkMediaToEntity(coverMediaId, "story", updated.story_id);
    }

    await logAdminMutation({
      actor: guard.actor,
      action: "story.update",
      entityType: "travel_story",
      entityId: updated.story_id,
      oldValues: old as unknown as Record<string, unknown>,
      newValues: { ...parsed.data, coverMediaId: undefined } as unknown as Record<string, unknown>,
    });

    revalidatePath("/admin/stories");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังบันทึกการแก้ไขเรื่องราวไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function changeStoryStatusAction(storyId: number, newStatus: string): Promise<ActionResult> {
  try {
    const current = await getAdminStoryById(storyId);
    if (!current) return { success: false, error: "ไม่พบเรื่องราวนี้ อาจถูกลบหรือย้ายแล้ว" };

    const actionName = newStatus === 'published' ? 'story.publish' : 'story.unpublish';
    const guard = await requirePermission(actionName as "story.publish" | "story.unpublish");

    const updated = await updateAdminStoryStatus(storyId, { status: newStatus, is_published: newStatus === 'published' });
    await logAdminMutation({
      actor: guard.actor,
      action: actionName as "story.publish" | "story.unpublish",
      entityType: "travel_story",
      entityId: storyId,
      oldValues: { status: current.status },
      newValues: { status: updated.status },
    });

    revalidatePath("/admin/stories");
    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    return { success: false, error: "ยังเปลี่ยนสถานะไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

