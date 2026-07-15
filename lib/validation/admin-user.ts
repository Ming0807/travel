import { z } from "zod";

const optionalRoleId = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().int().positive().optional()
);

export const adminUserFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
    z.string().max(120).optional()
  ),
  status: z.enum(["active", "inactive"]).optional(),
  roleId: optionalRoleId,
  sort: z.enum(["newest", "oldest", "name_asc", "name_desc"]).default("newest"),
}).strict();

export type AdminUserFilters = z.infer<typeof adminUserFiltersSchema>;
