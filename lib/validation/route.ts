import { z } from "zod";
import { adminPaginationSchema } from "./admin-attraction";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().nullable()
);

const optionalShortText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().max(255).nullable()
);

const requiredId = z.coerce.number().int().positive();

const booleanFromForm = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "on" || value === "1") return true;
  if (value === "false" || value === "0" || value === "" || value === null || value === undefined) return false;
  return value;
}, z.boolean());

export const adminRouteFiltersSchema = adminPaginationSchema.extend({
  search: z.preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
    z.string().max(120).optional()
  ),
  isPublished: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.boolean().optional()
  ),
  isActive: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.boolean().optional()
  )
});

export const adminRouteMutationSchema = z.object({
  nameTh: z.string().trim().min(1, "Thai name is required.").max(255),
  nameEn: optionalShortText,
  descriptionTh: optionalText,
  descriptionEn: optionalText,
  coverImagePath: optionalText,
  isPublished: booleanFromForm,
  isActive: booleanFromForm
});

export const adminRouteStopMutationSchema = z.object({
  attractionId: requiredId,
  dayNumber: z.coerce.number().int().min(1),
  displayOrder: z.coerce.number().int().min(1),
  stopNoteTh: optionalText,
  stopNoteEn: optionalText
});

export const adminRouteStopsBatchSchema = z.object({
  routeId: requiredId,
  stops: z.array(adminRouteStopMutationSchema)
});

export type AdminRouteFilters = z.infer<typeof adminRouteFiltersSchema>;
export type AdminRouteMutationInput = z.infer<typeof adminRouteMutationSchema>;
export type AdminRouteStopMutationInput = z.infer<typeof adminRouteStopMutationSchema>;
