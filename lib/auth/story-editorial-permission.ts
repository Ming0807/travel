import type { PermissionKey } from "@/lib/auth/guards";
import { getAllowedStoryTransitions, type StoryAuthorType, type StoryStatus } from "@/lib/content/story-workflow";

export function getVisibleStoryTransitions(authorType: StoryAuthorType, status: StoryStatus, permissions: readonly string[]): StoryStatus[] {
  const can = (permission: string) => permissions.includes("system.all") || permissions.includes(permission);
  return getAllowedStoryTransitions(authorType, status).filter((target) => {
    if (!can(requiredStoryEditorialPermission(authorType, status, target))) return false;
    // Review is an optional handoff for team members who cannot publish themselves.
    if (authorType === "admin" && (target === "in_review" || target === "approved") && can("story.publish")) return false;
    return true;
  });
}

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
