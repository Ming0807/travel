import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AdminRestaurantRow } from "@/lib/repositories/admin-restaurant.repository";
import type { AdminMediaRow } from "@/lib/repositories/admin-media.repository";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  createRestaurantAction: vi.fn().mockResolvedValue({ success: true }),
  updateRestaurantAction: vi.fn().mockResolvedValue({ success: true, data: { id: 45 } }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));
vi.mock("@/app/actions/admin-restaurant-actions", () => ({
  createRestaurantAction: mocks.createRestaurantAction,
  updateRestaurantAction: mocks.updateRestaurantAction,
}));

import { RestaurantVisualEditor } from "@/components/admin/restaurants/visual-editor/RestaurantVisualEditor";
import { RestaurantForm } from "@/components/admin/restaurants/RestaurantForm";

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

const restaurantMedia: AdminMediaRow[] = [
  {
    media_id: 71,
    attraction_id: null,
    restaurant_id: 45,
    accommodation_id: null,
    story_id: null,
    route_id: null,
    media_type: "image",
    storage_path: "restaurants/lae-pha-cover.webp",
    alt_text_th: "หน้าร้าน",
    alt_text_en: null,
    caption_th: null,
    caption_en: null,
    credit_text: null,
    source_url: null,
    license_type: null,
    usage_notes: null,
    lifecycle_status: "active",
    archived_at: null,
    display_order: 0,
    is_cover: true,
    is_active: true,
    created_at: "2026-08-14T00:00:00.000Z",
    updated_at: null,
  },
  {
    media_id: 72,
    attraction_id: null,
    restaurant_id: 45,
    accommodation_id: null,
    story_id: null,
    route_id: null,
    media_type: "image",
    storage_path: "restaurants/lae-pha-food.webp",
    alt_text_th: "อาหารของร้าน",
    alt_text_en: null,
    caption_th: null,
    caption_en: null,
    credit_text: null,
    source_url: null,
    license_type: null,
    usage_notes: null,
    lifecycle_status: "active",
    archived_at: null,
    display_order: 1,
    is_cover: false,
    is_active: true,
    created_at: "2026-08-14T00:00:00.000Z",
    updated_at: null,
  },
];

describe("RestaurantVisualEditor", () => {
  it("keeps section edit actions visible without hover and reachable on mobile", () => {
    renderEditor();

    const editButton = screen.getByRole("button", { name: "แก้ไข ข้อมูลหลักและรูปภาพ" });
    const actionSurface = editButton.parentElement;

    expect(actionSurface?.className).not.toMatch(/(?:^|\s)sm:opacity-0(?:\s|$)/);
    expect(editButton).toHaveClass("min-h-11", "focus-visible:outline-2");
  });

  it("previews rich restaurant descriptions as readable text instead of literal markup", () => {
    renderEditor({ description_th: "<p>เมนู <strong>อาหารท้องถิ่น</strong></p>" });

    expect(screen.getByText("เมนู อาหารท้องถิ่น")).toBeInTheDocument();
    expect(screen.queryByText(/<strong>/)).not.toBeInTheDocument();
  });

  it("shows server-sanitized inline media in the content preview", () => {
    render(
      <RestaurantVisualEditor
        restaurant={restaurant}
        provinces={[{ id: 1, label: "ยะลา" }]}
        categories={[]}
        descriptionPreviewHtml={'<p>อาหารพื้นถิ่น</p><img src="/site-media/content-media/food.webp" alt="จานอาหาร" data-image-size="medium" data-image-align="center">'}
      />,
    );

    expect(screen.getByText("อาหารพื้นถิ่น")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "จานอาหาร" })).toHaveAttribute("data-image-size", "medium");
  });

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

  it("previews active restaurant gallery media and opens its manager in context", () => {
    render(
      <RestaurantVisualEditor
        restaurant={restaurant}
        provinces={[{ id: 1, label: "ยะลา" }]}
        categories={[]}
        media={restaurantMedia}
      />,
    );

    expect(screen.getByRole("heading", { name: "ภาพร้านอาหาร" })).toBeInTheDocument();
    expect(screen.getByText("เชื่อมโยงรูปภาพแล้ว 2 รูป")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "หน้าร้าน" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "อาหารของร้าน" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "จัดการแกลเลอรี" }));

    expect(screen.getByRole("heading", { name: "จัดการรูปภาพ (Media Gallery)" })).toBeInTheDocument();
  });

  it("shows a gallery readiness action when no restaurant images are linked", () => {
    render(
      <RestaurantVisualEditor
        restaurant={restaurant}
        provinces={[{ id: 1, label: "ยะลา" }]}
        categories={[]}
        media={[]}
      />,
    );

    expect(screen.getByText("ยังไม่มีรูปภาพสำหรับแกลเลอรีร้านอาหาร")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "เพิ่มรูปภาพ" }));
    expect(screen.getByRole("heading", { name: "จัดการรูปภาพ (Media Gallery)" })).toBeInTheDocument();
  });

  it("gives both restaurant description languages rich image and layout controls", async () => {
    Object.defineProperty(document, "elementFromPoint", {
      configurable: true,
      value: () => document.body,
    });
    renderEditor();

    fireEvent.click(screen.getByRole("button", { name: "แก้ไข รายละเอียด" }));

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: "แทรกรูปจากคลังสื่อ" })).toHaveLength(2);
      expect(screen.getAllByText("คลิกรูปในเนื้อหาเพื่อปรับขนาดและตำแหน่ง")).toHaveLength(2);
    });
  });

  it("keeps rich image controls for both languages in the new restaurant form", async () => {
    Object.defineProperty(document, "elementFromPoint", {
      configurable: true,
      value: () => document.body,
    });
    render(<RestaurantForm provinces={[]} categories={[]} />);

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: "แทรกรูปจากคลังสื่อ" })).toHaveLength(2);
      expect(screen.getAllByText("คลิกรูปในเนื้อหาเพื่อปรับขนาดและตำแหน่ง")).toHaveLength(2);
    });
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
