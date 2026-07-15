import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const ASSET = {
  id: "asset-21",
  file_name: "yala-hero.jpg",
  storage_path: "attractions/yala-hero.webp",
  thumbnail_storage_path: "attractions/yala-hero_thumb.webp",
  mime_type: "image/webp",
  size_bytes: 320000,
  category: "Attractions",
  lifecycle_status: "archived" as const,
  created_at: "2026-07-15T08:00:00.000Z",
  url: "/site-media/attractions/yala-hero.webp",
  thumbnail_url: "/site-media/attractions/yala-hero_thumb.webp",
  is_active: false,
};

describe("MediaLibrary server-managed filter UX", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders visible Thai-first URL filters without fetching an unbounded client list", () => {
    render(
      <MediaLibrary
        mode="manage"
        serverData={{
          assets: [ASSET],
          total: 41,
          page: 2,
          pageSize: 20,
          filters: {
            search: "yala",
            category: "Attractions",
            lifecycleStatus: "archived",
            mediaType: "webp",
          },
        }}
      />,
    );

    const search = screen.getByLabelText("ค้นหาสื่อ");
    expect(search).toHaveAttribute("name", "search");
    expect(search).toHaveValue("yala");

    expect(screen.getByLabelText("หมวดหมู่")).toHaveValue("Attractions");
    expect(screen.getByLabelText("สถานะสื่อ")).toHaveValue("archived");
    expect(screen.getByLabelText("ประเภทไฟล์")).toHaveValue("webp");
    expect(screen.getByRole("button", { name: "ใช้ตัวกรอง" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ล้างตัวกรอง" })).toHaveAttribute("href", "/admin/media");
    expect(screen.getByText("yala-hero.jpg")).toBeInTheDocument();
    expect(screen.getByText(/21-40.*41/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "หน้าก่อนหน้า" })).toHaveAttribute(
      "href",
      expect.stringContaining("page=1"),
    );
    expect(screen.getByRole("link", { name: "หน้าถัดไป" })).toHaveAttribute(
      "href",
      expect.stringContaining("page=3"),
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("uses generated thumbnails for the paginated grid", () => {
    render(
      <MediaLibrary
        mode="manage"
        serverData={{
          assets: [ASSET],
          total: 1,
          page: 1,
          pageSize: 20,
          filters: { lifecycleStatus: "all" },
        }}
      />,
    );

    expect(screen.getByRole("img", { name: "yala-hero.jpg" })).toHaveAttribute(
      "src",
      ASSET.thumbnail_url,
    );
  });
});
