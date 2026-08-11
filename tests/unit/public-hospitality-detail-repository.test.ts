import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { state, client, mediaQuery } = vi.hoisted(() => {
  type Result = { data: Record<string, unknown> | null; error: unknown };
  const state = {
    restaurantResult: { data: null, error: null } as Result,
    accommodationResult: { data: null, error: null } as Result,
    restaurantSelect: "",
    accommodationSelect: "",
  };

  const builder = (kind: "restaurant" | "accommodation") => {
    const query: Record<string, ReturnType<typeof vi.fn>> = {};
    query.select = vi.fn((value: string) => {
      state[`${kind}Select`] = value;
      return query;
    });
    query.eq = vi.fn().mockReturnValue(query);
    query.in = vi.fn().mockReturnValue(query);
    query.maybeSingle = vi.fn().mockImplementation(async () => state[`${kind}Result`]);
    return query;
  };

  const client = {
    from: vi.fn((table: string) => {
      if (table === "restaurants") return builder("restaurant");
      if (table === "accommodations") return builder("accommodation");
      if (table === "media_assets") return mediaQuery;
      throw new Error(`Unexpected table: ${table}`);
    }),
  };

  const mediaQuery: Record<string, ReturnType<typeof vi.fn>> = {};
  mediaQuery.select = vi.fn().mockReturnValue(mediaQuery);
  mediaQuery.in = vi.fn().mockResolvedValue({ data: [], error: null });

  return { state, client, mediaQuery };
});

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue(client),
}));

vi.mock("@/lib/repositories/destination-scope.repository", () => ({
  listLiveDestinationProvinceIds: vi.fn().mockResolvedValue([1]),
  listLiveDestinationProvinces: vi.fn().mockResolvedValue([
    { provinceId: 1, nameTh: "Yala", nameEn: "Yala", displayOrder: 1 },
  ]),
}));

import {
  getPublicAccommodationDetail,
  getPublicRestaurantDetail,
} from "@/lib/repositories/public-content.repository";

function attraction(overrides: Record<string, unknown> = {}) {
  return {
    slug: "yala-old-town",
    name_th: "Yala Old Town",
    name_en: null,
    province_id: 1,
    is_published: true,
    is_active: true,
    content_media: [{
      storage_path: "attractions/yala-old-town.webp",
      is_cover: true,
      is_active: true,
      lifecycle_status: "active",
      display_order: 0,
    }],
    ...overrides,
  };
}

const restaurantRow = {
  restaurant_id: 9,
  province_id: 1,
  slug: "yala-kitchen",
  name_th: "Yala Kitchen",
  name_en: null,
  description_th: "Local food",
  description_en: null,
  food_type: "Western / Thai",
  latitude: 6.54,
  longitude: 101.28,
  address_text: "Mueang Yala",
  opening_hours: "08:00-20:00",
  contact_info: "073-000-000",
  is_published: true,
  provinces: { province_name_th: "Yala", province_name_en: "Yala", province_id: 1 },
  content_media: [{
    storage_path: "restaurants/yala-kitchen.webp",
    alt_text_th: "Restaurant storefront",
    alt_text_en: null,
    is_cover: true,
    is_active: true,
    lifecycle_status: "active",
    display_order: 0,
  }],
  restaurant_attractions: [
    { distance_text: "1 km", attractions: attraction() },
    { distance_text: "2 km", attractions: attraction({ slug: "draft", is_published: false }) },
    { distance_text: "3 km", attractions: attraction({ slug: "inactive", is_active: false }) },
    { distance_text: "4 km", attractions: attraction({ slug: "outside-yala", province_id: 2 }) },
  ],
};

const accommodationRow = {
  accommodation_id: 5,
  province_id: 1,
  slug: "yala-stay",
  name_th: "Yala Stay",
  name_en: null,
  description_th: "City accommodation",
  description_en: null,
  accommodation_type: "Hotel",
  latitude: 6.55,
  longitude: 101.29,
  address_text: "Mueang Yala",
  contact_info: "https://stay.example",
  price_range: "1,000-1,500 THB",
  is_published: true,
  provinces: { province_name_th: "Yala", province_name_en: "Yala", province_id: 1 },
  content_media: [],
  attraction_related_accommodations: [
    { attractions: attraction() },
    { attractions: attraction({ slug: "draft", is_published: false }) },
  ],
};

describe("public hospitality detail repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.restaurantSelect = "";
    state.accommodationSelect = "";
    state.restaurantResult = { data: restaurantRow, error: null };
    state.accommodationResult = { data: accommodationRow, error: null };
    mediaQuery.select.mockReturnValue(mediaQuery);
    mediaQuery.in.mockResolvedValue({
      data: [{
        storage_path: "attractions/yala-old-town.webp",
        thumbnail_storage_path: "attractions/yala-old-town_thumb.webp",
      }],
      error: null,
    });
  });

  it("returns an explicit restaurant DTO and only public Yala related attractions", async () => {
    const result = await getPublicRestaurantDetail("yala-kitchen");

    expect(state.restaurantSelect).not.toContain("*");
    expect(state.restaurantSelect).toContain("restaurant_id");
    expect(state.restaurantSelect).toContain("is_published");
    expect(result).toMatchObject({
      restaurantId: 9,
      slug: "yala-kitchen",
      imageUrl: "/site-media/restaurants/yala-kitchen.webp",
      imageAlt: "Restaurant storefront",
    });
    expect(result?.nearbyAttractions.map((item) => item.slug)).toEqual(["yala-old-town"]);
    expect(result?.nearbyAttractions[0].imageUrl).toBe("/site-media/attractions/yala-old-town_thumb.webp");
  });

  it("returns an explicit accommodation DTO and excludes unpublished relations", async () => {
    const result = await getPublicAccommodationDetail("yala-stay");

    expect(state.accommodationSelect).not.toContain("*");
    expect(state.accommodationSelect).toContain("accommodation_id");
    expect(state.accommodationSelect).toContain("is_active");
    expect(result).toMatchObject({
      accommodationId: 5,
      slug: "yala-stay",
      imageUrl: null,
      imageAlt: "Yala Stay",
    });
    expect(result?.nearbyAttractions.map((item) => item.slug)).toEqual(["yala-old-town"]);
  });

  it("returns null only for a true miss and surfaces query failures", async () => {
    state.restaurantResult = { data: null, error: null };
    await expect(getPublicRestaurantDetail("missing")).resolves.toBeNull();

    state.accommodationResult = { data: null, error: { message: "offline" } };
    await expect(getPublicAccommodationDetail("yala-stay"))
      .rejects.toThrow("PUBLIC_ACCOMMODATION_DETAIL_FAILED");
  });
});
