import { z } from "zod";
import { adminPaginationSchema } from "@/lib/validation/admin-attraction";

const requiredId = z.coerce.number().int().positive();

const optionalId = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : value),
  z.coerce.number().int().positive().nullable()
).default(null);

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().max(255).nullable()
).default(null);

const optionalDateTime = z
  .preprocess(
    (value) => (value === "" || value === null || value === undefined ? null : value),
    z.string().trim().nullable()
  )
  .default(null)
  .refine((value) => value === null || !Number.isNaN(Date.parse(value)), {
    message: "Date and time must be valid."
  })
  .transform((value) => (value === null ? null : new Date(value).toISOString()));

const booleanFromForm = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "on" || value === "1") return true;
  if (value === "false" || value === "0" || value === "" || value === null || value === undefined) return false;
  return value;
}, z.boolean());

export const adminCheckinCodeFiltersSchema = adminPaginationSchema.extend({
  attractionId: optionalId.optional(),
  photoSpotId: optionalId.optional(),
  search: z.preprocess(
    (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
    z.string().max(120).optional()
  ),
  isActive: z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : value),
    z.coerce.boolean().optional()
  )
});

export const adminCheckinCodeMutationSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Check-in code is required.")
      .max(100)
      .regex(/^[a-zA-Z0-9_-]+$/, "Check-in code must be URL-safe."),
    attractionId: requiredId,
    photoSpotId: optionalId,
    label: optionalText,
    isActive: booleanFromForm,
    startsAt: optionalDateTime,
    endsAt: optionalDateTime
  })
  .refine(
    (data) => !data.startsAt || !data.endsAt || new Date(data.startsAt).getTime() < new Date(data.endsAt).getTime(),
    {
      message: "Start date must be before end date.",
      path: ["endsAt"]
    }
  );

export const adminCheckinCodeIdSchema = z.object({
  checkinCodeId: requiredId
});

export type AdminCheckinCodeFilters = z.infer<typeof adminCheckinCodeFiltersSchema>;
export type AdminCheckinCodeMutationInput = z.infer<typeof adminCheckinCodeMutationSchema>;
