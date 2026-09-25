import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  logAdminMutation: vi.fn(),
  revalidatePath: vi.fn(),
  createAdminRestaurant: vi.fn(),
  findRestaurantBySlug: vi.fn(),
  getAdminMediaById: vi.fn(),
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
  getAdminMediaById: mocks.getAdminMediaById,
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
  formData.set("coverMediaId", "91");
  formData.set("coverStoragePath", "general/restaurant-cover.webp");
  return formData;
}

describe("createRestaurantAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue({ actor: { adminId: "admin-id" } });
    mocks.findRestaurantBySlug.mockResolvedValue(null);
    mocks.createAdminRestaurant.mockResolvedValue({ restaurant_id: 88 });
    mocks.getAdminMediaById.mockResolvedValue({
      media_id: 91,
      storage_path: "general/restaurant-cover.webp",
      media_type: "image",
      is_active: true,
      lifecycle_status: "active",
    });
    mocks.logAdminMutation.mockResolvedValue(undefined);
  });

  it("creates the restaurant and links the validated Media Library cover by id", async () => {
    const result = await createRestaurantAction({ success: false }, validRestaurantForm());

    expect(result).toEqual({ success: true, data: { id: 88 } });
    expect(mocks.getAdminMediaById).toHaveBeenCalledWith(91);
    expect(mocks.linkMediaToEntity).toHaveBeenCalledWith(91, "restaurant", 88);
    expect(mocks.linkMediaToEntityByStoragePath).not.toHaveBeenCalled();
    expect(mocks.logAdminMutation).toHaveBeenCalledOnce();
  });
});
