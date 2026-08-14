import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { state, client } = vi.hoisted(() => {
  const state = {
    initialResult: { data: null as Record<string, unknown> | null, error: null as unknown },
    settingsResult: {
      data: [
        { content_type: "attractions", mode: "hidden", max_items: 4 },
        { content_type: "restaurants", mode: "hidden", max_items: 4 },
        { content_type: "accommodations", mode: "hidden", max_items: 4 },
        { content_type: "stories", mode: "hidden", max_items: 3 },
      ],
      error: null as unknown,
    },
    publicFilters: [] as Array<[string, unknown]>,
    tables: [] as string[],
    attractionSelects: [] as string[],
  };

  const relationResult = { data: [], error: null };
  const relationBuilder = () => {
    const query: Record<string, ReturnType<typeof vi.fn>> = {};
    query.select = vi.fn().mockReturnValue(query);
    query.eq = vi.fn().mockReturnValue(query);
    query.order = vi.fn().mockResolvedValue(relationResult);
    return query;
  };

  const settingsBuilder = () => {
    const query: Record<string, ReturnType<typeof vi.fn>> = {};
    query.select = vi.fn().mockReturnValue(query);
    query.eq = vi.fn().mockImplementation(async () => state.settingsResult);
    return query;
  };

  const attractionBuilder = () => {
    const query: Record<string, ReturnType<typeof vi.fn>> = {};
    query.select = vi.fn((selection: string) => {
      state.attractionSelects.push(selection);
      return query;
    });
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
      if (table === "attraction_related_content_settings") return settingsBuilder();
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
  province_id: 1,
  district_id: 101,
  slug: "yala-old-town",
  name_th: "ย่านเมืองเก่ายะลา",
  name_en: "Yala Old Town",
  short_description_th: "เดินชมเมืองเก่า",
  short_description_en: null,
  description_th: "เรื่องราวของย่านเมืองเก่า",
  description_en: null,
  history_th: "ย่านแห่งนี้เติบโตจากชุมชนการค้าดั้งเดิม",
  history_en: null,
  travel_tips_th: "พกร่ม",
  how_to_get_there_th: "เดินทางจากตัวเมือง",
  address_text: "อำเภอเมืองยะลา",
  opening_hours: "08:00-17:00",
  contact_info: null,
  latitude: 6.54,
  longitude: 101.28,
  provinces: { province_name_th: "ยะลา", province_name_en: "Yala" },
  attraction_types: { type_name_th: "วัฒนธรรม", type_name_en: "Culture" },
  attraction_type_assignments: [
    {
      attraction_type_id: 7,
      is_primary: true,
      display_order: 0,
      attraction_types: { type_name_th: null, type_name_en: "Culture" },
    },
    {
      attraction_type_id: 8,
      is_primary: false,
      display_order: 1,
      attraction_types: { type_name_th: null, type_name_en: "History" },
    },
  ],
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
    state.settingsResult.data = [
      { content_type: "attractions", mode: "hidden", max_items: 4 },
      { content_type: "restaurants", mode: "hidden", max_items: 4 },
      { content_type: "accommodations", mode: "hidden", max_items: 4 },
      { content_type: "stories", mode: "hidden", max_items: 3 },
    ];
    state.settingsResult.error = null;
    state.publicFilters.length = 0;
    state.tables.length = 0;
    state.attractionSelects.length = 0;
  });

  it("hides configured related sections without querying recommendation candidates", async () => {
    const result = await getPublicAttractionDetail("yala-old-town");

    expect(result).toMatchObject({
      attractionId: 12,
      slug: "yala-old-town",
      name: "ย่านเมืองเก่ายะลา",
      attractionType: "วัฒนธรรม",
      attractionTypes: ["Culture", "History"],
      history: "ย่านแห่งนี้เติบโตจากชุมชนการค้าดั้งเดิม",
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
      "attraction_related_content_settings",
    ]);
    expect(state.attractionSelects[0]).toContain(
      "attraction_types!attractions_attraction_type_id_fkey",
    );
    expect(state.attractionSelects[0]).toContain("province_id");
    expect(state.attractionSelects[0]).toContain("district_id");
    expect(state.attractionSelects[0]).toContain("attraction_type_id");
    expect(state.attractionSelects[0]).toContain("history_th");
    expect(state.attractionSelects[0]).toContain("history_en");
  });

  it("fails optional related sections closed when their settings cannot be read", async () => {
    state.settingsResult.data = [];
    state.settingsResult.error = { code: "XX000", message: "temporary database failure" };

    const result = await getPublicAttractionDetail("yala-old-town");

    expect(result).toMatchObject({
      thingsToDo: [],
      foodAndDrink: [],
      whereToStay: [],
      articles: [],
    });
    expect(state.tables).toEqual([
      "attractions",
      "attraction_related_attractions",
      "attraction_related_restaurants",
      "attraction_related_accommodations",
      "attraction_related_stories",
      "attraction_related_content_settings",
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
