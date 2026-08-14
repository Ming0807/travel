import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  logAdminMutation: vi.fn(),
  revalidatePath: vi.fn(),
  createAdminRestaurant: vi.fn(),
  findRestaurantBySlug: vi.fn(),
  linkMediaToEntity: vi.fn(),
  linkMediaToEntityByStoragePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/guards", () => ({
  requirePermission: mocks.requirePermission,
  AdminAuthError: class AdminAuthError extends Error {},
}));
vi.mock("@/lib/services/audit-log.service", () => ({
  logAdminMutation: mocks.logAdminMutation,
}));
vi.mock("@/lib/repositories/admin-media.repository", () => ({
  clearCoverMediaForEntity: vi.fn(),
  linkMediaToEntity: mocks.linkMediaToEntity,
  linkMediaToEntityByStoragePath: mocks.linkMediaToEntityByStoragePath,
}));
vi.mock("@/lib/repositories/admin-restaurant.repository", () => ({
  createAdminRestaurant: mocks.createAdminRestaurant,
  updateAdminRestaurant: vi.fn(),
  updateAdminRestaurantStatus: vi.fn(),
  findRestaurantBySlug: mocks.findRestaurantBySlug,
  getAdminRestaurantById: vi.fn(),
}));

import { createRestaurantAction } from "@/app/actions/admin-restaurant-actions";

function validRestaurantForm() {
  const formData = new FormData();
  formData.set("provinceId", "1");
  formData.set("slug", "restaurant-cover-regression");
  formData.set("nameTh", "ร้านทดสอบรูปปก");
  formData.set("categoryIds", "2");
  formData.set("isActive", "on");
  formData.set("coverStoragePath", "general/restaurant-cover.webp");
  return formData;
}

describe("createRestaurantAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue({ actor: { adminId: "admin-id" } });
    mocks.findRestaurantBySlug.mockResolvedValue(null);
    mocks.createAdminRestaurant.mockResolvedValue({ restaurant_id: 88 });
    mocks.linkMediaToEntityByStoragePath.mockResolvedValue(undefined);
    mocks.logAdminMutation.mockResolvedValue(undefined);
  });

  it("creates the restaurant and links a Media Library cover by storage path", async () => {
    const result = await createRestaurantAction({ success: false }, validRestaurantForm());

    expect(result).toEqual({ success: true, data: { id: 88 } });
    expect(mocks.linkMediaToEntityByStoragePath).toHaveBeenCalledWith(
      "general/restaurant-cover.webp",
      "restaurant",
      88,
    );
    expect(mocks.linkMediaToEntity).not.toHaveBeenCalled();
    expect(mocks.logAdminMutation).toHaveBeenCalledOnce();
  });
});
