import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { statsQuery, itemsQuery, supabaseClient } = vi.hoisted(() => {
  const builder = () => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    for (const method of ["select", "eq", "is", "order", "limit"]) {
      chain[method] = vi.fn().mockReturnValue(chain);
    }
    return chain;
  };
  const stats = builder();
  const items = builder();
  let call = 0;

  return {
    statsQuery: stats,
    itemsQuery: items,
    supabaseClient: {
      from: vi.fn(() => {
        call += 1;
        return call % 2 === 1 ? stats : items;
      }),
    },
  };
});

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn().mockReturnValue(supabaseClient),
}));

import {
  getPublicAttractionReviews,
  getPublicRestaurantReviews,
} from "@/lib/repositories/public-review.repository";

describe("getPublicAttractionReviews", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const query of [statsQuery, itemsQuery]) {
      for (const method of ["select", "eq", "is", "order"]) {
        query[method].mockReturnValue(query);
      }
    }
    statsQuery.is.mockResolvedValue({ data: [], error: null });
    itemsQuery.limit.mockResolvedValue({ data: [], error: null });
  });

  it("returns a truthful empty state and applies every public moderation filter", async () => {
    const result = await getPublicAttractionReviews(12);

    expect(itemsQuery.select).toHaveBeenCalledWith(expect.not.stringContaining("tourists"));
    expect(itemsQuery.eq).toHaveBeenCalledWith("attraction_id", 12);
    expect(itemsQuery.eq).toHaveBeenCalledWith("is_approved", true);
    expect(itemsQuery.eq).toHaveBeenCalledWith("is_published", true);
    expect(itemsQuery.is).toHaveBeenCalledWith("deleted_at", null);
    expect(result).toEqual({ state: "empty", stats: null, items: [] });
  });

  it("does not expose tourist names in the public review DTO", async () => {
    statsQuery.is.mockResolvedValue({ data: [{ rating: 5 }, { rating: 3 }], error: null });
    itemsQuery.limit.mockResolvedValue({
      data: [
        { review_id: 1, rating: 5, title: "ดีมาก", comment: "วิวสวย", created_at: "2026-08-10T08:00:00Z" },
        { review_id: 2, rating: 3, title: null, comment: null, created_at: "2026-08-09T08:00:00Z" },
      ],
      error: null,
    });

    const result = await getPublicAttractionReviews(12);

    expect(result.state).toBe("available");
    expect(result.stats).toMatchObject({ averageRating: 4, totalReviews: 2 });
    expect(result.items[0]).toMatchObject({ authorLabel: "นักเดินทาง", rating: 5 });
    expect(result.items[0]).not.toHaveProperty("touristName");
  });

  it("distinguishes a query failure from an attraction with no reviews", async () => {
    statsQuery.is.mockResolvedValue({ data: null, error: { message: "database unavailable" } });

    await expect(getPublicAttractionReviews(12)).resolves.toEqual({
      state: "unavailable",
      stats: null,
      items: [],
    });
  });

  it("returns restaurant reviews without selecting tourist identity data", async () => {
    statsQuery.is.mockResolvedValue({ data: [{ rating: 5 }], error: null });
    itemsQuery.limit.mockResolvedValue({
      data: [{ review_id: 7, rating: 5, title: "Great food", comment: null, created_at: "2026-08-10T08:00:00Z" }],
      error: null,
    });

    const result = await getPublicRestaurantReviews(9);

    expect(statsQuery.eq).toHaveBeenCalledWith("restaurant_id", 9);
    expect(itemsQuery.eq).toHaveBeenCalledWith("restaurant_id", 9);
    expect(itemsQuery.select).toHaveBeenCalledWith(expect.not.stringContaining("tourists"));
    expect(result.items[0]).toMatchObject({ authorLabel: "นักเดินทาง", rating: 5 });
    expect(result.items[0]).not.toHaveProperty("touristName");
  });
});
