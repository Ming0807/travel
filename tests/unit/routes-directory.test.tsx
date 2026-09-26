import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RouteDiscovery } from "@/components/routes/RouteDiscovery";
import type { PublicRouteCard } from "@/lib/repositories/public-content.repository";

const routes: PublicRouteCard[] = [
  {
    slug: "na-tham",
    name: "เที่ยวชุมชนหน้าถ้ำ",
    description: "เดินทางผ่านเรื่องราวและวิถีชุมชน",
    days: 1,
    stopCount: 3,
    imageUrl: "/site-media/routes/na-tham.webp",
    imageAlt: "บรรยากาศเส้นทางชุมชนหน้าถ้ำ",
  },
  {
    slug: "yala-city",
    name: "ย่านเมืองยะลา",
    description: "แวะชมเมืองและสถานที่สำคัญ",
    days: 2,
    stopCount: 4,
    imageUrl: "/site-media/routes/yala-city.webp",
    imageAlt: "ถนนในย่านเมืองยะลา",
  },
];

describe("public routes directory", () => {
  it("presents a small published selection as an image-led, accessible list without redundant filters", () => {
    render(<RouteDiscovery routes={routes} />);

    const list = screen.getByRole("list", { name: "เส้นทางท่องเที่ยวที่เผยแพร่" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(within(list).getByRole("link", { name: /เที่ยวชุมชนหน้าถ้ำ/ })).toHaveAttribute("href", "/routes/na-tham");
    expect(within(list).getByRole("img", { name: "บรรยากาศเส้นทางชุมชนหน้าถ้ำ" })).toHaveAttribute("src", expect.stringContaining("na-tham.webp"));
    expect(within(list).getByText("1 วัน")).toBeInTheDocument();
    expect(within(list).getByText("3 จุดแวะ")).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "ระยะเวลาเดินทาง" })).not.toBeInTheDocument();
  });

  it("keeps the published-route empty state actionable", () => {
    render(<RouteDiscovery routes={[]} />);

    expect(screen.getByText("กำลังเตรียมเส้นทางแนะนำ")).toBeVisible();
    expect(screen.getByRole("link", { name: "ดูสถานที่ท่องเที่ยว" })).toHaveAttribute("href", "/attractions");
  });
});
