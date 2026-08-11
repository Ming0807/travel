import { fireEvent, render, screen } from "@testing-library/react";
import { createElement, type ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ fill: _fill, priority, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean }) =>
    createElement("img", { ...props, "data-priority": priority ? "true" : undefined }),
}));

import {
  HospitalityDetailHero,
  HospitalityInfoPanel,
  HospitalityRelatedAttractions,
} from "@/components/hospitality/HospitalityDetail";
import { buildHospitalityActions } from "@/lib/hospitality/public-detail";

describe("public hospitality detail", () => {
  it("builds only safe phone and coordinate actions", () => {
    expect(buildHospitalityActions({
      contactInfo: "+66 (0)73-000-000",
      latitude: 6.54,
      longitude: 101.28,
    })).toEqual([
      { kind: "phone", href: "tel:+66073000000" },
      { kind: "map", href: "https://www.google.com/maps/search/?api=1&query=6.54%2C101.28" },
    ]);
  });

  it("allows HTTPS websites and rejects unsafe contacts or coordinates", () => {
    expect(buildHospitalityActions({
      contactInfo: "https://stay.example/booking",
      latitude: 999,
      longitude: 101.28,
    })).toEqual([{ kind: "website", href: "https://stay.example/booking" }]);

    expect(buildHospitalityActions({
      contactInfo: "javascript:alert(1)",
      latitude: null,
      longitude: null,
    })).toEqual([]);
  });

  it("renders real contact and map actions without inventing booking", () => {
    render(
      <HospitalityInfoPanel
        kind="restaurant"
        category="Western / Thai"
        address="Mueang Yala"
        openingHours="08:00-20:00"
        priceRange={null}
        contactInfo="073-000-000"
        latitude={6.54}
        longitude={101.28}
      />,
    );

    expect(screen.getByRole("link", { name: "โทรหาร้านอาหาร" })).toHaveAttribute("href", "tel:073000000");
    expect(screen.getByRole("link", { name: "เปิดแผนที่" })).toHaveAttribute("href", expect.stringContaining("google.com/maps"));
    expect(screen.queryByRole("link", { name: /จอง/ })).not.toBeInTheDocument();
    expect(screen.getByText("08:00-20:00")).toBeVisible();
  });

  it("keeps restaurant and accommodation facts distinct", () => {
    const { rerender } = render(
      <HospitalityInfoPanel
        kind="restaurant"
        category="Thai"
        address={null}
        openingHours="09:00-18:00"
        priceRange={null}
        contactInfo={null}
        latitude={null}
        longitude={null}
      />,
    );

    expect(screen.getByText("ประเภทอาหาร")).toBeVisible();
    expect(screen.queryByText("ช่วงราคา")).not.toBeInTheDocument();

    rerender(
      <HospitalityInfoPanel
        kind="accommodation"
        category="Hotel"
        address={null}
        openingHours={null}
        priceRange="1,000-1,500 THB"
        contactInfo="https://stay.example"
        latitude={null}
        longitude={null}
      />,
    );

    expect(screen.getByText("ประเภทที่พัก")).toBeVisible();
    expect(screen.getByText("ช่วงราคา")).toBeVisible();
    expect(screen.getByRole("link", { name: "เปิดเว็บไซต์" })).toHaveAttribute("href", "https://stay.example/");
  });

  it("renders an optimized hero and honest related-image fallback", () => {
    render(
      <div>
        <HospitalityDetailHero
          name="Yala Kitchen"
          province="Yala"
          category="Thai"
          imageUrl="/site-media/restaurants/cover.webp"
          imageAlt="Restaurant storefront"
        />
        <HospitalityRelatedAttractions
          items={[{
            slug: "yala-old-town",
            name: "Yala Old Town",
            distanceText: "1 km",
            imageUrl: "/site-media/attractions/missing.webp",
            imageAlt: "Old town",
          }]}
        />
      </div>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Yala Kitchen" })).toBeVisible();
    expect(screen.getByRole("img", { name: "Restaurant storefront" })).toHaveAttribute(
      "sizes",
      "(max-width: 1023px) calc(100vw - 2rem), 1152px",
    );
    expect(screen.getByRole("img", { name: "Restaurant storefront" })).toHaveAttribute("data-priority", "true");

    fireEvent.error(screen.getByRole("img", { name: "Old town" }));
    expect(screen.getByText("ยังไม่มีรูปสถานที่")).toBeVisible();
    expect(screen.getByRole("link", { name: /Yala Old Town/ })).toHaveAttribute("href", "/attractions/yala-old-town");
  });
});
