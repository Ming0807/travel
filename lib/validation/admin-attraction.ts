import { z } from "zod";
import { optionalBooleanQuery } from "@/lib/validation/query-params";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().max(5000).nullable()
).default(null);

const optionalShortText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().max(255).nullable()
).default(null);

const requiredId = z.coerce.number().int().positive();

const optionalId = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().int().positive().nullable()
).default(null);

const optionalCoordinate = (min: number, max: number) =>
  z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? null : value),
    z.coerce.number().min(min).max(max).nullable()
  ).default(null);

const optionalPositiveInt = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().int().min(1).max(1000000).nullable()
).default(null);

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
  isPublished: optionalBooleanQuery,
  isActive: optionalBooleanQuery
});

export const adminAttractionMutationSchema = z.object({
  provinceId: requiredId,
  districtId: optionalId,
  attractionTypeId: optionalId,
  attractionTypeIds: z.array(requiredId).max(4, "เลือกหมวดหมู่ได้สูงสุด 4 หมวด").default([]),
  primaryAttractionTypeId: optionalId,
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
  travelTipsTh: optionalText,
  travelTipsEn: optionalText,
  howToGetThereTh: optionalText,
  howToGetThereEn: optionalText,
  customSectionsJson: optionalText,
  sustainabilityCategory: optionalShortText,
  estimatedCapacityPerDay: optionalPositiveInt,
  isPublished: booleanFromForm,
  isActive: booleanFromForm
}).superRefine((value, context) => {
  if (value.attractionTypeIds.length > 0 && value.primaryAttractionTypeId === null) {
    context.addIssue({ code: "custom", path: ["primaryAttractionTypeId"], message: "กรุณาเลือกหมวดหลัก" });
  }
  if (value.primaryAttractionTypeId !== null && !value.attractionTypeIds.includes(value.primaryAttractionTypeId)) {
    context.addIssue({ code: "custom", path: ["primaryAttractionTypeId"], message: "หมวดหลักต้องอยู่ในหมวดที่เลือก" });
  }
  if (value.isPublished && value.primaryAttractionTypeId === null) {
    context.addIssue({ code: "custom", path: ["primaryAttractionTypeId"], message: "สถานที่ที่เผยแพร่ต้องมีหมวดหลัก" });
  }
});

export function parseAdminAttractionMutationFormData(formData: FormData) {
  const raw = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue | FormDataEntryValue[]>;
  const repeatedValues = formData.getAll("attractionTypeIds");
  const hasMultiCategoryFields = repeatedValues.length > 0 || formData.has("primaryAttractionTypeId");
  const legacyPrimary = formData.get("attractionTypeId");
  const rawIds = hasMultiCategoryFields ? repeatedValues : legacyPrimary ? [legacyPrimary] : [];
  const normalizedIds = Array.from(new Set(
    rawIds
      .map((value) => typeof value === "string" ? Number(value) : Number.NaN)
      .filter((value) => Number.isSafeInteger(value) && value > 0),
  ));
  const primaryValue = hasMultiCategoryFields
    ? formData.get("primaryAttractionTypeId")
    : legacyPrimary;

  raw.attractionTypeIds = normalizedIds.map(String);
  raw.primaryAttractionTypeId = primaryValue ?? "";
  raw.attractionTypeId = primaryValue ?? "";

  return adminAttractionMutationSchema.safeParse(raw);
}

export const adminAttractionIdSchema = z.object({
  attractionId: requiredId
});

export type AdminAttractionFilters = z.infer<typeof adminAttractionFiltersSchema>;
export type AdminAttractionMutationInput = z.infer<typeof adminAttractionMutationSchema>;
