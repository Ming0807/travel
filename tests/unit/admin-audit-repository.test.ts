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
  is: MockFn;
  ilike: MockFn;
  or: MockFn;
  insert: MockFn;
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

import { getAuditLogsPaginated, logAdminAction } from "@/lib/repositories/admin-audit.repository";

function createBuilder(result: QueryResult = { data: [], error: null, count: 0 }): MockQueryBuilder {
  const builder = {} as MockQueryBuilder;
  const chainMethods = ["select", "order", "range", "gte", "lte", "eq", "is", "ilike", "or", "insert"] as const;

  for (const method of chainMethods) {
    builder[method] = vi.fn(() => builder);
  }

  builder.then = (onfulfilled, onrejected) => Promise.resolve(result).then(onfulfilled, onrejected);

  return builder;
}

describe("admin audit repository filters", () => {
  let builder: MockQueryBuilder;

  beforeEach(() => {
    vi.clearAllMocks();
    builder = createBuilder();
    serviceRoleMocks.from.mockReturnValue(builder);
  });

  it("applies strict list/export filters and sort consistently", async () => {
    await getAuditLogsPaginated(2, 25, {
      adminId: "system",
      action: "export",
      entityType: "media",
      startDate: "2026-07-01",
      endDate: "2026-07-15",
      search: "50%_promo,token\\x",
      sort: "oldest",
    });

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("audit_logs");
    expect(builder.is).toHaveBeenCalledWith("admin_id", null);
    expect(builder.ilike).toHaveBeenCalledWith("action", "%export%");
    expect(builder.ilike).toHaveBeenCalledWith("entity_type", "%media%");
    expect(builder.gte).toHaveBeenCalledWith("created_at", "2026-07-01T00:00:00.000Z");
    expect(builder.lte).toHaveBeenCalledWith("created_at", "2026-07-15T23:59:59.999Z");
    expect(builder.or).toHaveBeenCalledWith("action.ilike.%50\\%\\_promo token\\\\x%,entity_type.ilike.%50\\%\\_promo token\\\\x%");
    expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: true });
    expect(builder.range).toHaveBeenCalledWith(25, 49);
  });

  it("sanitizes legacy logAdminAction details before inserting them into new_data", async () => {
    await logAdminAction({
      adminId: "admin-1",
      action: "data.export",
      entityType: "audit_export",
      details: {
        rowCount: 1,
        signedUrl: "https://storage.example.test/file.csv?token=secret",
        provider_user_id: "line-user-id",
      },
    });

    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        new_data: {
          rowCount: 1,
          signedUrl: "[REDACTED]",
          provider_user_id: "[REDACTED]",
        },
      })
    );
  });
});
