import { render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { SelectedTripPlan } from "@/components/routes/SelectedTripPlan";
import { SelectedRestaurantPlan } from "@/components/routes/SelectedRestaurantPlan";
import type { AttractionCard } from "@/types/tourism";
import type { PublicRestaurantCard } from "@/lib/repositories/public-content.repository";

const places: Array<AttractionCard & PublicRestaurantCard> = Array.from({ length: 12 }, (_, index) => ({
  slug: `fixture-${index + 1}`, name: `Fixture ${index + 1}`, province: "พื้นที่ทดสอบ",
  category: "Test", foodType: "Test", description: "", imageUrl: null, imageAlt: "", tags: [],
  latitude: 6.54, longitude: 101.28,
}));

afterEach(() => vi.restoreAllMocks());

it.each(["attractions", "restaurants"] as const)("retains all selected %s and distinct link keys for shared coordinates", (kind) => {
  const errors = vi.spyOn(console, "error");
  render(kind === "attractions" ? <SelectedTripPlan attractions={places} /> : <SelectedRestaurantPlan restaurants={places} />);
  expect(screen.getByRole("link", { name: "Fixture 12" })).toBeInTheDocument();
  const links = screen.getAllByRole("link", { name: /^Google Maps:/ });
  expect(links).toHaveLength(3);
  expect(links.map((link) => link.textContent?.trim())).toEqual(kind === "attractions"
    ? ["Google Maps: จุด 1-5", "Google Maps: จุด 5-9", "Google Maps: จุด 9-12"]
    : ["Google Maps: ร้าน 1-5", "Google Maps: ร้าน 5-9", "Google Maps: ร้าน 9-12"]);
  expect(errors).not.toHaveBeenCalled();
});
