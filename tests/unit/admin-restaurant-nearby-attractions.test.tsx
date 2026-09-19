import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn(),
  logAdminMutation: vi.fn(),
  revalidatePath: vi.fn(),
  createAdminRestaurant: vi.fn(),
  updateAdminRestaurant: vi.fn(),
  findRestaurantBySlug: vi.fn(),
  getAdminRestaurantById: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/guards", () => ({
  requirePermission: mocks.requirePermission,
  AdminAuthError: class AdminAuthError extends Error {},
}));
vi.mock("@/lib/services/audit-log.service", () => ({ logAdminMutation: mocks.logAdminMutation }));
vi.mock("@/lib/repositories/admin-media.repository", () => ({
  clearCoverMediaForEntity: vi.fn(),
  linkMediaToEntity: vi.fn(),
  linkMediaToEntityByStoragePath: vi.fn(),
}));
vi.mock("@/lib/repositories/admin-restaurant.repository", () => ({
  createAdminRestaurant: mocks.createAdminRestaurant,
  updateAdminRestaurant: mocks.updateAdminRestaurant,
  updateAdminRestaurantStatus: vi.fn(),
  findRestaurantBySlug: mocks.findRestaurantBySlug,
  getAdminRestaurantById: mocks.getAdminRestaurantById,
}));

import { createRestaurantAction, updateRestaurantAction } from "@/app/actions/admin-restaurant-actions";
import { NearbyAttractionPicker } from "@/components/admin/restaurants/NearbyAttractionPicker";

function restaurantForm() {
  const formData = new FormData();
  formData.set("provinceId", "1");
  formData.set("slug", "wat-na-tham-kitchen");
  formData.set("nameTh", "ครัวหน้าถ้ำ");
  formData.set("categoryIds", "2");
  formData.set("isActive", "on");
  formData.set("syncNearbyAttractions", "true");
  formData.append("nearbyAttractionIds", "12");
  formData.append("nearbyAttractionIds", "4");
  return formData;
}

describe("restaurant nearby attractions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requirePermission.mockResolvedValue({ actor: { adminId: "admin-id" } });
    mocks.findRestaurantBySlug.mockResolvedValue(null);
    mocks.createAdminRestaurant.mockResolvedValue({ restaurant_id: 88 });
    mocks.updateAdminRestaurant.mockResolvedValue({ restaurant_id: 88 });
    mocks.getAdminRestaurantById.mockResolvedValue({ restaurant_id: 88 });
    mocks.logAdminMutation.mockResolvedValue(undefined);
  });

  it("renders only supplied active pilot options and submits selected ids", () => {
    render(
      <form>
        <NearbyAttractionPicker
          attractions={[
            { id: 4, label: "วัดคูหาภิมุข", isPublished: true },
            { id: 12, label: "ชุมชนหน้าถ้ำ", isPublished: false },
          ]}
          selectedAttractionIds={[4]}
        />
      </form>,
    );

    expect(screen.getByRole("checkbox", { name: /วัดคูหาภิมุข/ })).toBeChecked();
    expect(screen.getByText("ยังไม่เผยแพร่")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: /ชุมชนหน้าถ้ำ/ }));

    const ids = screen.getAllByRole("checkbox").filter((input) => (input as HTMLInputElement).checked);
    expect(ids).toHaveLength(2);
    expect(screen.getByDisplayValue("true")).toHaveAttribute("name", "syncNearbyAttractions");
  });

  it("syncs ordered selections after create and update when the picker is present", async () => {
    await expect(createRestaurantAction({ success: false }, restaurantForm()))
      .resolves.toEqual({ success: true, data: { id: 88 } });
    expect(mocks.createAdminRestaurant).toHaveBeenLastCalledWith(
      expect.objectContaining({ nearbyAttractionIds: [12, 4] }),
      { syncNearbyAttractions: true },
    );

    await expect(updateRestaurantAction(88, { success: false }, restaurantForm()))
      .resolves.toEqual({ success: true });
    expect(mocks.updateAdminRestaurant).toHaveBeenLastCalledWith(
      88,
      expect.objectContaining({ nearbyAttractionIds: [12, 4] }),
      { syncNearbyAttractions: true },
    );
  });

  it("does not erase relationships when a different edit drawer is saved", async () => {
    const formData = restaurantForm();
    formData.delete("syncNearbyAttractions");
    formData.delete("nearbyAttractionIds");

    await updateRestaurantAction(88, { success: false }, formData);

    expect(mocks.updateAdminRestaurant).toHaveBeenLastCalledWith(
      88,
      expect.any(Object),
      { syncNearbyAttractions: false },
    );
  });
});
