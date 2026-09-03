import { z } from "zod";
import { DASHBOARD_DATE_RANGE_MAX_DAYS } from "@/constants/dashboard-metrics";
import { attractionEvidenceScopeSchema } from "@/lib/validation/attraction-analytics";
export { getPreviousDashboardPeriod } from "@/lib/services/dashboard-comparison";

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function dateToInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDateInput(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getDefaultDashboardDateRange(now = new Date()) {
  const dateTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dateFrom = new Date(dateTo);
  dateFrom.setUTCDate(dateTo.getUTCDate() - 29);

  return {
    dateFrom: dateToInputValue(dateFrom),
    dateTo: dateToInputValue(dateTo)
  };
}

const optionalPositiveId = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().int().positive().optional()
);

const optionalScore = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? undefined : value),
  z.coerce.number().min(1).max(5).optional()
);

const dashboardDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format.")
  .refine((value) => parseDateInput(value) !== null, "Date is invalid.");

export const dashboardFiltersSchema = z
  .object({
    dateFrom: dashboardDateSchema,
    dateTo: dashboardDateSchema,
    comparisonMode: z.literal("previous_period").optional(),
    evidenceScope: attractionEvidenceScopeSchema.default("field_claim"),
    provinceId: optionalPositiveId,
    districtId: optionalPositiveId,
    attractionId: optionalPositiveId,
    attractionTypeId: optionalPositiveId,
    originCountryId: optionalPositiveId,
    originProvinceId: optionalPositiveId,
    ageGroup: z
      .preprocess(
        (value) => (typeof value === "string" && value.trim() !== "" ? value.trim() : undefined),
        z.string().max(50).optional()
      ),
    transportModeId: optionalPositiveId,
    travelPurposeId: optionalPositiveId,
    satisfactionMin: optionalScore,
    satisfactionMax: optionalScore
  })
  .superRefine((filters, ctx) => {
    const dateFrom = parseDateInput(filters.dateFrom);
    const dateTo = parseDateInput(filters.dateTo);

    if (!dateFrom || !dateTo) return;

    if (dateFrom > dateTo) {
      ctx.addIssue({
        code: "custom",
        path: ["dateFrom"],
        message: "date_from must be before or equal to date_to."
      });
    }

    const diffDays = Math.floor((dateTo.getTime() - dateFrom.getTime()) / 86_400_000) + 1;
    if (diffDays > DASHBOARD_DATE_RANGE_MAX_DAYS) {
      ctx.addIssue({
        code: "custom",
        path: ["dateTo"],
        message: `Dashboard date range cannot exceed ${DASHBOARD_DATE_RANGE_MAX_DAYS} days.`
      });
    }

    if (
      filters.satisfactionMin !== undefined &&
      filters.satisfactionMax !== undefined &&
      filters.satisfactionMin > filters.satisfactionMax
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["satisfactionMin"],
        message: "Minimum satisfaction must be less than or equal to maximum satisfaction."
      });
    }
  });

export function normalizeDashboardSearchParams(searchParams: RawSearchParams, now = new Date()) {
  const defaults = getDefaultDashboardDateRange(now);

  return {
    dateFrom: firstValue(searchParams.date_from) ?? firstValue(searchParams.dateFrom) ?? defaults.dateFrom,
    dateTo: firstValue(searchParams.date_to) ?? firstValue(searchParams.dateTo) ?? defaults.dateTo,
    comparisonMode: firstValue(searchParams.compare) ?? firstValue(searchParams.comparisonMode),
    evidenceScope: firstValue(searchParams.evidence_scope) ?? firstValue(searchParams.evidenceScope),
    provinceId: firstValue(searchParams.province_id) ?? firstValue(searchParams.provinceId),
    districtId: firstValue(searchParams.district_id) ?? firstValue(searchParams.districtId),
    attractionId: firstValue(searchParams.attraction_id) ?? firstValue(searchParams.attractionId),
    attractionTypeId: firstValue(searchParams.attraction_type_id) ?? firstValue(searchParams.attractionTypeId),
    originCountryId: firstValue(searchParams.origin_country_id) ?? firstValue(searchParams.originCountryId),
    originProvinceId: firstValue(searchParams.origin_province_id) ?? firstValue(searchParams.originProvinceId),
    ageGroup: firstValue(searchParams.age_group) ?? firstValue(searchParams.ageGroup),
    transportModeId: firstValue(searchParams.transport_mode_id) ?? firstValue(searchParams.transportModeId),
    travelPurposeId: firstValue(searchParams.travel_purpose_id) ?? firstValue(searchParams.travelPurposeId),
    satisfactionMin: firstValue(searchParams.satisfaction_min) ?? firstValue(searchParams.satisfactionMin),
    satisfactionMax: firstValue(searchParams.satisfaction_max) ?? firstValue(searchParams.satisfactionMax)
  };
}

export function parseDashboardFilters(searchParams: RawSearchParams, now = new Date()) {
  return dashboardFiltersSchema.safeParse(normalizeDashboardSearchParams(searchParams, now));
}

export type DashboardFiltersInput = z.infer<typeof dashboardFiltersSchema>;
