import { z } from "zod";
import { adminPaginationSchema } from "@/lib/validation/admin-attraction";

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

const booleanFromForm = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "on" || value === "1") return true;
  if (value === "false" || value === "0" || value === "" || value === null || value === undefined) return false;
  return value;
}, z.boolean());

export const adminPhotoSpotFiltersSchema = adminPaginationSchema.extend({
  attractionId: optionalId.optional(),
  search: z.preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
    z.string().max(120).optional()
  ),
  isActive: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.boolean().optional()
  )
});

export const adminPhotoSpotMutationSchema = z.object({
  attractionId: requiredId,
  spotNameTh: z.string().trim().min(1, "Thai photo spot name is required.").max(255),
  spotNameEn: optionalShortText,
  descriptionTh: optionalText,
  descriptionEn: optionalText,
  sampleImagePath: optionalText,
  latitude: optionalCoordinate(-90, 90),
  longitude: optionalCoordinate(-180, 180),
  displayOrder: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? null : value),
    z.coerce.number().int().min(0).max(10000).nullable()
  ),
  isActive: booleanFromForm
});

export const adminPhotoSpotIdSchema = z.object({
  photoSpotId: requiredId
});

export type AdminPhotoSpotFilters = z.infer<typeof adminPhotoSpotFiltersSchema>;
export type AdminPhotoSpotMutationInput = z.infer<typeof adminPhotoSpotMutationSchema>;
