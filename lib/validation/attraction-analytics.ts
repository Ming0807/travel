import { z } from "zod";

export const attractionEvidenceScopeSchema = z.enum([
  "field_claim",
  "all_records",
  "pilot_only",
  "simulated_only",
]);

export const attractionEntryChannelSchema = z.enum(["qr", "nfc", "direct", "admin_import", "unknown"]);

export const attractionAnalyticsFiltersSchema = z.object({
  attractionId: z.coerce.number().int().positive(),
  dateFrom: z.iso.date(),
  dateTo: z.iso.date(),
  campaignId: z.coerce.number().int().positive().optional(),
  checkinCodeId: z.coerce.number().int().positive().optional(),
  evidenceScope: attractionEvidenceScopeSchema.default("field_claim"),
  entryChannel: attractionEntryChannelSchema.optional(),
}).strict().superRefine((value, context) => {
  if (value.dateFrom > value.dateTo) {
    context.addIssue({ code: "custom", path: ["dateTo"], message: "End date must not precede start date." });
  }
  const days = (Date.parse(`${value.dateTo}T00:00:00Z`) - Date.parse(`${value.dateFrom}T00:00:00Z`)) / 86_400_000;
  if (days > 730) {
    context.addIssue({ code: "custom", path: ["dateTo"], message: "Attraction analytics range must not exceed 730 days." });
  }
});

export type AttractionAnalyticsFilters = z.infer<typeof attractionAnalyticsFiltersSchema>;
