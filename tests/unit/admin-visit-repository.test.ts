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
  gte: MockFn;
  lte: MockFn;
  eq: MockFn;
  or: MockFn;
  in: MockFn;
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

import { exportAdminVisits, listAdminVisits } from "@/lib/repositories/admin-visit.repository";

function createBuilder(result: QueryResult = { data: [], error: null, count: 0 }): MockQueryBuilder {
  const builder = {} as MockQueryBuilder;
  const chainMethods = ["select", "order", "range", "gte", "lte", "eq", "or", "in", "limit"] as const;

  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }

  builder.then = (onfulfilled, onrejected) => Promise.resolve(result).then(onfulfilled, onrejected);

  return builder;
}

describe("admin visit repository filters", () => {
  let builder: MockQueryBuilder;

  beforeEach(() => {
    vi.clearAllMocks();
    builder = createBuilder();
    serviceRoleMocks.from.mockReturnValue(builder);
  });

  it("applies province, attraction, status, date, search, and pagination filters when listing visits", async () => {
    await listAdminVisits({
      page: 3,
      pageSize: 25,
      search: "tourist-123",
      attractionId: 42,
      provinceId: 7,
      completionStatus: "certificate_generated",
      dateFrom: "2026-06-01",
      dateTo: "2026-06-30",
    });

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("visits");
    expect(builder.select).toHaveBeenCalledWith(expect.stringContaining("attractions!inner"), { count: "exact" });
    expect(builder.range).toHaveBeenCalledWith(50, 74);
    expect(builder.or).toHaveBeenCalledWith("tourist_id.ilike.%tourist-123%");
    expect(builder.eq).toHaveBeenCalledWith("attraction_id", 42);
    expect(builder.eq).toHaveBeenCalledWith("attractions.province_id", 7);
    expect(builder.eq).toHaveBeenCalledWith("completion_status", "certificate_generated");
    expect(builder.gte).toHaveBeenCalledWith("visit_date", "2026-06-01");
    expect(builder.lte).toHaveBeenCalledWith("visit_date", "2026-06-30");
  });

  it("applies the same filters when exporting visits", async () => {
    await exportAdminVisits(
      {
        search: "tourist-456",
        attractionId: 12,
        provinceId: 3,
        completionStatus: "survey_completed",
        dateFrom: "2026-05-01",
        dateTo: "2026-05-31",
      },
      500
    );

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("visits");
    expect(builder.select).toHaveBeenCalledWith(expect.stringContaining("attractions!inner"));
    expect(builder.or).toHaveBeenCalledWith("tourist_id.ilike.%tourist-456%");
    expect(builder.eq).toHaveBeenCalledWith("attraction_id", 12);
    expect(builder.eq).toHaveBeenCalledWith("attractions.province_id", 3);
    expect(builder.eq).toHaveBeenCalledWith("completion_status", "survey_completed");
    expect(builder.gte).toHaveBeenCalledWith("visit_date", "2026-05-01");
    expect(builder.lte).toHaveBeenCalledWith("visit_date", "2026-05-31");
    expect(builder.limit).toHaveBeenCalledWith(500);
  });
});
