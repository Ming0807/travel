import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type QueryResult = {
  data: unknown[] | null;
  error: unknown;
  count?: number | null;
};

type MockFn = ReturnType<typeof vi.fn>;

type MockQueryBuilder = {
  select: MockFn;
  order: MockFn;
  range: MockFn;
  gte: MockFn;
  lte: MockFn;
  eq: MockFn;
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

import { exportAdminSurveys, listAdminSurveys } from "@/lib/repositories/admin-survey.repository";

function createBuilder(result: QueryResult = { data: [], error: null, count: 0 }): MockQueryBuilder {
  const builder = {} as MockQueryBuilder;
  const chainMethods = ["select", "order", "range", "gte", "lte", "eq", "limit"] as const;

  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }

  builder.then = (onfulfilled, onrejected) => Promise.resolve(result).then(onfulfilled, onrejected);

  return builder;
}

describe("admin survey repository filters", () => {
  let builder: MockQueryBuilder;

  beforeEach(() => {
    vi.clearAllMocks();
    builder = createBuilder();
    serviceRoleMocks.from.mockReturnValue(builder);
  });

  it("applies score, attraction, province, and pagination filters when listing surveys", async () => {
    await listAdminSurveys({
      page: 2,
      pageSize: 10,
      minScore: 3,
      maxScore: 5,
      attractionId: 42,
      provinceId: 7,
    });

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("satisfaction_surveys");
    expect(builder.select).toHaveBeenCalledWith(expect.stringContaining("visits!inner"), { count: "exact" });
    expect(builder.select).toHaveBeenCalledWith(expect.stringContaining("attractions!inner"), { count: "exact" });
    expect(builder.range).toHaveBeenCalledWith(10, 19);
    expect(builder.gte).toHaveBeenCalledWith("overall_score", 3);
    expect(builder.lte).toHaveBeenCalledWith("overall_score", 5);
    expect(builder.eq).toHaveBeenCalledWith("visits.attraction_id", 42);
    expect(builder.eq).toHaveBeenCalledWith("visits.attractions.province_id", 7);
  });

  it("applies the same operational filters when exporting surveys", async () => {
    await exportAdminSurveys(
      {
        minScore: 2,
        maxScore: 4,
        attractionId: 12,
        provinceId: 3,
      },
      500
    );

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("satisfaction_surveys");
    expect(builder.select).toHaveBeenCalledWith(expect.stringContaining("visits!inner"));
    expect(builder.select).toHaveBeenCalledWith(expect.stringContaining("attractions!inner"));
    expect(builder.gte).toHaveBeenCalledWith("overall_score", 2);
    expect(builder.lte).toHaveBeenCalledWith("overall_score", 4);
    expect(builder.eq).toHaveBeenCalledWith("visits.attraction_id", 12);
    expect(builder.eq).toHaveBeenCalledWith("visits.attractions.province_id", 3);
    expect(builder.limit).toHaveBeenCalledWith(500);
  });
});
