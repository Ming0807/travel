import { describe, expect, it } from "vitest";
import { adminRoleFiltersSchema, roleExportFilters } from "@/lib/validation/admin-role";

describe("adminRoleFiltersSchema", () => {
  it("normalizes bounded list filters", () => {
    expect(
      adminRoleFiltersSchema.parse({
        page: "2",
        pageSize: "50",
        search: "  province_admin  ",
        status: "active",
        sort: "name_asc",
      })
    ).toEqual({
      page: 2,
      pageSize: 50,
      search: "province_admin",
      status: "active",
      sort: "name_asc",
    });
  });

  it("rejects unknown, unbounded, and invalid filters", () => {
    expect(adminRoleFiltersSchema.safeParse({ page: 0 }).success).toBe(false);
    expect(adminRoleFiltersSchema.safeParse({ pageSize: 101 }).success).toBe(false);
    expect(adminRoleFiltersSchema.safeParse({ status: "deleted" }).success).toBe(false);
    expect(adminRoleFiltersSchema.safeParse({ unexpected: "value" }).success).toBe(false);
  });

  it("removes pagination without changing export filters", () => {
    const parsed = adminRoleFiltersSchema.parse({
      page: "3",
      search: "viewer",
      status: "inactive",
      sort: "oldest",
    });

    expect(roleExportFilters(parsed)).toEqual({
      search: "viewer",
      status: "inactive",
      sort: "oldest",
    });
  });
});
