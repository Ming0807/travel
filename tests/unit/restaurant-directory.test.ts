import { describe, expect, it } from "vitest";

import {
  filterRestaurantFoodTypeOptions,
  groupRestaurantsForDirectory,
} from "@/lib/hospitality/restaurant-directory";
import type { PublicRestaurantCard } from "@/lib/repositories/public-content.repository";

function restaurant(slug: string, foodType: string): PublicRestaurantCard {
  return {
    slug,
    name: slug,
    province: "ยะลา",
    foodType,
    description: "",
    imageUrl: null,
    imageAlt: slug,
  };
}

describe("restaurant directory grouping", () => {
  it("keeps only categories backed by published restaurants", () => {
    const options = [
      { value: "Thai", label: "อาหารไทย" },
      { value: "Malay", label: "อาหารมลายู" },
      { value: "Halal", label: "อาหารฮาลาล" },
      { value: "Coffee", label: "ร้านกาแฟ" },
    ];

    expect(filterRestaurantFoodTypeOptions(options, [" coffee ", "Western / Thai", "Malay"])).toEqual([
      { value: "Thai", label: "อาหารไทย" },
      { value: "Malay", label: "อาหารมลายู" },
      { value: "Coffee", label: "ร้านกาแฟ" },
    ]);
  });

  it("falls back to the controlled category list when availability cannot be loaded", () => {
    const options = [{ value: "Malay", label: "อาหารมลายู" }];
    expect(filterRestaurantFoodTypeOptions(options, null)).toEqual(options);
  });

  it("groups controlled food types into stable editorial sections", () => {
    const groups = groupRestaurantsForDirectory([
      restaurant("malay", "Malay"),
      restaurant("coffee", "Coffee"),
      restaurant("street", "Street Food"),
      restaurant("thai", "Thai"),
    ]);

    expect(groups.map((group) => group.key)).toEqual(["local", "meals", "cafes"]);
    expect(groups[0]?.items.map((item) => item.slug)).toEqual(["malay", "thai"]);
    expect(groups[1]?.items.map((item) => item.slug)).toEqual(["street"]);
    expect(groups[2]?.items.map((item) => item.slug)).toEqual(["coffee"]);
  });

  it("keeps unknown published food types visible in source order", () => {
    const groups = groupRestaurantsForDirectory([
      restaurant("first", "Community Kitchen"),
      restaurant("known", "Halal"),
      restaurant("second", "Seasonal"),
    ]);

    expect(groups.at(-1)?.key).toBe("other");
    expect(groups.at(-1)?.items.map((item) => item.slug)).toEqual(["first", "second"]);
  });

  it("does not emit empty sections", () => {
    expect(groupRestaurantsForDirectory([restaurant("bakery", "Bakery")])).toMatchObject([
      { key: "cafes", items: [{ slug: "bakery" }] },
    ]);
  });
});
