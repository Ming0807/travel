import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  AccommodationDiscoveryCard,
  RestaurantDiscoveryCard,
} from "@/components/hospitality/HospitalityDiscoveryCard";

describe("hospitality discovery cards", () => {
  it("shows only truthful restaurant decision fields", () => {
    render(
      <RestaurantDiscoveryCard
        restaurant={{
          slug: "local-kitchen",
          name: "Local Kitchen",
          province: "Yala",
          foodType: "Malay",
          description: "Local food",
          imageUrl: null,
          imageAlt: "Local Kitchen",
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Local Kitchen" })).toHaveAttribute(
      "href",
      "/restaurants/local-kitchen",
    );
    expect(screen.getByText("อาหารมลายู")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "ยังไม่มีภาพของLocal Kitchen" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ดูข้อมูลร้านอาหาร/ })).toHaveAttribute(
      "href",
      "/restaurants/local-kitchen",
    );
    expect(screen.queryByText(/rating|review/i)).not.toBeInTheDocument();
  });

  it("keeps accommodation type and price visible", () => {
    render(
      <AccommodationDiscoveryCard
        accommodation={{
          slug: "city-hotel",
          name: "City Hotel",
          province: "Yala",
          accommodationType: "Hotel",
          description: "Central stay",
          imageUrl: null,
          imageAlt: "City Hotel",
          priceRange: "1,000-1,500 THB",
        }}
      />,
    );

    expect(screen.getByText("โรงแรม")).toBeInTheDocument();
    expect(screen.getByText("1,000-1,500 THB")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ดูข้อมูลที่พัก/ })).toHaveAttribute(
      "href",
      "/accommodations/city-hotel",
    );
  });
});
