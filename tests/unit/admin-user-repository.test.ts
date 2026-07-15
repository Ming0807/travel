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

import {
  exportAdminUsers,
  getAdminUserRoleOptions,
  listAdminUsers,
} from "@/lib/repositories/admin-user.repository";
import { adminUserFiltersSchema } from "@/lib/validation/admin-user";

const buildersByTable = new Map<string, MockBuilder[]>();
const resultsByTable = new Map<string, QueryResult[]>();

function createBuilder(result: QueryResult): MockBuilder {
  const builder = {} as MockBuilder;
  for (const method of ["select", "eq", "or", "order", "range", "limit"] as const) {
    builder[method] = vi.fn(() => builder);
  }
  builder.then = (onfulfilled, onrejected) => Promise.resolve(result).then(onfulfilled, onrejected);
  return builder;
}

function setResults(table: string, ...results: QueryResult[]): void {
  resultsByTable.set(table, [...results]);
}

function result(data: QueryResult["data"] = [], count: number | null = 0): QueryResult {
  return { data, error: null, count };
}

const userRow = {
  admin_id: "11111111-1111-4111-8111-111111111111",
  email: "admin@example.com",
  display_name: "ผู้ดูแลทดสอบ",
  is_active: true,
  last_login_at: "2026-07-10T01:00:00.000Z",
  created_at: "2026-07-01T00:00:00.000Z",
  admin_user_roles: [
    { role_id: 3, roles: { role_name: "province_admin" } },
    { role_id: 1, roles: { role_name: "super_admin" } },
  ],
};

describe("admin user repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buildersByTable.clear();
    resultsByTable.clear();
    serviceRoleMocks.from.mockImplementation((table: string) => {
      const nextResult = resultsByTable.get(table)?.shift() ?? result();
      const builder = createBuilder(nextResult);
      buildersByTable.set(table, [...(buildersByTable.get(table) ?? []), builder]);
      return builder;
    });
  });

  it("validates and normalizes bounded list filters", () => {
    expect(adminUserFiltersSchema.parse({ search: "  ผู้ดูแล  ", roleId: "3" })).toMatchObject({
      page: 1,
      pageSize: 20,
      search: "ผู้ดูแล",
      roleId: 3,
      sort: "newest",
    });
    expect(adminUserFiltersSchema.safeParse({ page: "0" }).success).toBe(false);
    expect(adminUserFiltersSchema.safeParse({ pageSize: "101" }).success).toBe(false);
    expect(adminUserFiltersSchema.safeParse({ status: "deleted" }).success).toBe(false);
    expect(adminUserFiltersSchema.safeParse({ sort: "email" }).success).toBe(false);
    expect(adminUserFiltersSchema.safeParse({ search: "x".repeat(121) }).success).toBe(false);
  });

  it("applies escaped search, status, role, stable sort, and range on the server", async () => {
    setResults("admin_users", result([userRow], 41));

    const response = await listAdminUsers({
      page: 2,
      pageSize: 20,
      search: "ops_100%,(\\\"north\")",
      status: "active",
      roleId: 3,
      sort: "name_asc",
    });

    const query = buildersByTable.get("admin_users")?.[0];
    expect(query?.select.mock.calls[0]?.[0]).toContain("filter_roles:admin_user_roles!inner(role_id)");
    const searchFilter = String(query?.or.mock.calls[0]?.[0]);
    expect(searchFilter).toContain('display_name.ilike."%ops\\_100\\%');
    expect(searchFilter).toContain('email.ilike."%ops\\_100\\%');
    expect(searchFilter).toContain('\\\\\\"north');
    expect(searchFilter).not.toContain("ilike.%ops_100%");
    expect(query?.eq).toHaveBeenCalledWith("is_active", true);
    expect(query?.eq).toHaveBeenCalledWith("filter_roles.role_id", 3);
    expect(query?.order).toHaveBeenNthCalledWith(1, "display_name", { ascending: true });
    expect(query?.order).toHaveBeenNthCalledWith(2, "admin_id", { ascending: true });
    expect(query?.range).toHaveBeenCalledWith(20, 39);
    expect(response).toMatchObject({ total: 41, page: 2, pageSize: 20 });
    expect(response.items[0]).toMatchObject({
      admin_id: userRow.admin_id,
      email: "admin@example.com",
      roles: ["province_admin", "super_admin"],
    });
  });

  it("uses the identical validated filters for a bounded export query", async () => {
    setResults("admin_users", result([userRow]));

    const rows = await exportAdminUsers(
      {
        search: "admin_100%",
        status: "inactive",
        roleId: 3,
        sort: "oldest",
      },
      51
    );

    const query = buildersByTable.get("admin_users")?.[0];
    expect(query?.or).toHaveBeenCalledWith(
      'display_name.ilike."%admin\\_100\\%%",email.ilike."%admin\\_100\\%%"'
    );
    expect(query?.eq).toHaveBeenCalledWith("is_active", false);
    expect(query?.eq).toHaveBeenCalledWith("filter_roles.role_id", 3);
    expect(query?.order).toHaveBeenNthCalledWith(1, "created_at", { ascending: true });
    expect(query?.limit).toHaveBeenCalledWith(51);
    expect(rows[0]?.roles).toEqual(["province_admin", "super_admin"]);
  });

  it("loads role filter options without exposing permission records", async () => {
    setResults(
      "roles",
      result([
        { role_id: 1, role_name: "super_admin" },
        { role_id: 3, role_name: "province_admin" },
      ])
    );

    await expect(getAdminUserRoleOptions()).resolves.toEqual([
      { role_id: 1, role_name: "super_admin" },
      { role_id: 3, role_name: "province_admin" },
    ]);
    const query = buildersByTable.get("roles")?.[0];
    expect(query?.select).toHaveBeenCalledWith("role_id, role_name");
  });
});
