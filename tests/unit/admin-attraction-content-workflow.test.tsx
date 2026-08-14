import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminAttractionRow } from "@/lib/repositories/admin-attraction.repository";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  updateAttractionSectionAction: vi.fn().mockResolvedValue({ success: true, data: { id: 4 } }),
  createAttractionAction: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mocks.refresh, push: vi.fn() }),
}));
vi.mock("@/app/actions/admin-attraction-actions", () => ({
  updateAttractionSectionAction: mocks.updateAttractionSectionAction,
  createAttractionAction: mocks.createAttractionAction,
}));
vi.mock("@/components/admin/forms/FormRichText", () => ({
  FormRichText: ({ label, name }: { label: string; name: string }) => (
    <label>{label}<textarea name={name} /></label>
  ),
}));

import { AttractionQuickCreate } from "@/components/admin/attractions/AttractionQuickCreate";
import { ContentForm } from "@/components/admin/attractions/visual-editor/SectionForms";

const attraction: AdminAttractionRow = {
  attraction_id: 4,
  province_id: 1,
  district_id: null,
  attraction_type_id: 2,
  slug: "aiyerweng-skywalk",
  name_th: "สกายวอล์คอัยเยอร์เวง",
  name_en: null,
  short_description_th: "จุดชมทะเลหมอก",
  short_description_en: null,
  description_th: "<p>ภาพรวม</p>",
  description_en: null,
  history_th: "<p>ประวัติชุมชน</p>",
  history_en: null,
  latitude: null,
  longitude: null,
  address_text: null,
  opening_hours: null,
  contact_info: null,
  travel_tips_th: null,
  travel_tips_en: null,
  how_to_get_there_th: null,
  how_to_get_there_en: null,
  custom_sections_json: null,
  sustainability_category: null,
  estimated_capacity_per_day: null,
  is_published: true,
  is_active: true,
  created_at: "2026-08-15T00:00:00.000Z",
  updated_at: null,
  province_name_th: "ยะลา",
  district_name_th: null,
  attraction_type_name_th: "ธรรมชาติ",
  attraction_type_names_th: ["ธรรมชาติ"],
  photo_spot_count: 0,
  checkin_code_count: 0,
};

describe("admin attraction content workflow", () => {
  beforeEach(() => vi.clearAllMocks());

  it("explains that history and stories are completed after quick creation", () => {
    render(<AttractionQuickCreate provinces={[]} attractionTypes={[]} />);
    expect(screen.getByText(/ประวัติ \/ เรื่องเล่า/)).toBeInTheDocument();
  });

  it("refreshes the visual preview after saving history content", async () => {
    render(<ContentForm attraction={attraction} onClose={vi.fn()} />);

    expect(screen.getAllByText(/ประวัติ \/ เรื่องเล่า/)).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "บันทึกเนื้อหาและเรื่องเล่า" }));

    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledOnce());
  });
});
