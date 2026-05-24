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

export const adminMediaFiltersSchema = adminPaginationSchema.extend({
  entityId: requiredId.optional(),
  entityType: z.enum(['attraction', 'restaurant', 'story', 'route']).optional(),
  mediaType: z.preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
    z.string().optional()
  ),
  isActive: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.boolean().optional()
  )
});

export const adminMediaMutationSchema = z.object({
  entityId: requiredId,
  entityType: z.enum(['attraction', 'restaurant', 'story', 'route']),
  mediaType: z.enum(['image', 'panorama', 'video360', 'embed', 'external_url']),
  storagePath: z.string().trim().min(1, "Storage path/URL is required."),
  altTextTh: optionalShortText,
  altTextEn: optionalShortText,
  captionTh: optionalShortText,
  captionEn: optionalShortText,
  displayOrder: z.coerce.number().int().optional(),
  isCover: booleanFromForm,
  isActive: booleanFromForm
});

export type AdminMediaFilters = z.infer<typeof adminMediaFiltersSchema>;
export type AdminMediaMutationInput = z.infer<typeof adminMediaMutationSchema>;
