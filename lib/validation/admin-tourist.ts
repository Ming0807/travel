import { z } from "zod";

const optionalId = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().int().positive().optional()
);

export const adminTouristFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
    z.string().max(120).optional()
  ),
  countryId: optionalId,
  provinceId: optionalId,
  provider: z.enum(["anonymous_device", "line", "google", "email"]).optional(),
  sort: z.enum(["newest", "oldest", "name_asc", "name_desc"]).default("newest"),
});

export const adminTouristIdSchema = z.string().uuid();

export type AdminTouristFilters = z.infer<typeof adminTouristFiltersSchema>;
