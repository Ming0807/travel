import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => {
  const categoryQuery: Record<string, ReturnType<typeof vi.fn>> = {};
  const restaurantQuery: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const query of [categoryQuery, restaurantQuery]) {
    for (const method of ["select", "eq", "order", "in", "limit"]) {
      query[method] = vi.fn().mockReturnValue(query);
    }
  }
  const client = {
    from: vi.fn((table: string) => {
      if (table === "restaurant_categories") return categoryQuery;
      if (table === "restaurants") return restaurantQuery;
      throw new Error(`Unexpected table ${table}`);
    }),
    rpc: vi.fn(),
  };
  return { categoryQuery, restaurantQuery, client };
});

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn().mockResolvedValue(mocks.client),
}));

vi.mock("@/lib/repositories/destination-scope.repository", () => ({
  listLiveDestinationProvinces: vi.fn().mockResolvedValue([
    { provinceId: 1, nameTh: "ยะลา", nameEn: "Yala", displayOrder: 1 },
  ]),
  listLiveDestinationProvinceIds: vi.fn().mockResolvedValue([1]),
}));

import { listAvailablePublicRestaurantCategories } from "@/lib/repositories/public-content.repository";

describe("public restaurant categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const query of [mocks.categoryQuery, mocks.restaurantQuery]) {
      for (const method of ["select", "eq", "order", "in", "limit"]) {
        query[method].mockReturnValue(query);
      }
    }
  });

  it("returns only active categories with published restaurant usage counts", async () => {
    mocks.client.rpc.mockResolvedValue({
        data: [
          { category_id: 1, slug: "malay", name_th: "อาหารมลายู", name_en: "Malay", section_key: "local", display_order: 10, is_featured: true, restaurant_count: 2 },
          { category_id: 2, slug: "coffee", name_th: "คาเฟ่และกาแฟ", name_en: "Coffee", section_key: "cafes", display_order: 20, is_featured: false, restaurant_count: 1 },
        ],
        error: null,
      });

    const result = await listAvailablePublicRestaurantCategories({ province: "Yala" });

    expect(mocks.client.rpc).toHaveBeenCalledWith("list_public_restaurant_categories", { p_province_en: "Yala" });
    expect(result).toEqual({
      state: "available",
      items: [
        expect.objectContaining({ slug: "malay", name: "อาหารมลายู", isFeatured: true, count: 2 }),
        expect.objectContaining({ slug: "coffee", name: "คาเฟ่และกาแฟ", isFeatured: false, count: 1 }),
      ],
    });
  });

  it("does not present a false empty category list when the master query fails", async () => {
    mocks.client.rpc.mockResolvedValue({ data: null, error: { message: "offline" } });

    await expect(listAvailablePublicRestaurantCategories()).resolves.toEqual({
      items: [],
      state: "unavailable",
    });
  });
});
