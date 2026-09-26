import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AdminAccommodationRow } from "@/lib/repositories/admin-accommodation.repository";
import type { AdminMediaRow } from "@/lib/repositories/admin-media.repository";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/app/actions/admin-accommodation-actions", () => ({
  createAccommodationAction: vi.fn(),
  updateAccommodationAction: vi.fn(),
}));
vi.mock("@/components/admin/forms/FormRichText", () => ({
  FormRichText: ({ label, name, defaultValue, onValueChange }: {
    label: string;
    name: string;
    defaultValue?: string;
    onValueChange?: (value: { html: string; document: null }) => void;
  }) => (
    <label>{label}<textarea name={name} defaultValue={defaultValue} onChange={(event) => onValueChange?.({ html: event.currentTarget.value, document: null })} /></label>
  ),
}));

import { AccommodationForm } from "@/components/admin/accommodations/AccommodationForm";

const accommodation: AdminAccommodationRow = {
  accommodation_id: 41,
  province_id: 1,
  slug: "river-garden-stay",
  name_th: "ริเวอร์การ์เดน",
  name_en: "River Garden Stay",
  description_th: "ที่พักใกล้ชุมชนและธรรมชาติ",
  description_en: "A quiet stay near the community.",
  accommodation_type: "Homestay",
  latitude: 6.5,
  longitude: 101.2,
  address_text: "ยะลา",
  contact_info: "โทร 000",
  price_range: "฿฿",
  is_published: false,
  is_active: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: null,
  province_name_th: "ยะลา",
  attraction_count: 2,
};

function renderEditor() {
  return render(
    <AccommodationForm
      accommodation={accommodation}
      provinces={[{ id: 1, label: "ยะลา" }]}
      coverMediaId={7}
      coverPreviewUrl="/site-media/accommodations/river-garden.webp"
      isPubliclyAvailable
    />,
  );
}

describe("AccommodationForm editor workspace", () => {
  it("provides focused sections while retaining the existing accommodation fields", () => {
    renderEditor();

    expect(screen.getByRole("navigation", { name: "ส่วนข้อมูลที่พัก" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /2\. รายละเอียด/ }));
    expect(screen.getByRole("heading", { name: "รายละเอียดที่พัก" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /3\. ที่ตั้ง/ }));
    expect(screen.getByLabelText("จังหวัด *")).toBeInTheDocument();
    expect(screen.getByLabelText("Latitude (ละติจูด)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /4\. การแสดงผล/ }));
    expect(screen.getByLabelText("เผยแพร่ (Published)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "จัดการคลังรูปภาพ" })).toHaveAttribute(
      "href",
      "/admin/accommodations/41/media",
    );
    expect(screen.getByRole("link", { name: "ดูหน้าสาธารณะ" })).toHaveAttribute("href", "/accommodations/river-garden-stay");
    const form = screen.getByRole("link", { name: "ยกเลิก" }).closest("form");
    expect(new FormData(form!).get("nameTh")).toBe("ริเวอร์การ์เดน");
    expect(new FormData(form!).get("descriptionTh")).toBe("ที่พักใกล้ชุมชนและธรรมชาติ");
    expect(new FormData(form!).get("latitude")).toBe("6.5");
  });

  it("updates the public preview and readiness from the unsaved form draft", () => {
    renderEditor();

    const name = screen.getByLabelText("ชื่อภาษาไทย *");
    fireEvent.change(name, { target: { value: "บ้านสวนริมธาร" } });

    expect(screen.getByRole("heading", { name: "บ้านสวนริมธาร" })).toBeInTheDocument();
    expect(screen.getByText("ตัวอย่างหน้าที่พักสาธารณะ")).toBeInTheDocument();
    expect(screen.getByText("5/5")).toBeInTheDocument();
  });

  it("shows actionable readiness gaps for a sparse draft", () => {
    render(
      <AccommodationForm
        provinces={[{ id: 1, label: "ยะลา" }]}
        submitLabel="เพิ่มที่พัก"
      />,
    );

    expect(screen.getByText("0/5")).toBeInTheDocument();
    expect(screen.getByText("เพิ่มชื่อภาษาไทย")).toBeInTheDocument();
    expect(screen.getByText("เลือกภาพปกจากคลังสื่อ")).toBeInTheDocument();
  });

  it("does not link to an unpublished accommodation", () => {
    render(<AccommodationForm accommodation={accommodation} provinces={[{ id: 1, label: "ยะลา" }]} />);
    expect(screen.queryByRole("link", { name: "ดูหน้าสาธารณะ" })).not.toBeInTheDocument();
  });

  it("preserves existing accommodation type and price values outside the suggested options", () => {
    const legacyAccommodation = {
      ...accommodation,
      accommodation_type: "Boutique lodge",
      price_range: "1,000 - 2,000 THB",
    };
    render(<AccommodationForm accommodation={legacyAccommodation} provinces={[{ id: 1, label: "ยะลา" }]} />);

    const type = screen.getByLabelText("ประเภทที่พัก") as HTMLSelectElement;
    const price = screen.getByLabelText("ช่วงราคา (Price Range)") as HTMLSelectElement;
    expect(type.value).toBe("Boutique lodge");
    expect(price.value).toBe("1,000 - 2,000 THB");

    const form = screen.getByRole("link", { name: "ยกเลิก" }).closest("form")!;
    expect(new FormData(form).get("accommodationType")).toBe("Boutique lodge");
    expect(new FormData(form).get("priceRange")).toBe("1,000 - 2,000 THB");
  });

  it("submits formatted Thai description HTML from the rich-text field", () => {
    renderEditor();
    fireEvent.click(screen.getByRole("button", { name: /2\. รายละเอียด/ }));

    const description = screen.getByLabelText("รายละเอียดภาษาไทย") as HTMLTextAreaElement;
    fireEvent.change(description, { target: { value: "<p><strong>ที่พักริมน้ำ</strong></p>" } });

    const form = screen.getByRole("link", { name: "ยกเลิก" }).closest("form")!;
    expect(new FormData(form).get("descriptionTh")).toBe("<p><strong>ที่พักริมน้ำ</strong></p>");
  });

  it("submits formatted English description HTML from the rich-text field", () => {
    renderEditor();
    fireEvent.click(screen.getByRole("button", { name: /2\. รายละเอียด/ }));

    const description = screen.getByLabelText("รายละเอียดภาษาอังกฤษ") as HTMLTextAreaElement;
    fireEvent.change(description, { target: { value: "<p><em>A quiet riverside stay.</em></p>" } });

    const form = screen.getByRole("link", { name: "ยกเลิก" }).closest("form")!;
    expect(new FormData(form).get("descriptionEn")).toBe("<p><em>A quiet riverside stay.</em></p>");
  });

  it("previews active gallery images and links to gallery management", () => {
    const galleryMedia = [
      { media_id: 91, media_type: "image", storage_path: "site-media/stays/room.webp", alt_text_th: "ห้องพัก", alt_text_en: null, is_active: true, lifecycle_status: "active", is_cover: false, display_order: 1 },
      { media_id: 92, media_type: "image", storage_path: "site-media/stays/archived.webp", alt_text_th: "รูปเก่า", alt_text_en: null, is_active: false, lifecycle_status: "archived", is_cover: false, display_order: 2 },
    ] as AdminMediaRow[];
    render(
      <AccommodationForm
        accommodation={accommodation}
        provinces={[{ id: 1, label: "ยะลา" }]}
        galleryMedia={galleryMedia}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /4\. การแสดงผล/ }));

    expect(screen.getByText("เชื่อมโยงรูปภาพแล้ว 1 รูป")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "ห้องพัก" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "รูปเก่า" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /จัดการแกลเลอรี/ })).toHaveAttribute(
      "href",
      "/admin/accommodations/41/media",
    );
  });
});
