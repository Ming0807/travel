import { z } from "zod";

const optionalSearch = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
  z.string().max(120).optional()
);

const optionalStatus = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.enum(["active", "inactive"]).optional()
);

export const adminRoleFiltersSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: optionalSearch,
    status: optionalStatus,
    sort: z.enum(["newest", "oldest", "name_asc", "name_desc"]).default("newest"),
  })
  .strict();

export type AdminRoleFilters = z.infer<typeof adminRoleFiltersSchema>;
export type AdminRoleExportFilters = Omit<AdminRoleFilters, "page" | "pageSize">;

export function roleExportFilters(filters: AdminRoleFilters): AdminRoleExportFilters {
  const { page: _page, pageSize: _pageSize, ...rest } = filters;
  void _page;
  void _pageSize;
  return rest;
}
