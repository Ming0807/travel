import type { PermissionKey } from "@/lib/auth/guards";
import type { StoryAuthorType, StoryStatus } from "@/lib/content/story-workflow";

export function requiredStoryEditorialPermission(
  authorType: StoryAuthorType,
  currentStatus: StoryStatus,
  targetStatus: StoryStatus
): PermissionKey {
  if (currentStatus === "published" && targetStatus === "draft") return "story.unpublish";
  if (targetStatus === "published") return "story.publish";
  if (targetStatus === "scheduled") return "story.schedule";
  if (
    authorType === "tourist" &&
    (targetStatus === "in_review" ||
      targetStatus === "approved" ||
      targetStatus === "changes_requested" ||
      targetStatus === "rejected" ||
      targetStatus === "archived")
  ) {
    return "story.review";
  }
  if (targetStatus === "approved") return "story.review";
  return "story.update";
}
