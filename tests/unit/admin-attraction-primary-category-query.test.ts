import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { select, from } = vi.hoisted(() => {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: {
      attraction_id: 99,
      province_id: 1,
      district_id: null,
      attraction_type_id: 2,
      slug: "wat-khuha-phimuk",
      name_th: "วัดคูหาภิมุข",
      is_published: false,
      is_active: true,
      provinces: { province_name_th: "ยะลา" },
      districts: null,
      attraction_types: { type_name_th: "วัฒนธรรมและประเพณี" },
      attraction_type_assignments: [],
    },
    error: null,
  });
  const attractionQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle,
  };
  attractionQuery.select.mockReturnValue(attractionQuery);
  attractionQuery.eq.mockReturnValue(attractionQuery);

  const emptyCountQuery = {
    select: vi.fn(),
    in: vi.fn().mockResolvedValue({ data: [], error: null }),
  };
  emptyCountQuery.select.mockReturnValue(emptyCountQuery);

  return {
    select: attractionQuery.select,
    from: vi.fn((table: string) => {
      if (table === "attractions") return attractionQuery;
      if (table === "photo_spots" || table === "checkin_codes") return emptyCountQuery;
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
});

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ from }),
}));

import { getAdminAttractionById } from "@/lib/repositories/admin-attraction.repository";

describe("admin attraction primary category relationship", () => {
  beforeEach(() => vi.clearAllMocks());

  it("selects the compatibility primary category through its explicit foreign key", async () => {
    await getAdminAttractionById(99);

    expect(select).toHaveBeenCalledWith(
      expect.stringContaining(
        "attraction_types!attractions_attraction_type_id_fkey",
      ),
    );
  });
});
