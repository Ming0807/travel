import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type QueryResult = {
  data: Array<Record<string, unknown>> | null;
  error: unknown;
  count?: number | null;
};

type MockFn = ReturnType<typeof vi.fn>;
type MockBuilder = {
  select: MockFn;
  eq: MockFn;
  or: MockFn;
  order: MockFn;
  range: MockFn;
  limit: MockFn;
  then: <TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>;
};

const serviceRoleMocks = vi.hoisted(() => ({ from: vi.fn() }));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ from: serviceRoleMocks.from }),
}));

import { exportAdminRoles, listAdminRoles } from "@/lib/repositories/role.repository";

function createBuilder(result: QueryResult): MockBuilder {
  const builder = {} as MockBuilder;
  for (const method of ["select", "eq", "or", "order", "range", "limit"] as const) {
    builder[method] = vi.fn(() => builder);
  }
  builder.then = (onfulfilled, onrejected) => Promise.resolve(result).then(onfulfilled, onrejected);
  return builder;
}

const roleRow = {
  role_id: 8,
  role_name: "content_editor",
  description: "ดูแลเนื้อหา",
  is_active: true,
  created_at: "2026-07-01T00:00:00.000Z",
  role_permissions: [
    { permissions: { permission_name: "story.read" } },
    { permissions: { permission_name: "story.update" } },
  ],
};

describe("admin role repository", () => {
  let builder: MockBuilder;

  beforeEach(() => {
    vi.clearAllMocks();
    builder = createBuilder({ data: [roleRow], error: null, count: 21 });
    serviceRoleMocks.from.mockReturnValue(builder);
  });

  it("applies escaped filters, stable sorting, and pagination", async () => {
    const result = await listAdminRoles({
      page: 2,
      pageSize: 20,
      search: 'editor_100%,"south"',
      status: "active",
      sort: "name_asc",
    });

    expect(serviceRoleMocks.from).toHaveBeenCalledWith("roles");
    expect(String(builder.or.mock.calls[0]?.[0])).toContain(
      'role_name.ilike."%editor\\_100\\%,\\"south\\"%"'
    );
    expect(builder.eq).toHaveBeenCalledWith("is_active", true);
    expect(builder.order).toHaveBeenNthCalledWith(1, "role_name", { ascending: true });
    expect(builder.order).toHaveBeenNthCalledWith(2, "role_id", { ascending: true });
    expect(builder.range).toHaveBeenCalledWith(20, 39);
    expect(result).toMatchObject({ total: 21, page: 2, pageSize: 20 });
    expect(result.items[0]?.permissions).toEqual(["story.read", "story.update"]);
  });

  it("uses identical filters and a hard limit for export", async () => {
    const rows = await exportAdminRoles(
      { search: "editor", status: "inactive", sort: "oldest" },
      51
    );

    expect(builder.or).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith("is_active", false);
    expect(builder.order).toHaveBeenNthCalledWith(1, "created_at", { ascending: true });
    expect(builder.limit).toHaveBeenCalledWith(51);
    expect(builder.range).not.toHaveBeenCalled();
    expect(rows[0]?.role_name).toBe("content_editor");
  });
});
