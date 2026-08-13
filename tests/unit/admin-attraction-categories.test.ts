import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ from: mocks.from, rpc: mocks.rpc }),
}));

import {
  listAttractionIdsByType,
  listAttractionTypeAssignments,
  syncAttractionTypeAssignments,
} from "@/lib/repositories/attraction-category.repository";

describe("admin attraction category repository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps assignments in primary-first display order", async () => {
    const order = vi.fn().mockResolvedValue({
      data: [
        { attraction_type_id: 3, is_primary: true, display_order: 0, attraction_types: { type_name_th: "ศาสนสถาน", type_name_en: "Religious Sites", is_active: true } },
        { attraction_type_id: 4, is_primary: false, display_order: 1, attraction_types: { type_name_th: "ประวัติศาสตร์", type_name_en: "Historical Sites", is_active: true } },
      ],
      error: null,
    });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    mocks.from.mockReturnValue({ select });

    await expect(listAttractionTypeAssignments(10)).resolves.toEqual([
      expect.objectContaining({ attractionTypeId: 3, isPrimary: true, nameTh: "ศาสนสถาน" }),
      expect.objectContaining({ attractionTypeId: 4, isPrimary: false, nameTh: "ประวัติศาสตร์" }),
    ]);
  });

  it("calls the atomic synchronization RPC", async () => {
    mocks.rpc.mockResolvedValue({ error: null });
    await syncAttractionTypeAssignments({ attractionId: 10, attractionTypeIds: [3, 4], primaryAttractionTypeId: 3, isPublished: true });
    expect(mocks.rpc).toHaveBeenCalledWith("sync_attraction_types", {
      p_attraction_id: 10,
      p_attraction_type_ids: [3, 4],
      p_primary_attraction_type_id: 3,
      p_is_published: true,
    });
  });

  it("loads attraction ids assigned to a category for admin filters", async () => {
    const limit = vi.fn().mockResolvedValue({
      data: [{ attraction_id: 10 }, { attraction_id: 12 }],
      error: null,
    });
    const eq = vi.fn(() => ({ limit }));
    const select = vi.fn(() => ({ eq }));
    mocks.from.mockReturnValue({ select });

    await expect(listAttractionIdsByType(3)).resolves.toEqual([10, 12]);
    expect(mocks.from).toHaveBeenCalledWith("attraction_type_assignments");
    expect(eq).toHaveBeenCalledWith("attraction_type_id", 3);
  });
});
