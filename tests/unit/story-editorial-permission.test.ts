import { describe, expect, it } from "vitest";
import { getVisibleStoryTransitions, requiredStoryEditorialPermission } from "@/lib/auth/story-editorial-permission";

describe("story editorial permission policy", () => {
  it("shows publishing instead of review handoff to publishers", () => {
    expect(getVisibleStoryTransitions("admin", "draft", ["story.update", "story.publish"])).toEqual(["published", "archived"]);
    expect(getVisibleStoryTransitions("admin", "draft", ["story.update"])).toEqual(["in_review", "archived"]);
    expect(getVisibleStoryTransitions("tourist", "in_review", ["story.update"])).toEqual([]);
  });
  it("keeps ordinary editorial saves under story.update", () => {
    expect(requiredStoryEditorialPermission("admin", "draft", "draft")).toBe("story.update");
    expect(requiredStoryEditorialPermission("admin", "draft", "in_review")).toBe("story.update");
  });

  it("requires dedicated permissions for review, scheduling, and publication", () => {
    expect(requiredStoryEditorialPermission("tourist", "submitted", "in_review")).toBe("story.review");
    expect(requiredStoryEditorialPermission("tourist", "in_review", "rejected")).toBe("story.review");
    expect(requiredStoryEditorialPermission("admin", "approved", "scheduled")).toBe("story.schedule");
    expect(requiredStoryEditorialPermission("admin", "approved", "published")).toBe("story.publish");
    expect(requiredStoryEditorialPermission("admin", "published", "draft")).toBe("story.unpublish");
  });
});
