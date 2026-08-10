import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { state, client } = vi.hoisted(() => {
  const state = {
    initialResult: { data: null as Record<string, unknown> | null, error: null as unknown },
    publicFilters: [] as Array<[string, unknown]>,
    tables: [] as string[],
  };

  const relationResult = { data: [], error: null };
  const relationBuilder = () => {
    const query: Record<string, ReturnType<typeof vi.fn>> = {};
    query.select = vi.fn().mockReturnValue(query);
    query.eq = vi.fn().mockReturnValue(query);
    query.order = vi.fn().mockResolvedValue(relationResult);
    return query;
  };

  const attractionBuilder = () => {
    const query: Record<string, ReturnType<typeof vi.fn>> = {};
    query.select = vi.fn().mockReturnValue(query);
    query.eq = vi.fn((column: string, value: unknown) => {
      state.publicFilters.push([column, value]);
      return query;
    });
    query.in = vi.fn().mockReturnValue(query);
    query.maybeSingle = vi.fn().mockImplementation(async () => state.initialResult);
    return query;
  };

  const allowedRelations = new Set([
    "attraction_related_attractions",
    "attraction_related_restaurants",
    "attraction_related_accommodations",
    "attraction_related_stories",
  ]);

  const client = {
    from: vi.fn((table: string) => {
      state.tables.push(table);
      if (table === "attractions" && state.tables.length === 1) return attractionBuilder();
      if (allowedRelations.has(table)) return relationBuilder();
      throw new Error(`Unexpected detail fallback query: ${table}`);
    }),
  };

  return { state, client };
});

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue(client),
}));

vi.mock("@/lib/repositories/destination-scope.repository", () => ({
  listLiveDestinationProvinceIds: vi.fn().mockResolvedValue([1]),
  listLiveDestinationProvinces: vi.fn().mockResolvedValue([
    { provinceId: 1, nameTh: "ยะลา", nameEn: "Yala", displayOrder: 1 },
  ]),
}));

import {
  getAdminAttractionPreview,
  getPublicAttractionDetail,
} from "@/lib/repositories/public-content.repository";

const attractionRow = {
  attraction_id: 12,
  slug: "yala-old-town",
  name_th: "ย่านเมืองเก่ายะลา",
  name_en: "Yala Old Town",
  short_description_th: "เดินชมเมืองเก่า",
  short_description_en: null,
  description_th: "เรื่องราวของย่านเมืองเก่า",
  description_en: null,
  travel_tips_th: "พกร่ม",
  how_to_get_there_th: "เดินทางจากตัวเมือง",
  address_text: "อำเภอเมืองยะลา",
  opening_hours: "08:00-17:00",
  contact_info: null,
  latitude: 6.54,
  longitude: 101.28,
  provinces: { province_name_th: "ยะลา", province_name_en: "Yala" },
  attraction_types: { type_name_th: "วัฒนธรรม", type_name_en: "Culture" },
  content_media: [
    {
      storage_path: "attractions/cover.webp",
      media_type: "image",
      alt_text_th: "อาคารเก่า",
      alt_text_en: null,
      is_cover: true,
      is_active: true,
      lifecycle_status: "active",
      display_order: 5,
    },
  ],
};

describe("getPublicAttractionDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.initialResult = { data: attractionRow, error: null };
    state.publicFilters.length = 0;
    state.tables.length = 0;
  });

  it("returns only curated related content and does not invent province-wide recommendations", async () => {
    const result = await getPublicAttractionDetail("yala-old-town");

    expect(result).toMatchObject({
      attractionId: 12,
      slug: "yala-old-town",
      name: "ย่านเมืองเก่ายะลา",
      attractionType: "วัฒนธรรม",
      openingHours: "08:00-17:00",
      mainImage: { url: "/site-media/attractions/cover.webp", alt: "อาคารเก่า" },
      thingsToDo: [],
      whereToStay: [],
      foodAndDrink: [],
      articles: [],
    });
    expect(state.tables).toEqual([
      "attractions",
      "attraction_related_attractions",
      "attraction_related_restaurants",
      "attraction_related_accommodations",
      "attraction_related_stories",
    ]);
  });

  it("surfaces a database failure instead of converting it to a not-found response", async () => {
    state.initialResult = { data: null, error: { message: "database unavailable" } };

    await expect(getPublicAttractionDetail("yala-old-town"))
      .rejects.toThrow("PUBLIC_ATTRACTION_DETAIL_FAILED");
  });

  it("returns null only when the public attraction truly does not exist", async () => {
    state.initialResult = { data: null, error: null };

    await expect(getPublicAttractionDetail("missing-place")).resolves.toBeNull();
  });

  it("keeps admin preview loading separate from public publication filters", async () => {
    await getAdminAttractionPreview("yala-old-town");

    expect(state.publicFilters).not.toContainEqual(["is_published", true]);
    expect(state.publicFilters).not.toContainEqual(["is_active", true]);
  });
});
