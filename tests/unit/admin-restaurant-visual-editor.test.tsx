import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AdminRestaurantRow } from "@/lib/repositories/admin-restaurant.repository";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  updateRestaurantAction: vi.fn().mockResolvedValue({ success: true, data: { id: 45 } }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
vi.mock("@/app/actions/admin-restaurant-actions", () => ({
  updateRestaurantAction: mocks.updateRestaurantAction,
}));

import { RestaurantVisualEditor } from "@/components/admin/restaurants/visual-editor/RestaurantVisualEditor";

const restaurant: AdminRestaurantRow = {
  restaurant_id: 45,
  province_id: 1,
  slug: "lae-pha-ban-na-tham",
  name_th: "แลผา บ้านหน้าถ้ำ",
  name_en: "Lae Pha, Ban Na Tham",
  description_th: "รายละเอียดร้านอาหาร",
  description_en: null,
  food_type: "Thai",
  category_ids: [1],
  categories: [{
    categoryId: 1,
    slug: "thai-food",
    nameTh: "อาหารไทย",
    nameEn: "Thai food",
    isActive: true,
  }],
  latitude: 6.5298,
  longitude: 101.2335,
  address_text: "ยะลา",
  opening_hours: "ทุกวัน",
  contact_info: "081-897-4471",
  is_published: true,
  is_active: true,
  created_at: "2026-08-14T00:00:00.000Z",
  updated_at: null,
  province_name_th: "ยะลา",
  attraction_count: 0,
};

function renderEditor(restaurantOverrides: Partial<AdminRestaurantRow> = {}) {
  render(
    <RestaurantVisualEditor
      restaurant={{ ...restaurant, ...restaurantOverrides }}
      provinces={[{ id: 1, label: "ยะลา" }]}
      categories={[]}
      coverMediaId={7}
      coverMediaUrl="/site-media/restaurants/lae-pha.webp"
    />,
  );
}

describe("RestaurantVisualEditor", () => {
  it("offers public preview and media management from the editor header", () => {
    renderEditor();

    expect(screen.getByRole("link", { name: "ดูหน้าสาธารณะ" })).toHaveAttribute(
      "href",
      "/restaurants/lae-pha-ban-na-tham",
    );
    expect(screen.getByRole("link", { name: "จัดการสื่อ" })).toHaveAttribute(
      "href",
      "/admin/restaurants/45/media",
    );
    expect(screen.getByRole("link", { name: "จัดการสื่อ" })).toHaveClass("min-h-11");
  });

  it("does not offer a broken public route for a draft or inactive restaurant", () => {
    const { rerender } = render(
      <RestaurantVisualEditor
        restaurant={{ ...restaurant, is_published: false }}
        provinces={[{ id: 1, label: "ยะลา" }]}
        categories={[]}
      />,
    );

    expect(screen.getByRole("button", { name: "ดูหน้าสาธารณะ" })).toBeDisabled();
    expect(screen.queryByRole("link", { name: "ดูหน้าสาธารณะ" })).not.toBeInTheDocument();

    rerender(
      <RestaurantVisualEditor
        restaurant={restaurant}
        provinces={[{ id: 1, label: "ยะลา" }]}
        categories={[]}
        isPubliclyAvailable={false}
      />,
    );

    expect(screen.getByRole("button", { name: "ดูหน้าสาธารณะ" })).toBeDisabled();
  });

  it("opens the nearby-attraction picker from its matching preview section", () => {
    render(
      <RestaurantVisualEditor
        restaurant={restaurant}
        provinces={[{ id: 1, label: "ยะลา" }]}
        categories={[]}
        nearbyAttractions={[{ id: 7, label: "วัดคูหาภิมุข", isPublished: true }]}
        selectedAttractionIds={[7]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "แก้ไขสถานที่ท่องเที่ยวใกล้เคียง" }));

    expect(screen.getByRole("checkbox", { name: /วัดคูหาภิมุข/ })).toBeChecked();
    expect(screen.getByRole("button", { name: "บันทึกการตั้งค่า" })).toBeInTheDocument();
  });

  it("keeps cover selection in the header editor and renders cancel as a real button", () => {
    renderEditor();

    fireEvent.click(screen.getByRole("button", { name: "แก้ไข ข้อมูลหลักและรูปภาพ" }));

    expect(screen.getByRole("button", { name: "เลือกจาก Media Library" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ยกเลิก" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "ยกเลิก" })).not.toBeInTheDocument();
  });

  it("does not duplicate cover management in settings", () => {
    renderEditor();

    fireEvent.click(screen.getByRole("button", { name: "ตั้งค่า / สถานะ" }));

    expect(screen.queryByText("รูปภาพปก (Cover Image)")).not.toBeInTheDocument();
  });

  it("refreshes the server-rendered preview after saving a drawer", async () => {
    renderEditor();

    fireEvent.click(screen.getByRole("button", { name: "แก้ไข ข้อมูลหลักและรูปภาพ" }));
    fireEvent.click(screen.getByRole("button", { name: "บันทึกข้อมูลหลักและรูปภาพ" }));

    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledOnce());
  });
});
