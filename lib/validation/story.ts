import { z } from "zod";
import { adminPaginationSchema } from "./admin-attraction";
import { optionalBooleanQuery } from "@/lib/validation/query-params";
import { storyDocumentSchema } from "@/lib/content/story-document";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().nullable()
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

const booleanFromForm = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "on" || value === "1") return true;
  if (value === "false" || value === "0" || value === "" || value === null || value === undefined) return false;
  return value;
}, z.boolean());

const storyStatusSchema = z.enum([
  "draft",
  "submitted",
  "in_review",
  "changes_requested",
  "approved",
  "scheduled",
  "published",
  "rejected",
  "archived",
]);

const optionalDateQuery = z.preprocess(
  (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day));
      return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
    }, "Invalid calendar date.")
    .optional()
);

export const adminStoryFiltersSchema = adminPaginationSchema
  .extend({
    search: z.preprocess(
      (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
      z.string().max(120).optional()
    ),
    provinceId: optionalId.optional(),
    topicId: optionalId.optional(),
    authorType: z.enum(["admin", "tourist"]).optional(),
    status: z.preprocess(
      (value) => (value === "" || value === null || value === undefined ? undefined : value),
      storyStatusSchema.optional()
    ),
    readiness: z.enum(["ready", "needs_work", "unscored"]).optional(),
    dateFrom: optionalDateQuery,
    dateTo: optionalDateQuery,
    isPublished: optionalBooleanQuery,
  })
  .superRefine((filters, context) => {
    if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
      context.addIssue({
        code: "custom",
        message: "Start date must be on or before end date.",
        path: ["dateTo"],
      });
    }
  });

export const adminStoryMutationSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(255),
  slug: z
    .string()
    .trim()
    .min(3, "Slug is required.")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, URL-safe, and hyphen-separated."),
  excerpt: optionalText,
  content: optionalText,
  provinceId: optionalId,
  category: optionalShortText,
  isPublished: booleanFromForm,
  status: z.enum([
    "draft",
    "pending",
    "submitted",
    "in_review",
    "changes_requested",
    "approved",
    "scheduled",
    "published",
    "rejected",
    "archived",
  ]).optional(),
  coverMediaId: optionalId
});

export const adminStoryIdSchema = z.object({
  storyId: requiredId
});

const editorialChangeSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    slug: z
      .string()
      .trim()
      .min(3)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    excerpt: z.string().trim().max(2_000).nullable().optional(),
    legacyContent: z.string().max(500_000).nullable().optional(),
    contentDocument: storyDocumentSchema.nullable().optional(),
    contentSchemaVersion: z.literal(1).optional(),
    provinceId: z.number().int().positive().nullable().optional(),
    geographicScope: z.enum(["province", "cross_province"]).optional(),
    topicIds: z
      .array(z.number().int().positive())
      .max(20)
      .refine((items) => new Set(items).size === items.length, "Story topics must be unique.")
      .optional(),
    seoTitle: z.string().trim().max(255).nullable().optional(),
    seoDescription: z.string().trim().max(500).nullable().optional(),
    usesGeneratedSeo: z.boolean().optional(),
    primaryLanguage: z.enum(["th", "en", "ms"]).optional(),
    scheduledAt: z.string().datetime({ offset: true }).nullable().optional(),
    readingMinutes: z.number().int().min(1).max(120).nullable().optional(),
    contentQualityScore: z.number().int().min(0).max(100).nullable().optional(),
    targetStatus: storyStatusSchema.optional(),
    reviewNote: z.string().trim().max(2_000).nullable().optional(),
    changeSummary: z.string().trim().max(500).nullable().optional(),
  })
  .strict()
  .refine((change) => Object.keys(change).length > 0, "Editorial change cannot be empty.");

export const storyEditorialChangeInputSchema = z.object({
  storyId: requiredId,
  expectedUpdatedAt: z.string().datetime({ offset: true }),
  change: editorialChangeSchema,
});

export type AdminStoryFilters = z.infer<typeof adminStoryFiltersSchema>;
export type AdminStoryMutationInput = z.infer<typeof adminStoryMutationSchema>;
export type StoryEditorialChangeInput = z.infer<typeof storyEditorialChangeInputSchema>;
