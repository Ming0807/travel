import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => {
  const query: Record<string, ReturnType<typeof vi.fn>> = {};
  for (const method of ["select", "eq", "order"]) {
    query[method] = vi.fn().mockReturnValue(query);
  }
  query.then = vi.fn((resolve: (value: unknown) => unknown) => resolve({ data: [], error: null }));
  return {
    query,
    from: vi.fn(() => query),
  };
});

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ from: mocks.from }),
}));

import { getAdminAttractionsList } from "@/lib/repositories/admin-attraction.repository";
import { adminRestaurantFiltersSchema } from "@/lib/validation/admin-restaurant";
import { adminAccommodationFiltersSchema } from "@/lib/validation/admin-accommodation";

describe("CMS active-only filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const method of ["select", "eq", "order"]) {
      mocks.query[method].mockReturnValue(mocks.query);
    }
  });

  it("limits shared attraction pickers to active pilot attractions", async () => {
    await getAdminAttractionsList();

    expect(mocks.from).toHaveBeenCalledWith("attractions");
    expect(mocks.query.eq).toHaveBeenCalledWith("is_active", true);
  });

  it("parses lifecycle filters for restaurant and accommodation archives", () => {
    expect(adminRestaurantFiltersSchema.parse({ isActive: "false" }).isActive).toBe(false);
    expect(adminAccommodationFiltersSchema.parse({ isActive: "true" }).isActive).toBe(true);
  });
});
