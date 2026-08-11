import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { restaurantQuery, accommodationQuery, mediaQuery, supabaseClient } = vi.hoisted(() => {
  const builder = (methods: string[]) => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    methods.forEach((method) => {
      chain[method] = vi.fn().mockReturnValue(chain);
    });
    return chain;
  };

  const restaurants = builder(["select", "eq", "ilike", "in", "or", "order", "range"]);
  const accommodations = builder(["select", "eq", "ilike", "in", "or", "order", "range"]);
  const media = builder(["select", "in"]);
  const client = {
    from: vi.fn((table: string) => {
      if (table === "restaurants") return restaurants;
      if (table === "accommodations") return accommodations;
      if (table === "media_assets") return media;
      throw new Error(`Unexpected table: ${table}`);
    }),
  };

  return {
    restaurantQuery: restaurants,
    accommodationQuery: accommodations,
    mediaQuery: media,
    supabaseClient: client,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue(supabaseClient),
}));

vi.mock("@/lib/repositories/destination-scope.repository", () => ({
  listLiveDestinationProvinces: vi.fn().mockResolvedValue([
    { provinceId: 1, nameTh: "Yala", nameEn: "Yala", displayOrder: 1 },
  ]),
  listLiveDestinationProvinceIds: vi.fn().mockResolvedValue([1]),
}));

import {
  listPublicAccommodationPage,
  listPublicRestaurantPage,
} from "@/lib/repositories/public-content.repository";

const restaurantRow = {
  restaurant_id: 11,
  slug: "local-kitchen",
  name_th: "Local Kitchen",
  name_en: null,
  description_th: "Local food",
  description_en: null,
  food_type: "Western / Thai",
  provinces: { province_name_th: "Yala", province_name_en: "Yala" },
  content_media: [{
    storage_path: "restaurants/cover.webp",
    alt_text_th: "Local food",
    alt_text_en: null,
    is_cover: true,
    is_active: true,
    lifecycle_status: "active",
    display_order: 0,
  }],
};

const accommodationRow = {
  accommodation_id: 21,
  slug: "city-hotel",
  name_th: "City Hotel",
  name_en: null,
  description_th: "Central stay",
  description_en: null,
  accommodation_type: "Hotel",
  price_range: "1,000-1,500 THB",
  provinces: { province_name_th: "Yala", province_name_en: "Yala" },
  content_media: [{
    storage_path: "accommodations/cover.webp",
    alt_text_th: "Hotel room",
    alt_text_en: null,
    is_cover: true,
    is_active: true,
    lifecycle_status: "active",
    display_order: 0,
  }],
};

describe("public hospitality listings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const query of [restaurantQuery, accommodationQuery]) {
      for (const method of ["select", "eq", "ilike", "in", "or", "order"]) {
        query[method].mockReturnValue(query);
      }
      query.range.mockResolvedValue({ data: [], error: null, count: 0 });
    }
    mediaQuery.select.mockReturnValue(mediaQuery);
    mediaQuery.in.mockResolvedValue({ data: [], error: null });
  });

  it("filters and paginates restaurants over the complete published dataset", async () => {
    restaurantQuery.range.mockResolvedValue({ data: [restaurantRow], error: null, count: 31 });
    mediaQuery.in.mockResolvedValue({
      data: [{
        storage_path: "restaurants/cover.webp",
        thumbnail_storage_path: "restaurants/cover_thumb.webp",
      }],
      error: null,
    });

    const result = await listPublicRestaurantPage({
      query: "food%_,",
      foodType: "Thai",
      province: "Yala",
      page: 3,
      pageSize: 12,
    });

    expect(restaurantQuery.select).toHaveBeenCalledWith(expect.stringContaining("content_media"), { count: "exact" });
    expect(restaurantQuery.eq).toHaveBeenCalledWith("is_published", true);
    expect(restaurantQuery.eq).toHaveBeenCalledWith("is_active", true);
    expect(restaurantQuery.in).toHaveBeenCalledWith("province_id", [1]);
    expect(restaurantQuery.eq).toHaveBeenCalledWith("provinces.province_name_en", "Yala");
    expect(restaurantQuery.ilike).toHaveBeenCalledWith("food_type", "%Thai%");
    expect(restaurantQuery.or).toHaveBeenCalledWith(
      "name_th.ilike.%food\\%\\_%,name_en.ilike.%food\\%\\_%,slug.ilike.%food\\%\\_%",
    );
    expect(restaurantQuery.range).toHaveBeenCalledWith(24, 35);
    expect(result).toMatchObject({ state: "available", total: 31, page: 3, pageCount: 3 });
    expect(result.items[0]).toMatchObject({
      slug: "local-kitchen",
      imageUrl: "/site-media/restaurants/cover_thumb.webp",
    });
  });

  it("filters accommodation type on the server and returns an exact total", async () => {
    accommodationQuery.range.mockResolvedValue({ data: [accommodationRow], error: null, count: 14 });

    const result = await listPublicAccommodationPage({
      query: "city",
      accommodationType: "Hotel",
      province: "Yala",
      page: 2,
      pageSize: 8,
    });

    expect(accommodationQuery.eq).toHaveBeenCalledWith("accommodation_type", "Hotel");
    expect(accommodationQuery.eq).toHaveBeenCalledWith("provinces.province_name_en", "Yala");
    expect(accommodationQuery.range).toHaveBeenCalledWith(8, 15);
    expect(result).toMatchObject({ state: "available", total: 14, page: 2, pageCount: 2 });
    expect(result.items[0]).toMatchObject({ slug: "city-hotel", priceRange: "1,000-1,500 THB" });
  });

  it("distinguishes query failures from a truthful empty result", async () => {
    restaurantQuery.range.mockResolvedValue({ data: null, error: { message: "offline" }, count: null });

    const unavailable = await listPublicRestaurantPage({ page: 1, pageSize: 12 });
    const empty = await listPublicAccommodationPage({ page: 1, pageSize: 12 });

    expect(unavailable).toEqual({ items: [], total: 0, page: 1, pageCount: 0, state: "unavailable" });
    expect(empty).toEqual({ items: [], total: 0, page: 1, pageCount: 0, state: "empty" });
  });

  it("does not expose third-party stock URLs as managed hospitality media", async () => {
    restaurantQuery.range.mockResolvedValue({
      data: [{
        ...restaurantRow,
        content_media: [{
          ...restaurantRow.content_media[0],
          storage_path: "https://images.unsplash.com/photo-missing",
        }],
      }],
      error: null,
      count: 1,
    });

    const result = await listPublicRestaurantPage({ page: 1, pageSize: 12 });

    expect(result.items[0].imageUrl).toBeNull();
  });
});
