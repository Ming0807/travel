import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ rpc: mocks.rpc }),
}));

import { updateAdminAttractionRelatedContent } from "@/lib/repositories/admin-attraction.repository";

describe("updateAdminAttractionRelatedContent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a false-success payload returned by the legacy sync RPC", async () => {
    mocks.rpc.mockResolvedValue({
      data: { success: false, error: "target record does not exist" },
      error: null,
    });

    await expect(
      updateAdminAttractionRelatedContent(10, "restaurants", [91]),
    ).rejects.toThrow("ADMIN_ATTRACTION_RELATED_UPDATE_FAILED");
  });

  it("accepts an explicit successful sync payload", async () => {
    mocks.rpc.mockResolvedValue({
      data: { success: true, count: 2 },
      error: null,
    });

    await expect(
      updateAdminAttractionRelatedContent(10, "restaurants", [91, 92]),
    ).resolves.toBeUndefined();
  });
});
