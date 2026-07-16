"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { requiredStoryEditorialPermission } from "@/lib/auth/story-editorial-permission";
import { logAdminMutation } from "@/lib/services/audit-log.service";
import { applyStoryEditorialChange, StoryEditorialServiceError } from "@/lib/services/story-editorial.service";
import { adminStoryMutationSchema, storyEditorialChangeInputSchema } from "@/lib/validation/story";
import { clearCoverMediaForEntity, linkMediaToEntity, linkMediaToEntityByStoragePath } from "@/lib/repositories/admin-media.repository";
import {
  createAdminStory,
  updateAdminStory,
  updateAdminStoryStatus,
  findStoryBySlug,
  getAdminStoryById,
  toStoryEditorialState,
} from "@/lib/repositories/admin-story.repository";
import { storyEditorialChangeStore } from "@/lib/repositories/story-revision.repository";

type ActionResult<TData = unknown> = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  data?: TData;
};

function editorialErrorMessage(error: StoryEditorialServiceError): string {
  switch (error.code) {
    case "EDIT_CONFLICT":
      return "มีผู้แก้ไขเนื้อหานี้หลังจากที่คุณเปิดหน้า กรุณาโหลดข้อมูลล่าสุดแล้วตรวจสอบอีกครั้ง";
    case "STORY_NOT_FOUND":
      return "ไม่พบเรื่องราวนี้ อาจถูกลบหรือย้ายแล้ว";
    case "INVALID_DOCUMENT":
      return "รูปแบบเนื้อหาไม่ถูกต้อง กรุณาตรวจสอบเนื้อหาแล้วลองอีกครั้ง";
    case "NOT_READY_FOR_REVIEW":
    case "NOT_READY_FOR_PUBLISH":
      return "เนื้อหายังไม่พร้อมสำหรับขั้นตอนนี้ กรุณาตรวจสอบรายการความพร้อม";
    case "REVIEW_NOTE_REQUIRED":
      return "กรุณาระบุเหตุผลประกอบการพิจารณา";
    case "SCHEDULE_REQUIRED":
    case "SCHEDULE_MUST_BE_FUTURE":
      return "กรุณาเลือกวันและเวลาเผยแพร่ในอนาคต";
    case "INVALID_TRANSITION":
    case "NO_CHANGE":
      return "ไม่สามารถเปลี่ยนเป็นสถานะที่เลือกจากสถานะปัจจุบันได้";
    default:
      return "ยังบันทึกการแก้ไขไม่ได้ กรุณาลองอีกครั้ง";
  }
}

export async function saveStoryEditorialChangeAction(
  input: unknown
): Promise<ActionResult<{ updatedAt: string; revisionNumber: number }>> {
  const parsed = storyEditorialChangeInputSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "ข้อมูลการแก้ไขไม่ถูกต้อง" };

  try {
    await requirePermission("story.read");
    const story = await getAdminStoryById(parsed.data.storyId);
    if (!story) return { success: false, error: "ไม่พบเรื่องราวนี้ อาจถูกลบหรือย้ายแล้ว" };

    const persistedState = toStoryEditorialState(story);
    const targetStatus = parsed.data.change.targetStatus ?? persistedState.status;
    const permission = requiredStoryEditorialPermission(
      persistedState.authorType,
      persistedState.status,
      targetStatus
    );
    const guard = await requirePermission(permission);
    const result = await applyStoryEditorialChange({
      actorId: guard.actor.adminId,
      current: { ...persistedState, updatedAt: parsed.data.expectedUpdatedAt },
      change: parsed.data.change,
      store: storyEditorialChangeStore,
    });

    await logAdminMutation({
      actor: guard.actor,
      action: "story.editorial.save",
      entityType: "travel_story",
      entityId: parsed.data.storyId,
      oldValues: { status: persistedState.status, updatedAt: persistedState.updatedAt },
      newValues: {
        status: targetStatus,
        revisionNumber: result.revisionNumber,
        changedFields: Object.keys(parsed.data.change),
      },
    });

    revalidatePath("/admin/stories");
    revalidatePath(`/admin/stories/${parsed.data.storyId}/edit`);
    revalidatePath(`/stories/${story.slug}`);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof AdminAuthError) return { success: false, error: error.message };
    if (error instanceof StoryEditorialServiceError) {
      return { success: false, error: editorialErrorMessage(error) };
    }
    return { success: false, error: "ยังบันทึกการแก้ไขไม่ได้ กรุณาลองอีกครั้ง" };
  }
}

export async function createStoryAction(_prevState: ActionResult<{ id: number; slug: string }>, formData: FormData): Promise<ActionResult<{ id: number; slug: string }>> {
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

export async function updateStoryAction(storyId: number, _prevState: ActionResult<{ id: number; slug: string }>, formData: FormData): Promise<ActionResult<{ id: number; slug: string }>> {
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

    const coverMediaAction = formData.get("coverMediaAction");

    // Link or clear cover media only when the cover editor explicitly asks for it.
    const coverStoragePath = formData.get("coverStoragePath");
    const coverMediaId = parsed.data.coverMediaId ? Number(parsed.data.coverMediaId) : null;
    if (coverMediaAction === "clear") {
      await clearCoverMediaForEntity("story", updated.story_id);
    } else if (coverMediaAction === "set" && typeof coverStoragePath === "string" && coverStoragePath.trim() !== "") {
      await linkMediaToEntityByStoragePath(coverStoragePath.trim(), "story", updated.story_id);
    } else if (coverMediaId && Number.isFinite(coverMediaId)) {
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
