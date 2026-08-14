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

function renderEditor() {
  render(
    <RestaurantVisualEditor
      restaurant={restaurant}
      provinces={[{ id: 1, label: "ยะลา" }]}
      categories={[]}
      coverMediaId={7}
      coverMediaUrl="/site-media/restaurants/lae-pha.webp"
    />,
  );
}

describe("RestaurantVisualEditor", () => {
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
