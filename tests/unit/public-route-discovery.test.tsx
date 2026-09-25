import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RouteDiscovery } from "@/components/routes/RouteDiscovery";
import { PublicRouteTimeline } from "@/components/routes/PublicRouteTimeline";
import type { PublicRouteCard } from "@/lib/repositories/public-content.repository";

const routes: PublicRouteCard[] = [
  { slug: "town-day", name: "เที่ยวเมืองยะลา", description: "ตลาดและย่านเก่า", days: 1, stopCount: 3, imageUrl: null, imageAlt: "เที่ยวเมืองยะลา" },
  { slug: "forest-weekend", name: "ธรรมชาติยะลา", description: "เดินทางผ่านป่าและน้ำตก", days: 2, stopCount: 5, imageUrl: null, imageAlt: "ธรรมชาติยะลา" },
  { slug: "long-trip", name: "ทริปหลายวัน", description: "เส้นทางชุมชน", days: 4, stopCount: 8, imageUrl: null, imageAlt: "ทริปหลายวัน" },
];

describe("route discovery", () => {
  it("searches published route content and announces the result count", () => {
    render(<RouteDiscovery routes={routes} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "ค้นหาเส้นทาง" }), { target: { value: "น้ำตก" } });

    expect(screen.getByRole("link", { name: /ธรรมชาติยะลา/ })).toHaveAttribute("href", "/routes/forest-weekend");
    expect(screen.queryByRole("link", { name: /เที่ยวเมืองยะลา/ })).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("พบ 1 เส้นทาง");
  });

  it("filters by duration and restores all routes when cleared", () => {
    render(<RouteDiscovery routes={routes} />);

    fireEvent.click(screen.getByRole("button", { name: "2 วัน" }));
    expect(screen.getAllByRole("link", { name: /ดูแผนการเดินทาง/ })).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "ทุกระยะเวลา" }));
    expect(screen.getAllByRole("link", { name: /ดูแผนการเดินทาง/ })).toHaveLength(3);
  });

  it("shows a recoverable no-match state", () => {
    render(<RouteDiscovery routes={routes} />);

    fireEvent.change(screen.getByRole("searchbox", { name: "ค้นหาเส้นทาง" }), { target: { value: "ไม่มีเส้นทางนี้" } });

    expect(screen.getByText("ไม่พบเส้นทางที่ตรงกับการค้นหา")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "ล้างตัวกรอง" }));
    expect(screen.getAllByRole("link", { name: /ดูแผนการเดินทาง/ })).toHaveLength(3);
  });

  it("keeps the published-content empty state when there are no routes", () => {
    render(<RouteDiscovery routes={[]} />);

    expect(screen.getByText("กำลังเตรียมเส้นทางแนะนำ")).toBeVisible();
    expect(screen.getByRole("link", { name: "ดูสถานที่ท่องเที่ยว" })).toHaveAttribute("href", "/attractions");
  });
});

describe("route timeline navigation", () => {
  it("provides day jump links and an honest empty-stop state", () => {
    const { rerender } = render(<PublicRouteTimeline stops={[
      { attractionId: 1, dayNumber: 1, sequence: 1, attractionName: "จุดแรก", attractionSlug: "first", attractionImage: null, attractionImageAlt: "จุดแรก", latitude: null, longitude: null },
      { attractionId: 2, dayNumber: 2, sequence: 1, attractionName: "จุดสอง", attractionSlug: "second", attractionImage: null, attractionImageAlt: "จุดสอง", latitude: null, longitude: null },
    ]} />);

    const dayNav = screen.getByRole("navigation", { name: "เลือกวันในเส้นทาง" });
    expect(within(dayNav).getByRole("link", { name: "วันที่ 1" })).toHaveAttribute("href", "#route-day-1");
    expect(within(dayNav).getByRole("link", { name: "วันที่ 2" })).toHaveAttribute("href", "#route-day-2");

    rerender(<PublicRouteTimeline stops={[]} />);
    expect(screen.getByText("เส้นทางนี้ยังไม่มีจุดแวะที่เผยแพร่")).toBeVisible();
    expect(screen.getByRole("link", { name: "ดูสถานที่ท่องเที่ยว" })).toHaveAttribute("href", "/attractions");
  });
});
