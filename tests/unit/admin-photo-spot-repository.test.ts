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
  exportAdminPhotoSpots,
  listAdminPhotoSpots,
} from "@/lib/repositories/photo-spot.repository";

function createBuilder(result: QueryResult = { data: [], error: null, count: 0 }): MockQueryBuilder {
  const builder = {} as MockQueryBuilder;
  const chainMethods = ["select", "order", "range", "eq", "or", "limit"] as const;

  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }

  builder.then = (onfulfilled, onrejected) => Promise.resolve(result).then(onfulfilled, onrejected);
  return builder;
}

describe("admin photo spot repository filters", () => {
  let builder: MockQueryBuilder;

  beforeEach(() => {
    vi.clearAllMocks();
    builder = createBuilder();
    serviceRoleMocks.from.mockReturnValue(builder);
  });

  it("applies attraction, inactive, escaped search, and pagination filters", async () => {
    await listAdminPhotoSpots({
      page: 3,
      pageSize: 20,
      search: "view_100%",
      attractionId: 7,
      isActive: false,
    });

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("photo_spots");
    expect(builder.range).toHaveBeenCalledWith(40, 59);
    expect(builder.eq).toHaveBeenCalledWith("attraction_id", 7);
    expect(builder.eq).toHaveBeenCalledWith("is_active", false);
    expect(builder.or).toHaveBeenCalledWith(
      "spot_name_th.ilike.%view\\_100\\%%,spot_name_en.ilike.%view\\_100\\%%"
    );
  });

  it("applies the same filters when exporting photo spots", async () => {
    await exportAdminPhotoSpots(
      {
        search: "sunset_spot",
        attractionId: 18,
        isActive: true,
      },
      501
    );

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("photo_spots");
    expect(builder.eq).toHaveBeenCalledWith("attraction_id", 18);
    expect(builder.eq).toHaveBeenCalledWith("is_active", true);
    expect(builder.or).toHaveBeenCalledWith(
      "spot_name_th.ilike.%sunset\\_spot%,spot_name_en.ilike.%sunset\\_spot%"
    );
    expect(builder.limit).toHaveBeenCalledWith(501);
  });
});
