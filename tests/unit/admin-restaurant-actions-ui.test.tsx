import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/app/actions/admin-restaurant-actions", () => ({
  toggleRestaurantPublishAction: vi.fn(),
  toggleRestaurantActiveAction: vi.fn(),
}));
vi.mock("@/components/admin/content/CmsArchiveButton", () => ({
  CmsArchiveButton: () => null,
}));

import { RestaurantStatusActions } from "@/components/admin/restaurants/RestaurantStatusActions";

describe("restaurant row actions", () => {
  it("keeps the edit control visible and tappable", () => {
    render(
      <RestaurantStatusActions
        restaurantId={45}
        restaurantName="ครัวหน้าถ้ำ"
        isPublished={false}
        isActive
      />,
    );

    const editLink = screen.getByRole("link", { name: "แก้ไขร้านอาหาร" });
    expect(editLink).toHaveAttribute("href", "/admin/restaurants/45/edit");
    expect(editLink.className).toContain("text-[#07574F]");
    expect(editLink.className).toContain("h-10 w-10");
  });
});
