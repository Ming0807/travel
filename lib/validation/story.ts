import { z } from "zod";
import { adminPaginationSchema } from "./admin-attraction";
import { optionalBooleanQuery } from "@/lib/validation/query-params";

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

export const adminStoryFiltersSchema = adminPaginationSchema.extend({
  search: z.preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
    z.string().max(120).optional()
  ),
  provinceId: optionalId.optional(),
  status: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.string().optional()
  ),
  isPublished: optionalBooleanQuery
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

export type AdminStoryFilters = z.infer<typeof adminStoryFiltersSchema>;
export type AdminStoryMutationInput = z.infer<typeof adminStoryMutationSchema>;
