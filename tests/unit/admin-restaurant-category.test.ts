import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => {
  const categoryQuery: Record<string, ReturnType<typeof vi.fn>> = {};
  const assignmentQuery: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const query of [categoryQuery, assignmentQuery]) {
    for (const method of ["select", "order", "eq", "insert", "update", "delete", "limit"]) {
      query[method] = vi.fn().mockReturnValue(query);
    }
    query.single = vi.fn();
    query.maybeSingle = vi.fn();
  }
  const client = {
    from: vi.fn((table: string) => {
      if (table === "restaurant_categories") return categoryQuery;
      if (table === "restaurant_category_assignments") return assignmentQuery;
      throw new Error(`Unexpected table ${table}`);
    }),
    rpc: vi.fn(),
  };
  return { categoryQuery, assignmentQuery, client };
});

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => mocks.client,
}));

import {
  createAdminRestaurantCategory,
  deleteUnusedAdminRestaurantCategory,
  listAdminRestaurantCategories,
  setAdminRestaurantCategoryActive,
  syncAdminRestaurantCategories,
} from "@/lib/repositories/admin-restaurant-category.repository";

describe("admin restaurant category repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const query of [mocks.categoryQuery, mocks.assignmentQuery]) {
      for (const method of ["select", "order", "eq", "insert", "update", "delete", "limit"]) {
        query[method].mockReturnValue(query);
      }
    }
  });

  it("maps categories and truthful restaurant usage counts", async () => {
    mocks.categoryQuery.order
      .mockReturnValueOnce(mocks.categoryQuery)
      .mockResolvedValueOnce({
        data: [{
          category_id: 4,
          slug: "halal",
          name_th: "อาหารฮาลาล",
          name_en: "Halal",
          section_key: "meals",
          display_order: 20,
          is_featured: true,
          is_active: true,
          created_at: "2026-08-12T00:00:00Z",
          updated_at: null,
        }],
        error: null,
      });
    mocks.client.rpc.mockResolvedValue({
      data: [{ category_id: 4, restaurant_count: 2 }],
      error: null,
    });

    await expect(listAdminRestaurantCategories()).resolves.toEqual([expect.objectContaining({
      categoryId: 4,
      slug: "halal",
      nameTh: "อาหารฮาลาล",
      sectionKey: "meals",
      restaurantCount: 2,
    })]);
  });

  it("creates a category and translates duplicate slugs", async () => {
    mocks.categoryQuery.single.mockResolvedValue({ data: null, error: { code: "23505" } });
    await expect(createAdminRestaurantCategory({
      slug: "breakfast",
      nameTh: "อาหารเช้า",
      nameEn: "Breakfast",
      sectionKey: "meals",
      displayOrder: 30,
      isFeatured: false,
      isActive: true,
    })).rejects.toThrow("RESTAURANT_CATEGORY_DUPLICATE_SLUG");
  });

  it("blocks permanent deletion when a category is assigned", async () => {
    mocks.assignmentQuery.select.mockReturnValue(mocks.assignmentQuery);
    mocks.assignmentQuery.eq.mockReturnValue(mocks.assignmentQuery);
    mocks.assignmentQuery.limit.mockResolvedValue({ data: [{ restaurant_id: 9 }], error: null });

    await expect(deleteUnusedAdminRestaurantCategory(4)).rejects.toThrow("RESTAURANT_CATEGORY_IN_USE");
    expect(mocks.categoryQuery.delete).not.toHaveBeenCalled();
  });

  it("delegates assignment replacement and publication state to the transaction RPC", async () => {
    mocks.client.rpc.mockResolvedValue({ error: null });
    await syncAdminRestaurantCategories(9, [4, 2, 4], true);
    expect(mocks.client.rpc).toHaveBeenCalledWith("sync_restaurant_categories", {
      p_restaurant_id: 9,
      p_category_ids: [4, 2],
      p_is_published: true,
    });
  });

  it("surfaces the database invariant when archiving a final published category", async () => {
    mocks.client.rpc.mockResolvedValue({ error: { message: "RESTAURANT_CATEGORY_LAST_ACTIVE" } });
    await expect(setAdminRestaurantCategoryActive(4, false)).rejects.toThrow("RESTAURANT_CATEGORY_LAST_ACTIVE");
    expect(mocks.client.rpc).toHaveBeenCalledWith("set_restaurant_category_active", {
      p_category_id: 4,
      p_is_active: false,
    });
  });
});
