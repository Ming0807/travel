import { z } from "zod";
import { adminPaginationSchema } from "@/lib/validation/admin-attraction";

const optionalId = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().int().positive().optional()
);

const optionalDateString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
  z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: "Invalid date" }).optional()
);

export const adminVisitFiltersSchema = adminPaginationSchema.extend({
  search: z.preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
    z.string().max(120).optional()
  ),
  attractionId: optionalId,
  provinceId: optionalId,
  completionStatus: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.enum(["started", "minimal_form_completed", "photo_uploaded", "certificate_generated", "survey_completed", "abandoned"]).optional()
  ),
  dateFrom: optionalDateString,
  dateTo: optionalDateString,
});

export type AdminVisitFilters = z.infer<typeof adminVisitFiltersSchema>;
