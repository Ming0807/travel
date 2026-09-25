import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  logAdminMutation: vi.fn(),
  revalidatePath: vi.fn(),
  createAdminRestaurant: vi.fn(),
  updateAdminRestaurant: vi.fn(),
  findRestaurantBySlug: vi.fn(),
  getAdminRestaurantById: vi.fn(),
  getAdminMediaById: vi.fn(),
  linkMediaToEntity: vi.fn(),
  linkMediaToEntityByStoragePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/guards", () => ({
  requirePermission: mocks.requirePermission,
  AdminAuthError: class AdminAuthError extends Error {},
}));
vi.mock("@/lib/services/audit-log.service", () => ({ logAdminMutation: mocks.logAdminMutation }));
vi.mock("@/lib/repositories/admin-media.repository", () => ({
  clearCoverMediaForEntity: vi.fn(),
  getAdminMediaById: mocks.getAdminMediaById,
  linkMediaToEntity: mocks.linkMediaToEntity,
  linkMediaToEntityByStoragePath: mocks.linkMediaToEntityByStoragePath,
}));
vi.mock("@/lib/repositories/admin-restaurant.repository", () => ({
  createAdminRestaurant: mocks.createAdminRestaurant,
  updateAdminRestaurant: mocks.updateAdminRestaurant,
  updateAdminRestaurantStatus: vi.fn(),
  findRestaurantBySlug: mocks.findRestaurantBySlug,
  getAdminRestaurantById: mocks.getAdminRestaurantById,
}));

import { createRestaurantAction, updateRestaurantAction } from "@/app/actions/admin-restaurant-actions";

function restaurantForm() {
  const formData = new FormData();
  formData.set("provinceId", "1");
  formData.set("slug", "restaurant-cover-test");
  formData.set("nameTh", "ร้านทดสอบรูปปก");
  formData.set("categoryIds", "2");
  formData.set("isActive", "on");
  formData.set("coverMediaId", "91");
  formData.set("coverStoragePath", "restaurants/cover.webp");
  return formData;
}

describe("restaurant cover media writes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue({ actor: { adminId: "admin-id" } });
    mocks.findRestaurantBySlug.mockResolvedValue(null);
    mocks.createAdminRestaurant.mockResolvedValue({ restaurant_id: 88 });
    mocks.updateAdminRestaurant.mockResolvedValue({ restaurant_id: 88 });
    mocks.getAdminRestaurantById.mockResolvedValue({ restaurant_id: 88 });
    mocks.getAdminMediaById.mockResolvedValue({
      media_id: 91,
      storage_path: "restaurants/cover.webp",
      media_type: "image",
      is_active: true,
      lifecycle_status: "active",
    });
    mocks.logAdminMutation.mockResolvedValue(undefined);
  });

  it("links the validated selected image by id on create", async () => {
    const result = await createRestaurantAction({ success: false }, restaurantForm());

    expect(result).toEqual({ success: true, data: { id: 88 } });
    expect(mocks.getAdminMediaById).toHaveBeenCalledWith(91);
    expect(mocks.linkMediaToEntity).toHaveBeenCalledWith(91, "restaurant", 88);
    expect(mocks.linkMediaToEntityByStoragePath).not.toHaveBeenCalled();
  });

  it("persists replacement covers by validated asset id on update", async () => {
    const formData = restaurantForm();
    formData.set("coverMediaAction", "set");

    const result = await updateRestaurantAction(88, { success: false }, formData);

    expect(result).toEqual({ success: true });
    expect(mocks.linkMediaToEntity).toHaveBeenCalledWith(91, "restaurant", 88);
    expect(mocks.linkMediaToEntityByStoragePath).not.toHaveBeenCalled();
  });

  it("rejects a stale or forged storage path without changing the saved cover", async () => {
    const formData = restaurantForm();
    formData.set("coverMediaAction", "set");
    formData.set("coverStoragePath", "other-users/private.webp");

    const result = await updateRestaurantAction(88, { success: false }, formData);

    expect(result).toMatchObject({
      success: false,
      fieldErrors: { coverMediaId: [expect.any(String)] },
    });
    expect(mocks.linkMediaToEntity).not.toHaveBeenCalled();
    expect(mocks.linkMediaToEntityByStoragePath).not.toHaveBeenCalled();
  });

  it("rejects inactive, archived, or non-image assets", async () => {
    const formData = restaurantForm();
    mocks.getAdminMediaById.mockResolvedValue({
      media_id: 91,
      storage_path: "restaurants/cover.webp",
      media_type: "video",
      is_active: false,
      lifecycle_status: "archived",
    });

    const result = await createRestaurantAction({ success: false }, formData);

    expect(result).toMatchObject({ success: false, fieldErrors: { coverMediaId: [expect.any(String)] } });
    expect(mocks.linkMediaToEntity).not.toHaveBeenCalled();
    expect(mocks.linkMediaToEntityByStoragePath).not.toHaveBeenCalled();
  });
});
