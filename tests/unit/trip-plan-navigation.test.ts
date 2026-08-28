import { describe, expect, it } from "vitest";

import {
  createGoogleMapsTripHref,
  createRestaurantPlanHref,
  createTripPlanHref,
  parseTripPlanSelection,
} from "@/lib/trip-shortlist/navigation";

describe("trip planning navigation", () => {
  it("normalizes a bounded unique list and rejects unsafe slugs", () => {
    expect(parseTripPlanSelection("wat-kuha-phimuk,wat-kuha-phimuk,../admin, YALA-CITY ")).toEqual([
      "wat-kuha-phimuk",
      "yala-city",
    ]);
  });

  it("creates a shareable internal planning URL", () => {
    expect(createTripPlanHref(["wat-kuha-phimuk", "yala-city-pillar"]))
      .toBe("/routes?selected=wat-kuha-phimuk,yala-city-pillar");
    expect(createTripPlanHref([])).toBe("/routes");
    expect(createRestaurantPlanHref(["local-kitchen", "morning-roti"]))
      .toBe("/routes?restaurants=local-kitchen,morning-roti");
    expect(createRestaurantPlanHref([])).toBe("/routes");
  });

  it("creates Google Maps search and multi-stop directions URLs", () => {
    const single = createGoogleMapsTripHref([{ name: "วัดคูหาภิมุข", latitude: 6.54, longitude: 101.28 }]);
    expect(single).toContain("google.com/maps/search/");
    expect(single).toContain("6.54%2C101.28");

    const route = createGoogleMapsTripHref([
      { name: "จุดหนึ่ง", latitude: 6.5, longitude: 101.2 },
      { name: "จุดสอง" },
      { name: "จุดสาม", latitude: 6.6, longitude: 101.3 },
    ]);
    expect(route).toContain("google.com/maps/dir/");
    expect(route).toContain("origin=6.5%2C101.2");
    expect(route).toContain("waypoints=");
    expect(route).toContain("destination=6.6%2C101.3");
  });
});
