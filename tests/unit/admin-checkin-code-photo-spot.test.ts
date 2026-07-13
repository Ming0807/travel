import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const serviceRoleMocks = vi.hoisted(() => ({
  result: { data: null as Record<string, unknown> | null, error: null as unknown },
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({
    from: serviceRoleMocks.from,
  }),
}));

import { photoSpotBelongsToAttraction } from "@/lib/repositories/admin-checkin-code.repository";

function createBuilder() {
  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.maybeSingle.mockImplementation(async () => serviceRoleMocks.result);
  return builder;
}

describe("check-in code photo spot validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an inactive photo spot for an active check-in code", async () => {
    const builder = createBuilder();
    serviceRoleMocks.result = {
      data: { attraction_id: 42, is_active: false },
      error: null,
    };
    serviceRoleMocks.from.mockReturnValue(builder);

    await expect(photoSpotBelongsToAttraction(9, 42, true)).resolves.toBe(false);
    expect(builder.select).toHaveBeenCalledWith("attraction_id, is_active");
  });

  it("allows an inactive photo spot while the check-in code is also inactive", async () => {
    const builder = createBuilder();
    serviceRoleMocks.result = {
      data: { attraction_id: 42, is_active: false },
      error: null,
    };
    serviceRoleMocks.from.mockReturnValue(builder);

    await expect(photoSpotBelongsToAttraction(9, 42, false)).resolves.toBe(true);
  });
});
