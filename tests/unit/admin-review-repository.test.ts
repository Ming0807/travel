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
  is: MockFn;
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

import { exportAdminReviews, listAdminReviews } from "@/lib/repositories/admin-review.repository";

function createBuilder(result: QueryResult = { data: [], error: null, count: 0 }): MockQueryBuilder {
  const builder = {} as MockQueryBuilder;
  const chainMethods = ["select", "is", "order", "range", "eq", "or", "limit"] as const;

  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }

  builder.then = (onfulfilled, onrejected) => Promise.resolve(result).then(onfulfilled, onrejected);

  return builder;
}

describe("admin review repository filters", () => {
  let builder: MockQueryBuilder;

  beforeEach(() => {
    vi.clearAllMocks();
    builder = createBuilder();
    serviceRoleMocks.from.mockReturnValue(builder);
  });

  it("applies review list filters including false boolean states", async () => {
    await listAdminReviews({
      page: 1,
      pageSize: 20,
      search: "good",
      attractionId: 42,
      restaurantId: null,
      rating: 4,
      isApproved: false,
      isPublished: false,
    });

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("reviews");
    expect(builder.is).toHaveBeenCalledWith("deleted_at", null);
    expect(builder.or).toHaveBeenCalledWith("comment.ilike.%good%,title.ilike.%good%");
    expect(builder.eq).toHaveBeenCalledWith("attraction_id", 42);
    expect(builder.eq).toHaveBeenCalledWith("rating", 4);
    expect(builder.eq).toHaveBeenCalledWith("is_approved", false);
    expect(builder.eq).toHaveBeenCalledWith("is_published", false);
  });

  it("applies the same review filters when exporting", async () => {
    await exportAdminReviews(
      {
        search: "service",
        attractionId: null,
        restaurantId: 8,
        rating: 2,
        isApproved: false,
        isPublished: true,
      },
      500
    );

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("reviews");
    expect(builder.is).toHaveBeenCalledWith("deleted_at", null);
    expect(builder.or).toHaveBeenCalledWith("comment.ilike.%service%,title.ilike.%service%");
    expect(builder.eq).toHaveBeenCalledWith("restaurant_id", 8);
    expect(builder.eq).toHaveBeenCalledWith("rating", 2);
    expect(builder.eq).toHaveBeenCalledWith("is_approved", false);
    expect(builder.eq).toHaveBeenCalledWith("is_published", true);
    expect(builder.limit).toHaveBeenCalledWith(500);
  });
});
