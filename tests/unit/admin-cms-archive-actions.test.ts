import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  logAdminMutation: vi.fn(),
  revalidatePath: vi.fn(),
  getAttraction: vi.fn(),
  updateAttractionStatus: vi.fn(),
  getRestaurant: vi.fn(),
  updateRestaurantStatus: vi.fn(),
  getAccommodation: vi.fn(),
  updateAccommodationStatus: vi.fn(),
  getRoute: vi.fn(),
  updateRouteStatus: vi.fn(),
  getStory: vi.fn(),
  updateStoryStatus: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/guards", () => ({
  AdminAuthError: class AdminAuthError extends Error {},
  requirePermission: mocks.requirePermission,
}));
vi.mock("@/lib/services/audit-log.service", () => ({
  logAdminMutation: mocks.logAdminMutation,
}));
vi.mock("@/lib/repositories/attraction-category.repository", () => ({
  syncAttractionTypeAssignments: vi.fn(),
}));
vi.mock("@/lib/repositories/admin-media.repository", () => ({
  clearCoverMediaForEntity: vi.fn(),
  linkMediaToEntity: vi.fn(),
  linkMediaToEntityByStoragePath: vi.fn(),
}));
vi.mock("@/lib/repositories/story-revision.repository", () => ({
  storyEditorialChangeStore: { applyChange: vi.fn() },
}));
vi.mock("@/lib/repositories/story-recommendation.repository", () => ({
  listAdminStoryRecommendations: vi.fn(),
  replaceStoryRecommendations: vi.fn(),
  searchStoryRecommendationCandidates: vi.fn(),
}));

vi.mock("@/lib/repositories/admin-attraction.repository", () => ({
  createAdminAttraction: vi.fn(),
  updateAdminAttraction: vi.fn(),
  updateAdminAttractionSection: vi.fn(),
  updateAdminAttractionStatus: mocks.updateAttractionStatus,
  findAttractionBySlug: vi.fn(),
  getAdminAttractionById: mocks.getAttraction,
  updateAdminAttractionField: vi.fn(),
  getInlineFieldColumn: vi.fn(),
  updateAdminAttractionRelatedContentV2: vi.fn(),
  searchAdminAttractionRelatedContent: vi.fn(),
}));
vi.mock("@/lib/repositories/admin-restaurant.repository", () => ({
  createAdminRestaurant: vi.fn(),
  updateAdminRestaurant: vi.fn(),
  updateAdminRestaurantStatus: mocks.updateRestaurantStatus,
  findRestaurantBySlug: vi.fn(),
  getAdminRestaurantById: mocks.getRestaurant,
}));
vi.mock("@/lib/repositories/admin-accommodation.repository", () => ({
  createAdminAccommodation: vi.fn(),
  updateAdminAccommodation: vi.fn(),
  updateAdminAccommodationStatus: mocks.updateAccommodationStatus,
  findAccommodationBySlug: vi.fn(),
  getAdminAccommodationById: mocks.getAccommodation,
}));
vi.mock("@/lib/repositories/admin-route.repository", () => ({
  createAdminRoute: vi.fn(),
  updateAdminRoute: vi.fn(),
  updateAdminRouteStatus: mocks.updateRouteStatus,
  getAdminRouteById: mocks.getRoute,
  updateRouteStopsBatch: vi.fn(),
  findRouteBySlug: vi.fn(),
}));
vi.mock("@/lib/repositories/admin-story.repository", () => ({
  createAdminStory: vi.fn(),
  updateAdminStory: vi.fn(),
  updateAdminStoryStatus: mocks.updateStoryStatus,
  findStoryBySlug: vi.fn(),
  getAdminStoryById: mocks.getStory,
  toStoryEditorialState: vi.fn(),
}));

import { archiveAttractionAction } from "@/app/actions/admin-attraction-actions";
import { archiveRestaurantAction } from "@/app/actions/admin-restaurant-actions";
import { archiveAccommodationAction } from "@/app/actions/admin-accommodation-actions";
import { archiveRouteAction } from "@/app/actions/admin-route-actions";
import { archiveStoryAction } from "@/app/actions/admin-story-actions";

describe("safe CMS archive actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue({ actor: { adminId: "admin-test" } });
    mocks.logAdminMutation.mockResolvedValue(undefined);
  });

  it.each([
    {
      label: "attraction",
      action: archiveAttractionAction,
      getCurrent: mocks.getAttraction,
      updateStatus: mocks.updateAttractionStatus,
      permission: "attraction.delete",
      current: { attraction_id: 12, slug: "pilot-attraction", is_active: true, is_published: true },
      patch: { is_active: false, is_published: false },
      entityType: "attraction",
    },
    {
      label: "restaurant",
      action: archiveRestaurantAction,
      getCurrent: mocks.getRestaurant,
      updateStatus: mocks.updateRestaurantStatus,
      permission: "restaurant.delete",
      current: { restaurant_id: 12, slug: "pilot-restaurant", is_active: true, is_published: true },
      patch: { is_active: false, is_published: false },
      entityType: "restaurant",
    },
    {
      label: "accommodation",
      action: archiveAccommodationAction,
      getCurrent: mocks.getAccommodation,
      updateStatus: mocks.updateAccommodationStatus,
      permission: "attraction.delete",
      current: { accommodation_id: 12, slug: "pilot-stay", is_active: true, is_published: true },
      patch: { is_active: false, is_published: false },
      entityType: "accommodation",
    },
    {
      label: "route",
      action: archiveRouteAction,
      getCurrent: mocks.getRoute,
      updateStatus: mocks.updateRouteStatus,
      permission: "route.delete",
      current: { route_id: 12, slug: "pilot-route", is_active: true, is_published: true },
      patch: { is_active: false, is_published: false },
      entityType: "suggested_route",
    },
    {
      label: "story",
      action: archiveStoryAction,
      getCurrent: mocks.getStory,
      updateStatus: mocks.updateStoryStatus,
      permission: "story.delete",
      current: { story_id: 12, slug: "pilot-story", status: "published", is_published: true },
      patch: { status: "archived", is_published: false },
      entityType: "travel_story",
    },
  ])("archives $label without physically deleting its record", async ({
    action,
    getCurrent,
    updateStatus,
    permission,
    current,
    patch,
    entityType,
  }) => {
    getCurrent.mockResolvedValue(current);
    updateStatus.mockResolvedValue({ ...current, ...patch });

    await expect(action(12)).resolves.toEqual({ success: true });

    expect(mocks.requirePermission).toHaveBeenCalledWith(permission);
    expect(updateStatus).toHaveBeenCalledWith(12, patch);
    expect(mocks.logAdminMutation).toHaveBeenCalledWith(expect.objectContaining({
      action: `${entityType}.archive`,
      entityType,
      entityId: 12,
      oldValues: expect.objectContaining({ is_published: true }),
      newValues: patch,
    }));
  });

  it("does not mutate when the attraction no longer exists", async () => {
    mocks.getAttraction.mockResolvedValue(null);

    await expect(archiveAttractionAction(404)).resolves.toEqual({
      success: false,
      error: "ไม่พบสถานที่นี้ อาจถูกลบหรือย้ายแล้ว",
    });

    expect(mocks.updateAttractionStatus).not.toHaveBeenCalled();
    expect(mocks.logAdminMutation).not.toHaveBeenCalled();
  });
});
