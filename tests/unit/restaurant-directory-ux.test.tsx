import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RestaurantDiscoveryCard } from "@/components/restaurants/RestaurantDiscoveryCard";
import { RestaurantDiscoveryCta } from "@/components/restaurants/RestaurantDiscoveryCta";
import { RestaurantDiscoveryFilters } from "@/components/restaurants/RestaurantDiscoveryFilters";
import { RestaurantSidebar } from "@/components/restaurants/RestaurantSidebar";
import { SelectedRestaurantPlan } from "@/components/routes/SelectedRestaurantPlan";
import { TripShortlistProvider } from "@/components/trip-shortlist/TripShortlistProvider";
import type { PublicRestaurantCard } from "@/lib/repositories/public-content.repository";
import { RESTAURANT_SHORTLIST_KEY } from "@/lib/trip-shortlist/storage";

const restaurant: PublicRestaurantCard = {
  slug: "local-kitchen",
  name: "ครัวท้องถิ่นยะลา",
  province: "ยะลา",
  foodType: "Thai",
  description: "อาหารพื้นถิ่นจากข้อมูลร้านที่เผยแพร่",
  imageUrl: null,
  imageAlt: "ครัวท้องถิ่นยะลา",
  categories: [],
  latitude: 6.54,
  longitude: 101.28,
};

describe("restaurant directory production UX", () => {
  it("shows real restaurant fields without a fabricated rating", () => {
    render(
      <TripShortlistProvider storageKey={RESTAURANT_SHORTLIST_KEY} itemNoun="ร้านอาหาร">
        <RestaurantDiscoveryCard restaurant={restaurant} />
      </TripShortlistProvider>,
    );

    expect(screen.getByRole("link", { name: "ครัวท้องถิ่นยะลา" })).toHaveAttribute("href", "/restaurants/local-kitchen");
    expect(screen.getByText("ยะลา")).toBeInTheDocument();
    expect(screen.queryByText("4.8")).not.toBeInTheDocument();
    expect(screen.queryByText(/รีวิวจากนักเดินทาง/)).not.toBeInTheDocument();
  });

  it("uses the real public check-in entry and contains no fake newsletter form", () => {
    render(
      <TripShortlistProvider storageKey={RESTAURANT_SHORTLIST_KEY} itemNoun="ร้านอาหาร">
        <RestaurantSidebar shortlistItems={[]} />
      </TripShortlistProvider>,
    );

    expect(screen.getByRole("link", { name: "สแกน QR เพื่อเช็กอิน" })).toHaveAttribute("href", "/checkin/try");
    expect(screen.queryByPlaceholderText("กรอกอีเมลของคุณ")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ดูบทความและเรื่องราว" })).toHaveAttribute("href", "/stories");
  });

  it("preserves the query in category shortcuts and does not offer an unsupported district filter", () => {
    render(
      <RestaurantDiscoveryFilters
        query="โรตี"
        categorySlug="halal"
        categoryOptions={[{ value: "halal", label: "อาหารฮาลาล" }]}
      />,
    );

    expect(screen.queryByLabelText("อำเภอ")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "อาหารฮาลาล" })).toHaveAttribute(
      "href",
      "/restaurants?q=%E0%B9%82%E0%B8%A3%E0%B8%95%E0%B8%B5",
    );
    expect(screen.getByRole("link", { name: "ดูเส้นทาง" })).toHaveAttribute("href", "/routes");
  });

  it("renders selected restaurants as a real Google Maps meal plan", () => {
    render(<SelectedRestaurantPlan restaurants={[restaurant]} />);

    expect(screen.getByRole("heading", { name: "วางแผนจากร้านอาหารที่เลือก" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ครัวท้องถิ่นยะลา" })).toHaveAttribute("href", "/restaurants/local-kitchen");
    expect(screen.getByRole("link", { name: /เปิดเส้นทางร้านอาหารใน Google Maps/ })).toHaveAttribute(
      "href",
      expect.stringContaining("google.com/maps/search/"),
    );
  });

  it("preserves the admin-managed secondary CTA without faking a meal plan", () => {
    render(
      <TripShortlistProvider storageKey={RESTAURANT_SHORTLIST_KEY} itemNoun="ร้านอาหาร">
        <RestaurantDiscoveryCta
          title="วางแผนมื้ออร่อย"
          subtitle="เลือกร้านจากข้อมูลที่เผยแพร่จริง"
          linkText="ดูเส้นทางที่เผยแพร่"
          linkUrl="/routes"
        />
      </TripShortlistProvider>,
    );

    expect(screen.getByRole("link", { name: "ดูเส้นทางที่เผยแพร่" })).toHaveAttribute("href", "/routes");
    expect(screen.getByRole("link", { name: /เลือกร้านจากรายการด้านบน/ })).toHaveAttribute(
      "href",
      "#restaurant-results-heading",
    );
  });
});
