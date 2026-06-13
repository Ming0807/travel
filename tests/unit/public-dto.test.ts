import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only to prevent import errors in test environment
vi.mock("server-only", () => ({}));

import { listPublicAttractionCards, listPublicStories, listPublicRoutes } from "@/lib/repositories/public-content.repository";

// ── Configurable Supabase mock ─────────────────────────────────────────────

const { mockSupabaseClient, mockFromChain } = vi.hoisted(() => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const methods = ["select", "in", "eq", "order", "limit", "or", "maybeSingle"];
  for (const m of methods) {
    chain[m] = vi.fn();
  }
  // Default: all methods return chain for builder pattern
  for (const m of methods) {
    chain[m].mockReturnValue(chain);
  }

  const client = { from: vi.fn().mockReturnValue(chain) };

  return {
    mockSupabaseClient: client,
    mockFromChain: chain,
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue(mockSupabaseClient),
}));

// ── Helper ─────────────────────────────────────────────────────────────────

function setupRoutesQuery(dbRows: Array<Record<string, unknown>>) {
  // Make the final .limit() resolve with data
  mockFromChain.limit.mockResolvedValue({ data: dbRows, error: null });
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("Public Content DTOs (empty DB/error states)", () => {
  it("returns an empty attraction list when no data", async () => {
    mockFromChain.limit.mockResolvedValue({ data: [], error: null });
    const attractions = await listPublicAttractionCards(1);
    expect(attractions).toEqual([]);
  });

  it("returns an empty story list when no data", async () => {
    mockFromChain.limit.mockResolvedValue({ data: [], error: null });
    const stories = await listPublicStories({ limit: 1 });
    expect(stories).toEqual([]);
  });

  it("returns empty array for routes fallback (no db rows)", async () => {
    mockFromChain.limit.mockResolvedValue({ data: [], error: null });
    const routes = await listPublicRoutes(1);
    expect(routes).toEqual([]);
  });
});

// ── Featured route day count & order tests ─────────────────────────────

describe("listPublicRoutes — featured slugs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chain to default builder pattern
    const methods = ["select", "in", "eq", "order", "limit", "or", "maybeSingle"];
    for (const m of methods) {
      mockFromChain[m].mockReturnValue(mockFromChain);
    }
    mockSupabaseClient.from.mockReturnValue(mockFromChain);
  });

  function buildRouteRows(stopsPerRoute: Record<string, number[]>) {
    return Object.entries(stopsPerRoute).map(([slug, dayNumbers]) => ({
      slug,
      name_th: `Route ${slug}`,
      name_en: null,
      description_th: `Description for ${slug}`,
      description_en: null,
      content_media: [],
      suggested_route_stops: dayNumbers.map((d) => ({ day_number: d })),
    }));
  }

  it("computes days from suggested_route_stops (not row.days column)", async () => {
    setupRoutesQuery(buildRouteRows({ "multi-day-route": [1, 3, 5] }));

    const routes = await listPublicRoutes(10, ["multi-day-route"]);
    expect(routes).toHaveLength(1);
    expect(routes[0].slug).toBe("multi-day-route");
    expect(routes[0].days).toBe(5);
  });

  it("preserves admin-specified slug order", async () => {
    setupRoutesQuery(buildRouteRows({
      "route-c": [1],
      "route-a": [1, 2],
      "route-b": [1, 2, 3],
    }));

    const routes = await listPublicRoutes(10, ["route-b", "route-a", "route-c"]);
    expect(routes).toHaveLength(3);
    expect(routes[0].slug).toBe("route-b");
    expect(routes[0].days).toBe(3);
    expect(routes[1].slug).toBe("route-a");
    expect(routes[1].days).toBe(2);
    expect(routes[2].slug).toBe("route-c");
    expect(routes[2].days).toBe(1);
  });

  it("returns days=1 when route has no stops", async () => {
    setupRoutesQuery(buildRouteRows({ "no-stops-route": [] }));

    const routes = await listPublicRoutes(10, ["no-stops-route"]);
    expect(routes).toHaveLength(1);
    expect(routes[0].days).toBe(1);
  });
});
