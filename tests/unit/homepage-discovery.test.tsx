import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HomepageDiscoveryWorkspace } from "@/components/homepage/sections/HomepageDiscoveryWorkspace";
import type { AttractionCard } from "@/types/tourism";
import type { PublicRouteCard } from "@/lib/repositories/public-content.repository";

function attraction(overrides: Partial<AttractionCard> = {}): AttractionCard {
  return {
    slug: "aiyerweng",
    name: "ทะเลหมอกอัยเยอร์เวง",
    province: "ยะลา",
    category: "ธรรมชาติ",
    description: "ชมทะเลหมอกและผืนป่าฮาลา-บาลา",
    imageUrl: null,
    imageAlt: "ทะเลหมอกอัยเยอร์เวง",
    tags: ["ธรรมชาติ", "ยะลา"],
    ...overrides,
  };
}

const routes: PublicRouteCard[] = [
  { slug: "betong-one-day", name: "เบตง 1 วัน", description: "จุดชมวิว คาเฟ่ และตลาด", days: 1, stopCount: 3, imageUrl: null, imageAlt: "เส้นทางเบตง 1 วัน" },
];

describe("HomepageDiscoveryWorkspace", () => {
  it("distinguishes an unavailable route feed from an empty route feed", () => {
    render(
      <HomepageDiscoveryWorkspace
        attractions={[attraction()]}
        routes={[]}
        routesUnavailable
      />,
    );

    expect(screen.getByText(/ยังโหลดเส้นทางแนะนำไม่ได้/)).toBeVisible();
    expect(screen.queryByText("เส้นทางที่เผยแพร่แล้วจะแสดงที่นี่")).not.toBeInTheDocument();
  });

  it("filters real attractions by their returned category", () => {
    render(
      <HomepageDiscoveryWorkspace
        attractions={[
          attraction(),
          attraction({ slug: "old-town", name: "ย่านเมืองเก่า", category: "วัฒนธรรม", tags: ["วัฒนธรรม", "ยะลา"] }),
        ]}
        routes={routes}
      />,
    );

    expect(screen.getByRole("link", { name: /ทะเลหมอกอัยเยอร์เวง/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ย่านเมืองเก่า/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "วัฒนธรรม" }));

    expect(screen.queryByRole("link", { name: /ทะเลหมอกอัยเยอร์เวง/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ย่านเมืองเก่า/ })).toBeInTheDocument();
  });

  it("shows ratings only when approved review data exists", () => {
    render(
      <HomepageDiscoveryWorkspace
        attractions={[
          attraction({ rating: 4.8, reviewCount: 12 }),
          attraction({ slug: "no-rating", name: "สถานที่ใหม่" }),
        ]}
        routes={routes}
      />,
    );

    expect(screen.getByText("4.8 (12)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /สถานที่ใหม่/ })).not.toHaveTextContent("0.0");
    expect(screen.getAllByText("ยังไม่มีภาพจาก CMS")).toHaveLength(2);
  });

  it("uses real coordinates for map context and real route links", () => {
    render(
      <HomepageDiscoveryWorkspace
        attractions={[attraction({ latitude: 5.949, longitude: 101.162 })]}
        routes={routes}
      />,
    );

    expect(screen.getByTitle("แผนที่ทะเลหมอกอัยเยอร์เวง")).toHaveAttribute(
      "src",
      "https://www.google.com/maps?q=5.949,101.162&z=12&output=embed",
    );
    expect(screen.getByRole("link", { name: /เบตง 1 วัน/ })).toHaveAttribute("href", "/routes/betong-one-day");
  });

  it("falls back to the attraction directory when coordinates are unavailable", () => {
    render(<HomepageDiscoveryWorkspace attractions={[attraction()]} routes={[]} />);

    expect(screen.queryByTitle(/แผนที่/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "เปิดรายชื่อสถานที่" })).toHaveAttribute("href", "/attractions");
  });
});
