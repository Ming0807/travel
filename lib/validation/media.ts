import { z } from "zod";
import { adminPaginationSchema } from "./admin-attraction";

const optionalText = z.preprocess(
  (value) => (value === undefined || value === null || (typeof value === "string" && value.trim() === "") ? null : value),
  z.string().trim().nullable()
).default(null);

const optionalShortText = z.preprocess(
  (value) => (value === undefined || value === null || (typeof value === "string" && value.trim() === "") ? null : value),
  z.string().trim().max(255).nullable()
).default(null);

const optionalUrl = z.preprocess(
  (value) => (value === undefined || value === null || (typeof value === "string" && value.trim() === "") ? null : value),
  z.string().trim().url("Source URL must be a valid URL.").max(1000).nullable()
).default(null);

const optionalLicenseText = z.preprocess(
  (value) => (value === undefined || value === null || (typeof value === "string" && value.trim() === "") ? null : value),
  z.string().trim().max(80).nullable()
).default(null);

const requiredId = z.coerce.number().int().positive();

const optionalInt = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().int().optional()
)

const booleanFromForm = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "on" || value === "1") return true;
  if (value === "false" || value === "0" || value === "" || value === null || value === undefined) return false;
  return value;
}, z.boolean());

export const adminMediaEntityTypes = ["attraction", "restaurant", "accommodation", "story", "route"] as const;
export const adminMediaEntityTypeSchema = z.enum(adminMediaEntityTypes);
export const adminMediaLifecycleStatuses = ["draft", "active", "archived"] as const;
export const adminMediaLifecycleStatusSchema = z.enum(adminMediaLifecycleStatuses);

export const adminMediaFiltersSchema = adminPaginationSchema.extend({
  entityId: requiredId.optional(),
  entityType: adminMediaEntityTypeSchema.optional(),
  mediaType: z.preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
    z.string().optional()
  ),
  isActive: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.boolean().optional()
  ),
  lifecycleStatus: z.preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
    adminMediaLifecycleStatusSchema.optional()
  )
});

const mediaMutationPayloadSchema = z.object({
  entityId: requiredId,
  entityType: adminMediaEntityTypeSchema,
  mediaType: z.enum(["image", "panorama", "video360", "embed", "external_url"], {
    error: "Choose a supported media type."
  }),
  storagePath: z.preprocess(
    (value) => (value === undefined || value === null ? "" : value),
    z.string().trim().min(1, "Upload a file or add a URL before saving.")
  ),
  altTextTh: optionalShortText,
  altTextEn: optionalShortText,
  captionTh: optionalShortText,
  captionEn: optionalShortText,
  creditText: optionalShortText,
  sourceUrl: optionalUrl,
  licenseType: optionalLicenseText,
  usageNotes: optionalText,
  lifecycleStatus: z.preprocess(
    (value) => (value === undefined || value === null || value === "" ? "active" : value),
    adminMediaLifecycleStatusSchema
  ),
  displayOrder: optionalInt,
  isCover: booleanFromForm,
  isActive: booleanFromForm
});

export const adminMediaMutationSchema = z.preprocess((value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }

  const raw = value as Record<string, unknown>;

  return {
    entityId: raw.entityId ?? raw.entity_id,
    entityType: raw.entityType ?? raw.entity_type,
    mediaType: raw.mediaType ?? raw.media_type,
    storagePath: raw.storagePath ?? raw.storage_path,
    altTextTh: raw.altTextTh ?? raw.alt_text_th,
    altTextEn: raw.altTextEn ?? raw.alt_text_en,
    captionTh: raw.captionTh ?? raw.caption_th,
    captionEn: raw.captionEn ?? raw.caption_en,
    creditText: raw.creditText ?? raw.credit_text,
    sourceUrl: raw.sourceUrl ?? raw.source_url,
    licenseType: raw.licenseType ?? raw.license_type,
    usageNotes: raw.usageNotes ?? raw.usage_notes,
    lifecycleStatus: raw.lifecycleStatus ?? raw.lifecycle_status,
    displayOrder: raw.displayOrder ?? raw.display_order,
    isCover: raw.isCover ?? raw.is_cover,
    isActive: raw.isActive ?? raw.is_active
  };
}, mediaMutationPayloadSchema);

export type AdminMediaFilters = z.infer<typeof adminMediaFiltersSchema>;
export type AdminMediaMutationInput = z.infer<typeof adminMediaMutationSchema>;
export type AdminMediaEntityType = z.infer<typeof adminMediaEntityTypeSchema>;
