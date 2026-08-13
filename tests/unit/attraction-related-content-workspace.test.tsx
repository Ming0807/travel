import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  search: vi.fn(),
  save: vi.fn(),
}));

vi.mock("@/app/actions/admin-attraction-actions", () => ({
  searchAttractionRelatedContentAction: mocks.search,
  saveAttractionRelatedContentAction: mocks.save,
}));

import { RelatedContentWorkspace } from "@/components/admin/attractions/visual-editor/RelatedContentWorkspace";

const settings = [
  { attractionId: 10, contentType: "attractions" as const, mode: "hybrid" as const, maxItems: 4 },
  { attractionId: 10, contentType: "restaurants" as const, mode: "manual" as const, maxItems: 4 },
  { attractionId: 10, contentType: "accommodations" as const, mode: "automatic" as const, maxItems: 4 },
  { attractionId: 10, contentType: "stories" as const, mode: "hidden" as const, maxItems: 3 },
];

const selected = {
  attractions: [
    { id: 11, name: "สวนขวัญเมือง", slug: "city-park", provinceName: "ยะลา", isPublished: true, isActive: true, status: "published" as const, available: true, editHref: "/admin/attractions/11/edit" },
    { id: 12, name: "พิพิธภัณฑ์เมือง", slug: "city-museum", provinceName: "ยะลา", isPublished: true, isActive: true, status: "published" as const, available: true, editHref: "/admin/attractions/12/edit" },
  ],
  restaurants: [
    { id: 21, name: "ร้านเดิม", slug: "old-restaurant", provinceName: "ยะลา", isPublished: false, isActive: false, status: "unavailable" as const, available: false, editHref: "/admin/restaurants/21/edit" },
  ],
  accommodations: [],
  stories: [],
};

describe("RelatedContentWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.search.mockResolvedValue({ success: true, data: { items: [], total: 0, page: 1, pageSize: 20 } });
    mocks.save.mockResolvedValue({ success: true });
  });

  it("presents one Thai-first workspace with four content tabs and real reorder controls", async () => {
    render(
      <RelatedContentWorkspace
        attractionId={10}
        initialType="attractions"
        settings={settings}
        selectedByType={selected}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("tab", { name: /สถานที่ใกล้เคียง/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /ร้านอาหาร/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /ที่พัก/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /เรื่องราว/ })).toBeInTheDocument();
    expect(screen.getByText("เลือกก่อน แล้วให้ระบบเติมให้ครบ")).toBeInTheDocument();

    const selectedList = screen.getByRole("list", { name: "เนื้อหาที่เลือก" });
    expect(within(selectedList).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      expect.stringContaining("สวนขวัญเมือง"),
      expect.stringContaining("พิพิธภัณฑ์เมือง"),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "เลื่อน พิพิธภัณฑ์เมือง ขึ้น" }));
    expect(within(selectedList).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      expect.stringContaining("พิพิธภัณฑ์เมือง"),
      expect.stringContaining("สวนขวัญเมือง"),
    ]);

    fireEvent.click(screen.getByRole("tab", { name: /ร้านอาหาร/ }));
    expect(screen.getByText("รายการนี้ไม่พร้อมแสดงบนหน้าบ้าน")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "เปิดแก้ไข ร้านเดิม" })).toHaveAttribute("href", "/admin/restaurants/21/edit");
  });

  it("searches on the server and adds a result without loading every CMS record", async () => {
    mocks.search.mockResolvedValue({
      success: true,
      data: {
        items: [{ id: 31, name: "ร้านอาหารชุมชน", slug: "community-food", provinceName: "ยะลา", status: "published", editHref: "/admin/restaurants/31/edit" }],
        total: 1,
        page: 1,
        pageSize: 20,
      },
    });
    render(
      <RelatedContentWorkspace
        attractionId={10}
        initialType="restaurants"
        settings={settings}
        selectedByType={selected}
        onClose={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "ค้นหาร้านอาหาร" }), { target: { value: "ชุมชน" } });

    await waitFor(() => expect(mocks.search).toHaveBeenLastCalledWith({
      attractionId: 10,
      contentType: "restaurants",
      query: "ชุมชน",
      page: 1,
      pageSize: 20,
    }));
    expect(await screen.findByText("ร้านอาหารชุมชน")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "เลือก ร้านอาหารชุมชน" }));
    expect(within(screen.getByRole("list", { name: "เนื้อหาที่เลือก" })).getByText("ร้านอาหารชุมชน")).toBeInTheDocument();
  });

  it("saves the active mode, limit, and ordered ids without closing the workspace", async () => {
    const onClose = vi.fn();
    render(
      <RelatedContentWorkspace
        attractionId={10}
        initialType="attractions"
        settings={settings}
        selectedByType={selected}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "เลื่อน พิพิธภัณฑ์เมือง ขึ้น" }));
    fireEvent.click(screen.getByRole("button", { name: "บันทึกส่วนนี้" }));

    await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({
      attractionId: 10,
      type: "attractions",
      relatedIds: [12, 11],
      mode: "hybrid",
      maxItems: 4,
    }));
    expect(await screen.findByText("บันทึกแล้ว")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("recovers from search and save transport failures without leaving controls stuck", async () => {
    mocks.search.mockRejectedValueOnce(new Error("network unavailable"));
    mocks.save.mockRejectedValueOnce(new Error("network unavailable"));

    render(
      <RelatedContentWorkspace
        attractionId={10}
        initialType="attractions"
        settings={settings}
        selectedByType={selected}
        onClose={vi.fn()}
      />,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("ยังค้นหาเนื้อหาไม่ได้");

    fireEvent.click(screen.getByRole("button", { name: "เลื่อน พิพิธภัณฑ์เมือง ขึ้น" }));
    const saveButton = screen.getByRole("button", { name: "บันทึกส่วนนี้" });
    fireEvent.click(saveButton);

    expect(await screen.findByText("ยังบันทึกไม่ได้ กรุณาตรวจการเชื่อมต่อแล้วลองอีกครั้ง")).toBeInTheDocument();
    expect(saveButton).toBeEnabled();
  });
});
