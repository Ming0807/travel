import { z } from "zod";
import { adminPaginationSchema } from "@/lib/validation/admin-attraction";

const optionalDate = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.iso.date().optional()
);

export const adminSurveyFiltersSchema = adminPaginationSchema.extend({
  search: z.preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
    z.string().max(120).optional()
  ),
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
  dateFrom: optionalDate,
  dateTo: optionalDate,
}).refine((filters) => {
  if (filters.minScore === undefined || filters.maxScore === undefined) return true;
  return filters.minScore <= filters.maxScore;
}, {
  message: "Minimum score must be less than or equal to maximum score.",
  path: ["maxScore"]
}).refine((filters) => {
  if (!filters.dateFrom || !filters.dateTo) return true;
  return filters.dateFrom <= filters.dateTo;
}, {
  message: "วันที่สิ้นสุดต้องไม่อยู่ก่อนวันที่เริ่มต้น",
  path: ["dateTo"]
});

export const adminSurveyIdSchema = z.uuid();

export type AdminSurveyFilters = z.infer<typeof adminSurveyFiltersSchema>;
