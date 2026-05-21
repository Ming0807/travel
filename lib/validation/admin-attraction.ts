import { z } from "zod";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().max(5000).nullable()
);

const optionalShortText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().max(255).nullable()
);

const requiredId = z.coerce.number().int().positive();

const optionalId = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().int().positive().nullable()
);

const optionalCoordinate = (min: number, max: number) =>
  z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? null : value),
    z.coerce.number().min(min).max(max).nullable()
  );

const optionalPositiveInt = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().int().min(1).max(1000000).nullable()
);

const booleanFromForm = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "on" || value === "1") return true;
  if (value === "false" || value === "0" || value === "" || value === null || value === undefined) return false;
  return value;
}, z.boolean());

export const adminPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const adminAttractionFiltersSchema = adminPaginationSchema.extend({
  search: z.preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
    z.string().max(120).optional()
  ),
  provinceId: optionalId.optional(),
  districtId: optionalId.optional(),
  attractionTypeId: optionalId.optional(),
  isPublished: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.boolean().optional()
  ),
  isActive: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.boolean().optional()
  )
});

export const adminAttractionMutationSchema = z.object({
  provinceId: requiredId,
  districtId: optionalId,
  attractionTypeId: optionalId,
  slug: z
    .string()
    .trim()
    .min(3, "Slug is required.")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, URL-safe, and hyphen-separated."),
  nameTh: z.string().trim().min(1, "Thai attraction name is required.").max(255),
  nameEn: optionalShortText,
  shortDescriptionTh: optionalText,
  shortDescriptionEn: optionalText,
  descriptionTh: optionalText,
  descriptionEn: optionalText,
  historyTh: optionalText,
  historyEn: optionalText,
  latitude: optionalCoordinate(-90, 90),
  longitude: optionalCoordinate(-180, 180),
  addressText: optionalText,
  openingHours: optionalShortText,
  contactInfo: optionalShortText,
  sustainabilityCategory: optionalShortText,
  estimatedCapacityPerDay: optionalPositiveInt,
  isPublished: booleanFromForm,
  isActive: booleanFromForm
});

export const adminAttractionIdSchema = z.object({
  attractionId: requiredId
});

export type AdminAttractionFilters = z.infer<typeof adminAttractionFiltersSchema>;
export type AdminAttractionMutationInput = z.infer<typeof adminAttractionMutationSchema>;
