import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { RouteDiscovery } from "@/components/routes/RouteDiscovery";
import type { PublicRouteCard } from "@/lib/repositories/public-content.repository";

const routes: PublicRouteCard[] = [
  { slug: "town-day", name: "เที่ยวเมืองยะลา", description: "ตลาดและย่านเก่า", days: 1, stopCount: 3, imageUrl: null, imageAlt: "เที่ยวเมืองยะลา" },
  { slug: "forest-weekend", name: "ธรรมชาติยะลา", description: "เดินทางผ่านป่าและน้ำตก", days: 2, stopCount: 5, imageUrl: null, imageAlt: "ธรรมชาติยะลา" },
  { slug: "long-trip", name: "ทริปหลายวัน", description: "เส้นทางชุมชน", days: 4, stopCount: 8, imageUrl: null, imageAlt: "ทริปหลายวัน" },
  { slug: "heritage-day", name: "ย่านวัฒนธรรม", description: "เดินชมเมืองและชุมชน", days: 1, stopCount: 4, imageUrl: null, imageAlt: "ย่านวัฒนธรรม" },
];

it("does not leave a hidden search filter excluding routes when the directory shrinks below the filter threshold", () => {
  const { rerender } = render(<RouteDiscovery routes={routes} />);

  fireEvent.change(screen.getByRole("searchbox", { name: "ค้นหาเส้นทาง" }), {
    target: { value: "ธรรมชาติ" },
  });
  expect(screen.getAllByRole("link", { name: /ดูแผนการเดินทาง/ })).toHaveLength(1);

  rerender(<RouteDiscovery routes={routes.slice(1)} />);

  expect(screen.queryByRole("searchbox", { name: "ค้นหาเส้นทาง" })).not.toBeInTheDocument();
  expect(screen.getAllByRole("link", { name: /ดูแผนการเดินทาง/ })).toHaveLength(3);
});
