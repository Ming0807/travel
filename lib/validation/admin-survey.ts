import { z } from "zod";
import { adminPaginationSchema } from "@/lib/validation/admin-attraction";

export const adminSurveyFiltersSchema = adminPaginationSchema.extend({
  attractionId: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().positive().optional()
  ),
  provinceId: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().positive().optional()
  ),
  minScore: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().min(1).max(5).optional()
  ),
  maxScore: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.number().int().min(1).max(5).optional()
  ),
}).refine((filters) => {
  if (filters.minScore === undefined || filters.maxScore === undefined) return true;
  return filters.minScore <= filters.maxScore;
}, {
  message: "Minimum score must be less than or equal to maximum score.",
  path: ["maxScore"]
});

export type AdminSurveyFilters = z.infer<typeof adminSurveyFiltersSchema>;
