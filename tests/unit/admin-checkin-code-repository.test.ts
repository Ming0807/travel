import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type QueryResult = {
  data: Array<Record<string, unknown>> | null;
  error: unknown;
  count?: number | null;
};

type MockFn = ReturnType<typeof vi.fn>;

type MockQueryBuilder = {
  select: MockFn;
  order: MockFn;
  range: MockFn;
  eq: MockFn;
  or: MockFn;
  gt: MockFn;
  lt: MockFn;
  limit: MockFn;
  then: <TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>;
};

const serviceRoleMocks = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({
    from: serviceRoleMocks.from,
  }),
}));

import {
  exportAdminCheckinCodes,
  listAdminCheckinCodes,
} from "@/lib/repositories/admin-checkin-code.repository";

function createBuilder(result: QueryResult = { data: [], error: null, count: 0 }): MockQueryBuilder {
  const builder = {} as MockQueryBuilder;
  const chainMethods = ["select", "order", "range", "eq", "or", "gt", "lt", "limit"] as const;

  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }

  builder.then = (onfulfilled, onrejected) => Promise.resolve(result).then(onfulfilled, onrejected);
  return builder;
}

describe("admin check-in code repository filters", () => {
  let builder: MockQueryBuilder;

  beforeEach(() => {
    vi.clearAllMocks();
    builder = createBuilder();
    serviceRoleMocks.from.mockReturnValue(builder);
  });

  it("applies attraction, photo spot, inactive, search, availability, and pagination filters", async () => {
    await listAdminCheckinCodes({
      page: 2,
      pageSize: 25,
      search: "gate_01%",
      attractionId: 42,
      photoSpotId: 9,
      isActive: false,
      availability: "expired",
    });

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("checkin_codes");
    expect(builder.range).toHaveBeenCalledWith(25, 49);
    expect(builder.eq).toHaveBeenCalledWith("attraction_id", 42);
    expect(builder.eq).toHaveBeenCalledWith("photo_spot_id", 9);
    expect(builder.eq).toHaveBeenCalledWith("is_active", false);
    expect(builder.or).toHaveBeenCalledWith("code.ilike.%gate\\_01\\%%,label.ilike.%gate\\_01\\%%");
    expect(builder.lt).toHaveBeenCalledWith("ends_at", expect.any(String));
  });

  it("applies the same filters when exporting check-in codes", async () => {
    await exportAdminCheckinCodes(
      {
        search: "north_gate",
        attractionId: 12,
        photoSpotId: 4,
        isActive: true,
        availability: "upcoming",
      },
      501
    );

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("checkin_codes");
    expect(builder.eq).toHaveBeenCalledWith("attraction_id", 12);
    expect(builder.eq).toHaveBeenCalledWith("photo_spot_id", 4);
    expect(builder.eq).toHaveBeenCalledWith("is_active", true);
    expect(builder.or).toHaveBeenCalledWith("code.ilike.%north\\_gate%,label.ilike.%north\\_gate%");
    expect(builder.gt).toHaveBeenCalledWith("starts_at", expect.any(String));
    expect(builder.limit).toHaveBeenCalledWith(501);
  });
});
