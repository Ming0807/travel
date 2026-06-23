import { z } from "zod";
import { optionalBooleanQuery } from "@/lib/validation/query-params";

const optionalId = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().int().positive().nullable()
);

export const adminPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const adminReviewFiltersSchema = adminPaginationSchema.extend({
  search: z.preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
    z.string().max(120).optional()
  ),
  attractionId: optionalId.optional(),
  restaurantId: optionalId.optional(),
  rating: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().min(1).max(5).optional()
  ),
  isApproved: optionalBooleanQuery,
  isPublished: optionalBooleanQuery
});

export type AdminReviewFilters = z.infer<typeof adminReviewFiltersSchema>;
