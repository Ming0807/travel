import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AttractionDirectoryClient } from "../../components/attractions/AttractionDirectoryClient";
import type { PublicAttractionCard } from "../../lib/repositories/public-content.repository";

function attraction(slug: string, name: string, imageUrl: string | null): PublicAttractionCard {
  return {
    slug,
    name,
    province: "ยะลา",
    district: "เมืองยะลา",
    category: "ธรรมชาติ",
    description: "ข้อมูลสถานที่จากระบบจัดการเนื้อหา",
    imageUrl,
    imageAlt: `ภาพ${name}`,
    tags: [],
    rating: null,
    reviewCount: null,
    reviewState: "empty",
    latitude: null,
    longitude: null,
  };
}

describe("attraction directory layout", () => {
  it("renders every attraction in one consistent grid with real save actions", () => {
    render(
      <AttractionDirectoryClient
        items={[
          attraction("bang-lang-dam", "เขื่อนบางลาง", null),
          attraction("aiyerweng-skywalk", "สกายวอล์คอัยเยอร์เวง", "/site-media/aiyerweng.webp"),
          attraction("yala-city-pillar", "ศาลหลักเมืองยะลา", "/site-media/city-pillar.webp"),
        ]}
      />,
    );

    expect(screen.queryByText("สถานที่แนะนำ")).not.toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getAllByRole("link", { name: /สกายวอล์คอัยเยอร์เวง/ })[0]).toHaveAttribute("href", "/attractions/aiyerweng-skywalk");
    expect(screen.getByRole("button", { name: "บันทึกสกายวอล์คอัยเยอร์เวงไว้ในทริป" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("img", { name: "ยังไม่มีภาพของเขื่อนบางลาง" })).toBeVisible();
    expect(screen.getByRole("link", { name: "ดูเส้นทางแนะนำ" })).toHaveAttribute("href", "/routes");
    expect(screen.queryByText("สร้างเส้นทาง")).not.toBeInTheDocument();
  });

  it("starts with standard results when no attraction has an eligible image", () => {
    render(
      <AttractionDirectoryClient
        items={[attraction("bang-lang-dam", "เขื่อนบางลาง", null)]}
      />,
    );

    expect(screen.queryByText("สถานที่แนะนำ")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "ยังไม่มีภาพของเขื่อนบางลาง" })).toBeVisible();
  });
});
