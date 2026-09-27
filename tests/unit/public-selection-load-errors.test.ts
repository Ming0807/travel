import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ from: vi.fn(), scope: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: async () => ({ from: mocks.from }) }));
vi.mock("@/lib/repositories/destination-scope.repository", () => ({
  listLiveDestinationProvinces: mocks.scope,
  listLiveDestinationProvinceIds: async () => [1],
}));
import { listPublicAttractionCards, listPublicRestaurants } from "@/lib/repositories/public-content.repository";

describe("selected public content load failures", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.scope.mockResolvedValue([{ provinceId: 1, nameTh: "ยะลา", nameEn: "Yala" }]);
    const query = {
      select: vi.fn(), eq: vi.fn(), in: vi.fn(), order: vi.fn(),
      limit: vi.fn().mockResolvedValue({ data: null, error: { message: "internal provider detail" } }),
    };
    for (const method of ["select", "eq", "in", "order"] as const) query[method].mockReturnValue(query);
    mocks.from.mockReturnValue(query);
  });

  it("surfaces attraction lookup errors rather than treating them as unpublished content", async () => {
    await expect(listPublicAttractionCards(2, { featuredSlugs: ["first", "second"], exactFeaturedOnly: true, includeReviewSummaries: false, failOnError: true })).rejects.toThrow("PUBLIC_ATTRACTION_LIST_UNAVAILABLE");
    expect(await listPublicAttractionCards(2, { featuredSlugs: ["first"], exactFeaturedOnly: true })).toEqual([]);
  });

  it("surfaces restaurant lookup errors without changing existing resilient callers", async () => {
    await expect(listPublicRestaurants({ featuredSlugs: ["meal"], failOnError: true })).rejects.toThrow("PUBLIC_RESTAURANT_LIST_UNAVAILABLE");
    expect(await listPublicRestaurants({ featuredSlugs: ["meal"] })).toEqual([]);
  });

  it("does not expose internal scope errors", async () => {
    mocks.scope.mockRejectedValue(new Error("private connection details"));
    await expect(listPublicAttractionCards(2, { failOnError: true })).rejects.toThrow("PUBLIC_ATTRACTION_LIST_UNAVAILABLE");
    await expect(listPublicRestaurants({ failOnError: true })).rejects.toThrow("PUBLIC_RESTAURANT_LIST_UNAVAILABLE");
  });
});
