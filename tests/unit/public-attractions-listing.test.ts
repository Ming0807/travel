import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const {
  attractionQuery,
  mediaQuery,
  reviewQuery,
  supabaseClient,
} = vi.hoisted(() => {
  const builder = (methods: string[]) => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    methods.forEach((method) => {
      chain[method] = vi.fn().mockReturnValue(chain);
    });
    return chain;
  };

  const attractions = builder(["select", "eq", "in", "or", "order", "range"]);
  const media = builder(["select", "in"]);
  const reviews = builder(["select", "in", "eq", "is"]);
  const client = {
    from: vi.fn((table: string) => {
      if (table === "attractions") return attractions;
      if (table === "media_assets") return media;
      if (table === "reviews") return reviews;
      throw new Error(`Unexpected table: ${table}`);
    }),
  };

  return {
    attractionQuery: attractions,
    mediaQuery: media,
    reviewQuery: reviews,
    supabaseClient: client,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue(supabaseClient),
}));

vi.mock("@/lib/repositories/destination-scope.repository", () => ({
  listLiveDestinationProvinces: vi.fn().mockResolvedValue([
    { provinceId: 1, nameTh: "ยะลา", nameEn: "Yala", displayOrder: 1 },
  ]),
  listLiveDestinationProvinceIds: vi.fn().mockResolvedValue([1]),
}));

import { listPublicAttractionPage } from "@/lib/repositories/public-content.repository";

const attractionRow = {
  attraction_id: 11,
  slug: "aiyerweng-skywalk",
  name_th: "สกายวอล์คอัยเยอร์เวง",
  name_en: "Aiyerweng Skywalk",
  short_description_th: "ชมทะเลหมอกเหนือผืนป่าฮาลา-บาลา",
  short_description_en: null,
  latitude: 5.94,
  longitude: 101.18,
  provinces: { province_name_th: "ยะลา", province_name_en: "Yala" },
  districts: { district_name_th: "เบตง", district_name_en: "Betong" },
  attraction_types: { type_name_th: "ธรรมชาติ", type_name_en: "Nature" },
  content_media: [
    {
      storage_path: "attractions/aiyerweng.webp",
      alt_text_th: "ทะเลหมอกอัยเยอร์เวง",
      alt_text_en: null,
      is_cover: true,
      is_active: true,
      lifecycle_status: "active",
      display_order: 0,
    },
  ],
};

describe("listPublicAttractionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    ["select", "eq", "in", "or", "order"].forEach((method) => {
      attractionQuery[method].mockReturnValue(attractionQuery);
    });
    mediaQuery.select.mockReturnValue(mediaQuery);
    reviewQuery.select.mockReturnValue(reviewQuery);
    reviewQuery.in.mockReturnValue(reviewQuery);
    reviewQuery.eq.mockReturnValue(reviewQuery);

    attractionQuery.range.mockResolvedValue({ data: [], error: null, count: 0 });
    mediaQuery.in.mockResolvedValue({ data: [], error: null });
    reviewQuery.is.mockResolvedValue({ data: [], error: null });
  });

  it("combines server-side filters, escapes wildcard input, and returns exact pagination", async () => {
    attractionQuery.range.mockResolvedValue({
      data: [attractionRow],
      error: null,
      count: 11,
    });

    const result = await listPublicAttractionPage({
      query: "น้ำตก%_,",
      province: "Yala",
      type: "Nature",
      page: 2,
      pageSize: 6,
    });

    expect(attractionQuery.select).toHaveBeenCalledWith(
      expect.stringContaining("content_media"),
      { count: "exact" },
    );
    expect(attractionQuery.select).toHaveBeenCalledWith(
      expect.stringContaining(
        "attraction_types!attractions_attraction_type_id_fkey",
      ),
      { count: "exact" },
    );
    expect(attractionQuery.eq).toHaveBeenCalledWith("is_published", true);
    expect(attractionQuery.eq).toHaveBeenCalledWith("is_active", true);
    expect(attractionQuery.in).toHaveBeenCalledWith("province_id", [1]);
    expect(attractionQuery.eq).toHaveBeenCalledWith("provinces.province_name_en", "Yala");
    expect(attractionQuery.select).toHaveBeenCalledWith(
      expect.stringContaining("category_filter:attraction_type_assignments!inner"),
      { count: "exact" },
    );
    expect(attractionQuery.eq).toHaveBeenCalledWith(
      "category_filter.attraction_types.type_name_en",
      "Nature",
    );
    expect(attractionQuery.or).toHaveBeenCalledWith(
      "name_th.ilike.%น้ำตก\\%\\_%,name_en.ilike.%น้ำตก\\%\\_%,slug.ilike.%น้ำตก\\%\\_%",
    );
    expect(attractionQuery.range).toHaveBeenCalledWith(6, 11);
    expect(result).toMatchObject({ total: 11, page: 2, pageCount: 2 });
    expect(result.items[0]).toMatchObject({
      slug: "aiyerweng-skywalk",
      district: "เบตง",
      rating: null,
      reviewCount: null,
      reviewState: "empty",
    });
    expect("attractionId" in result.items[0]).toBe(false);
  });

  it("normalizes invalid page inputs and reports a truthful empty result", async () => {
    const result = await listPublicAttractionPage({ page: -3, pageSize: 0 });

    expect(attractionQuery.range).toHaveBeenCalledWith(0, 11);
    expect(result).toEqual({ items: [], total: 0, page: 1, pageCount: 0 });
  });

  it("rejects page numbers outside the supported public range", async () => {
    const result = await listPublicAttractionPage({
      page: Number.MAX_SAFE_INTEGER,
      pageSize: 12,
    });

    expect(attractionQuery.range).toHaveBeenCalledWith(0, 11);
    expect(result.page).toBe(1);
  });

  it("uses managed thumbnails and approved review summaries without inventing fallback values", async () => {
    attractionQuery.range.mockResolvedValue({
      data: [attractionRow],
      error: null,
      count: 1,
    });
    mediaQuery.in.mockResolvedValue({
      data: [
        {
          storage_path: "attractions/aiyerweng.webp",
          thumbnail_storage_path: "attractions/aiyerweng_thumb.webp",
        },
      ],
      error: null,
    });
    reviewQuery.is.mockResolvedValue({
      data: [
        { attraction_id: 11, rating: 4 },
        { attraction_id: 11, rating: 5 },
      ],
      error: null,
    });

    const result = await listPublicAttractionPage({ page: 1, pageSize: 12 });

    expect(result.items[0]).toMatchObject({
      imageUrl: "/site-media/attractions/aiyerweng_thumb.webp",
      rating: 4.5,
      reviewCount: 2,
      reviewState: "available",
    });
  });

  it("marks review summaries unavailable when the review query fails", async () => {
    attractionQuery.range.mockResolvedValue({
      data: [attractionRow],
      error: null,
      count: 1,
    });
    reviewQuery.is.mockResolvedValue({
      data: null,
      error: { message: "reviews unavailable" },
    });

    const result = await listPublicAttractionPage({ page: 1, pageSize: 12 });

    expect(result.items[0]).toMatchObject({
      rating: null,
      reviewCount: null,
      reviewState: "unavailable",
    });
  });

  it("surfaces listing query failures instead of presenting them as no results", async () => {
    attractionQuery.range.mockResolvedValue({
      data: null,
      error: { message: "database unavailable" },
      count: null,
    });

    await expect(
      listPublicAttractionPage({ page: 1, pageSize: 12 }),
    ).rejects.toThrow("PUBLIC_ATTRACTION_LIST_FAILED");
  });
});
