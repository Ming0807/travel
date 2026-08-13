import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type QueryResult = {
  data: unknown[] | Record<string, unknown> | null;
  error: { code?: string; message?: string } | null;
  count?: number | null;
};

type MockBuilder = {
  select: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  neq: ReturnType<typeof vi.fn>;
  in: ReturnType<typeof vi.fn>;
  or: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  range: ReturnType<typeof vi.fn>;
  then: (resolve: (value: QueryResult) => unknown, reject?: (reason: unknown) => unknown) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  from: vi.fn(),
  liveProvinceIds: vi.fn().mockResolvedValue([1, 2]),
  requirePermission: vi.fn().mockResolvedValue({
    actor: {
      adminId: "admin-1",
      authUserId: "auth-1",
      email: "admin@example.com",
      displayName: "Admin",
      roleNames: ["admin"],
      permissions: ["attraction.update"],
    },
  }),
  logAdminMutation: vi.fn().mockResolvedValue(undefined),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ rpc: mocks.rpc, from: mocks.from }),
}));

vi.mock("@/lib/repositories/destination-scope.repository", () => ({
  assertLiveDestinationProvinceId: vi.fn(),
  listLiveDestinationProvinceIds: mocks.liveProvinceIds,
}));

vi.mock("@/lib/auth/guards", () => ({
  AdminAuthError: class AdminAuthError extends Error {},
  requirePermission: mocks.requirePermission,
}));

vi.mock("@/lib/services/audit-log.service", () => ({
  logAdminMutation: mocks.logAdminMutation,
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  getAdminAttractionRelatedContentSettings,
  getAdminSelectedRelatedContent,
  searchAdminAttractionRelatedContent,
  updateAdminAttractionRelatedContent,
  updateAdminAttractionRelatedContentV2,
  type RelatedContentSearchInput,
} from "@/lib/repositories/admin-attraction.repository";
import { searchAttractionRelatedContentAction } from "@/app/actions/admin-attraction-actions";

function builder(result: QueryResult): MockBuilder {
  const value = {} as MockBuilder;
  value.select = vi.fn(() => value);
  value.eq = vi.fn(() => value);
  value.neq = vi.fn(() => value);
  value.in = vi.fn(() => value);
  value.or = vi.fn(() => value);
  value.order = vi.fn(() => value);
  value.range = vi.fn(() => value);
  value.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
  return value;
}

function setBuilder(table: string, result: QueryResult): MockBuilder {
  const query = builder(result);
  mocks.from.mockImplementation((requestedTable: string) => {
    if (requestedTable !== table) {
      throw new Error(`Unexpected table: ${requestedTable}`);
    }
    return query;
  });
  return query;
}

function setBuilders(results: Record<string, QueryResult>): Record<string, MockBuilder> {
  const queries = Object.fromEntries(
    Object.entries(results).map(([table, result]) => [table, builder(result)]),
  ) as Record<string, MockBuilder>;
  mocks.from.mockImplementation((table: string) => queries[table]);
  return queries;
}

function relationResult(ids: number[]) {
  return {
    data: ids.map((id, index) => ({ id, display_order: index })),
    error: null,
  } satisfies QueryResult;
}

describe("admin attraction related-content contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.liveProvinceIds.mockResolvedValue([1, 2]);
  });

  it("derives legacy modes when the settings table is missing", async () => {
    setBuilders({
      attraction_related_content_settings: {
        data: null,
        error: { code: "PGRST205", message: "table is not in the schema cache" },
      },
      attraction_related_attractions: relationResult([11]),
      attraction_related_restaurants: relationResult([]),
      attraction_related_accommodations: relationResult([]),
      attraction_related_stories: relationResult([31]),
    });

    await expect(getAdminAttractionRelatedContentSettings(10)).resolves.toEqual([
      { attractionId: 10, contentType: "attractions", mode: "manual", maxItems: 4 },
      { attractionId: 10, contentType: "restaurants", mode: "automatic", maxItems: 4 },
      { attractionId: 10, contentType: "accommodations", mode: "automatic", maxItems: 4 },
      { attractionId: 10, contentType: "stories", mode: "manual", maxItems: 3 },
    ]);
  });

  it("does not hide an unexpected settings-table error", async () => {
    setBuilder("attraction_related_content_settings", {
      data: null,
      error: { code: "42501", message: "permission denied" },
    });

    await expect(getAdminAttractionRelatedContentSettings(10)).rejects.toThrow(
      "ADMIN_ATTRACTION_RELATED_SETTINGS_READ_FAILED",
    );
  });

  it("reads and normalizes all four explicit settings", async () => {
    setBuilders({
      attraction_related_content_settings: {
      data: [
        { attraction_id: 10, content_type: "attractions", mode: "hybrid", max_items: 6 },
        { attraction_id: 10, content_type: "restaurants", mode: "hidden", max_items: 2 },
      ],
      error: null,
      },
      attraction_related_attractions: relationResult([]),
      attraction_related_restaurants: relationResult([]),
      attraction_related_accommodations: relationResult([]),
      attraction_related_stories: relationResult([]),
    });

    await expect(getAdminAttractionRelatedContentSettings(10)).resolves.toEqual([
      { attractionId: 10, contentType: "attractions", mode: "hybrid", maxItems: 6 },
      { attractionId: 10, contentType: "restaurants", mode: "hidden", maxItems: 2 },
      { attractionId: 10, contentType: "accommodations", mode: "automatic", maxItems: 4 },
      { attractionId: 10, contentType: "stories", mode: "automatic", maxItems: 3 },
    ]);
  });

  it("searches one content table with escaped wildcard filters and pagination", async () => {
    const query = setBuilder("restaurants", {
      data: [{ restaurant_id: 22, name_th: "ร้าน 100%", name_en: "Cafe", slug: "cafe-100", province_id: 1, is_published: true, is_active: true, provinces: { province_name_th: "ยะลา" } }],
      error: null,
      count: 1,
    });
    const input: RelatedContentSearchInput = {
      attractionId: 10,
      contentType: "restaurants",
      query: "100%_\\,",
      page: 2,
      pageSize: 20,
    };

    await expect(searchAdminAttractionRelatedContent(input)).resolves.toMatchObject({
      items: [{ id: 22, name: "ร้าน 100%", slug: "cafe-100", status: "published", editHref: "/admin/restaurants/22/edit" }],
      total: 1,
      page: 2,
      pageSize: 20,
    });
    expect(mocks.from).toHaveBeenCalledWith("restaurants");
    expect(query.eq).toHaveBeenCalledWith("is_published", true);
    expect(query.eq).toHaveBeenCalledWith("is_active", true);
    expect(query.in).toHaveBeenCalledWith("province_id", [1, 2]);
    expect(query.or).toHaveBeenCalledWith(expect.stringContaining("\\%"));
    expect(query.or).toHaveBeenCalledWith(expect.not.stringContaining("100%_\\,"));
    expect(query.range).toHaveBeenCalledWith(20, 39);
  });

  it("rejects overlong search input before querying the database", async () => {
    await expect(searchAdminAttractionRelatedContent({
      attractionId: 10,
      contentType: "restaurants",
      query: "x".repeat(101),
      page: 1,
      pageSize: 20,
    })).rejects.toThrow("ADMIN_ATTRACTION_RELATED_INVALID_INPUT");

    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("excludes the source attraction and only searches live published candidates", async () => {
    const query = setBuilder("attractions", {
      data: [{ attraction_id: 11, name_th: "จุดชมวิว", name_en: null, slug: "viewpoint", province_id: 1, is_published: true, is_active: true, provinces: { province_name_th: "ยะลา" } }],
      error: null,
      count: 1,
    });

    await searchAdminAttractionRelatedContent({ attractionId: 10, contentType: "attractions", query: "", page: 1, pageSize: 10 });

    expect(query.neq).toHaveBeenCalledWith("attraction_id", 10);
    expect(query.eq).toHaveBeenCalledWith("is_published", true);
    expect(query.eq).toHaveBeenCalledWith("is_active", true);
  });

  it("returns the typed search result through the permission-protected server action", async () => {
    setBuilder("restaurants", {
      data: [{ restaurant_id: 22, name_th: "ร้านอาหาร", name_en: null, slug: "restaurant-22", province_id: 1, is_published: true, is_active: true, provinces: { province_name_th: "ยะลา" } }],
      error: null,
      count: 1,
    });

    const result = await searchAttractionRelatedContentAction({
      attractionId: 10,
      contentType: "restaurants",
      query: "ร้าน",
      page: 1,
      pageSize: 20,
    });

    expect(result).toEqual(expect.objectContaining({ success: true, data: expect.objectContaining({ total: 1 }) }));
    expect(mocks.requirePermission).toHaveBeenCalledWith("attraction.update");
  });

  it("preserves selected unpublished and inactive records with repair metadata", async () => {
    setBuilder("accommodations", {
      data: [{ accommodation_id: 7, name_th: "ที่พักเดิม", name_en: null, slug: "old-stay", province_id: 1, is_published: false, is_active: false, provinces: { province_name_th: "ยะลา" } }],
      error: null,
    });

    await expect(getAdminSelectedRelatedContent(10, "accommodations", [7, 99])).resolves.toEqual([
      expect.objectContaining({ id: 7, isPublished: false, isActive: false, status: "unavailable", available: false, editHref: "/admin/accommodations/7/edit" }),
      expect.objectContaining({ id: 99, status: "missing", available: false, editHref: "/admin/accommodations/99/edit" }),
    ]);
  });

  it("rejects invalid v2 input before calling the RPC", async () => {
    await expect(updateAdminAttractionRelatedContentV2({
      attractionId: 10,
      contentType: "stories",
      mode: "hybrid",
      maxItems: 0,
      relatedIds: [1, 1],
    })).rejects.toThrow("ADMIN_ATTRACTION_RELATED_INVALID_INPUT");
    expect(mocks.rpc).not.toHaveBeenCalled();
  });

  it("calls v2 with the complete mode, limit, and ordered IDs payload", async () => {
    mocks.rpc.mockResolvedValue({ data: { success: true, content_type: "stories", mode: "manual", max_items: 3, curated_count: 2 }, error: null });

    await expect(updateAdminAttractionRelatedContentV2({
      attractionId: 10,
      contentType: "stories",
      mode: "manual",
      maxItems: 3,
      relatedIds: [31, 32],
    })).resolves.toMatchObject({ contentType: "stories", mode: "manual", maxItems: 3, curatedCount: 2 });
    expect(mocks.rpc).toHaveBeenCalledWith("sync_attraction_related_content_v2", {
      p_attraction_id: 10,
      p_entity_type: "stories",
      p_related_ids: [31, 32],
      p_mode: "manual",
      p_max_items: 3,
    });
  });

  it("accepts an empty curated result from a successful v2 sync", async () => {
    mocks.rpc.mockResolvedValue({ data: { success: true, content_type: "restaurants", mode: "automatic", max_items: 4, curated_count: 0 }, error: null });

    await expect(updateAdminAttractionRelatedContentV2({
      attractionId: 10,
      contentType: "restaurants",
      mode: "automatic",
      maxItems: 4,
      relatedIds: [],
    })).resolves.toMatchObject({ curatedCount: 0 });
  });

  it("rejects v2 false-success responses and never falls back to the legacy RPC", async () => {
    mocks.rpc.mockResolvedValue({ data: { success: false, error: "invalid target" }, error: null });

    await expect(updateAdminAttractionRelatedContentV2({
      attractionId: 10,
      contentType: "restaurants",
      mode: "manual",
      maxItems: 4,
      relatedIds: [22],
    })).rejects.toThrow("ADMIN_ATTRACTION_RELATED_UPDATE_FAILED");
    expect(mocks.rpc).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).toHaveBeenCalledWith("sync_attraction_related_content_v2", expect.any(Object));
  });

  it("keeps the legacy export safe against false-success payloads", async () => {
    mocks.rpc.mockResolvedValue({ data: { success: false }, error: null });

    await expect(updateAdminAttractionRelatedContent(10, "restaurants", [22])).rejects.toThrow(
      "ADMIN_ATTRACTION_RELATED_UPDATE_FAILED",
    );
  });
});
