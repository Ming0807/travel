import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element -- test double for Next Image
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

import { AttractionCardsRow } from "@/components/attractions/attraction-cards-row";

describe("AttractionCardsRow", () => {
  it("uses a mobile rail and a stable desktop grid with direct card links", () => {
    render(
      <AttractionCardsRow
        id="food"
        title="ร้านอาหารใกล้เคียง"
        viewAllText="ดูร้านอาหารทั้งหมด"
        linkPrefix="/restaurants"
        items={[
          {
            id: "local-kitchen",
            href: "/restaurants/local-kitchen",
            title: "ครัวชุมชน",
            description: "อาหารพื้นถิ่น",
            imageUrl: "/site-media/local-kitchen.webp",
            imageAlt: "อาหารพื้นถิ่นที่ครัวชุมชน",
            recommendationReason: "อยู่ห่างประมาณ 1.8 กม.",
            recommendationSource: "automatic",
          },
        ]}
      />,
    );

    const list = screen.getByRole("list", { name: "ร้านอาหารใกล้เคียง" });
    expect(list).toHaveClass("grid", "overflow-x-auto", "lg:grid-cols-4");
    expect(screen.getByRole("link", { name: /ครัวชุมชน/ })).toHaveAttribute(
      "href",
      "/restaurants/local-kitchen",
    );
    expect(screen.getByRole("img", { name: "อาหารพื้นถิ่นที่ครัวชุมชน" })).toBeInTheDocument();
    expect(screen.getByText("อยู่ห่างประมาณ 1.8 กม.")).toBeInTheDocument();
    expect(screen.queryByText(/เหตุผลที่แนะนำ:/)).not.toBeInTheDocument();
  });

  it("does not claim an algorithmic reason for a manual card", () => {
    render(
      <AttractionCardsRow
        id="articles"
        title="เรื่องราวที่เกี่ยวข้อง"
        linkPrefix="/stories"
        items={[
          {
            id: "story-one",
            title: "เรื่องจากชุมชน",
            description: "บันทึกการเดินทาง",
            imageUrl: null,
            imageAlt: "เรื่องจากชุมชน",
            recommendationSource: "curated",
          },
        ]}
      />,
    );

    expect(screen.queryByText(/แนะนำ/)).not.toBeInTheDocument();
  });
});
