import { NextResponse } from "next/server";
import {
  DashboardServiceError,
  getDashboardAnalytics,
} from "@/lib/services/dashboard.service";
import {
  AdminAuthError,
  requirePermission,
  type GuardResult,
  type PermissionKey,
} from "@/lib/auth/guards";
import { getDashboardRepositoryPayload } from "@/lib/repositories/dashboard.repository";
import { parseDashboardFilters } from "@/lib/validation/dashboard-filters";
import type { DashboardFilters } from "@/types/dashboard";
import {
  createExportResponse,
  parseExportFormat,
  type ExportFormat,
} from "@/lib/utils/export-response";
import { firstJoin, type SupabaseJoin } from "@/lib/utils/supabase-joins";
import { logAuditAction } from "@/lib/services/audit-log.service";

type DashboardExportRecord = Record<string, unknown>;
type DashboardExportType = "summary" | "expenses" | "tourists" | "visits" | "surveys";

function mapAdminError(error: AdminAuthError): DashboardServiceError {
  if (error.code === "UNAUTHORIZED") {
    return new DashboardServiceError("UNAUTHORIZED", "Please sign in to view this dashboard.");
  }
  return new DashboardServiceError("FORBIDDEN", "You do not have permission to view this dashboard.");
}

function safeString(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val);
}

function parseExportType(raw: string | undefined): DashboardExportType | null {
  if (!raw) return "summary";
  if (["summary", "expenses", "tourists", "visits", "surveys"].includes(raw)) {
    return raw as DashboardExportType;
  }
  return null;
}

function permissionForExportType(type: DashboardExportType): PermissionKey {
  switch (type) {
    case "expenses":
      return "export.expense_data";
    case "tourists":
      return "export.tourist_summary";
    case "visits":
      return "export.visit_records";
    case "surveys":
      return "export.survey_data";
    case "summary":
    default:
      return "export.summary";
  }
}

function dashboardFilename(type: DashboardExportType): string {
  const datePrefix = new Date().toISOString().split("T")[0];
  return `dashboard_export_${type}_${datePrefix}`;
}

async function respondWithAudit(
  rows: Array<Record<string, unknown>>,
  type: DashboardExportType,
  format: ExportFormat,
  guard: GuardResult,
  filters: Record<string, string>,
) {
  const exportRows = rows.length === 0 ? [{ Message: "No data available" }] : rows;

  await logAuditAction({
    actor: guard.actor,
    action: `export.dashboard.${type}.${format}`,
    entityType: "dashboard_export",
    result: "success",
    metadata: {
      exportType: type,
      format,
      filters,
      rowCount: rows.length,
    },
  });

  return await createExportResponse(exportRows, dashboardFilename(type), format);
}

export async function GET(request: Request) {
  let guard: GuardResult | null = null;
  let exportType: DashboardExportType | null = null;
  let format: ExportFormat = "csv";
  let filtersForAudit: Record<string, string> = {};

  try {
    const { searchParams } = new URL(request.url);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    filtersForAudit = { ...params };

    format = parseExportFormat(searchParams.get("format"));
    exportType = parseExportType(params.type);
    if (!exportType) {
      return new NextResponse("Unknown export type", { status: 400 });
    }

    try {
      await requirePermission("dashboard.read");
      guard = await requirePermission(permissionForExportType(exportType));
    } catch (error) {
      const err = mapAdminError(error as AdminAuthError);
      return new NextResponse(err.message, { status: err.code === "UNAUTHORIZED" ? 401 : 403 });
    }

    const parsed = parseDashboardFilters(params);
    if (!parsed.success) {
      await logAuditAction({
        actor: guard.actor,
        action: `export.dashboard.${exportType}.${format}`,
        entityType: "dashboard_export",
        result: "failed",
        metadata: {
          exportType,
          format,
          filters: filtersForAudit,
          reason: "invalid_filters",
        },
      });
      return new NextResponse("Invalid filters", { status: 400 });
    }

    if (exportType === "expenses") {
      const data = await getDashboardAnalytics(params, "expenses");
      const rows: Array<Record<string, unknown>> = [
        ...data.expense.spendingRanges.map((range) => ({
          Section: "Spending Range",
          Label: range.label,
          Responses: range.value,
          Percentage: "",
          "Min Range (THB)": "",
          "Max Range (THB)": "",
          Note: "Self-reported range-based estimate, not verified revenue",
        })),
        {
          Section: "Estimated Range",
          Label: "Estimated minimum",
          Responses: data.expense.spendingRangeResponseCount,
          Percentage: "",
          "Min Range (THB)": data.expense.estimatedMin ?? "",
          "Max Range (THB)": data.expense.estimatedMax ?? "",
          Note: data.expense.hasOpenEndedRange ? "Maximum includes open-ended range" : "",
        },
        ...data.expense.expenseCategories.map((cat) => ({
          Section: "Expense Category",
          Label: cat.label,
          Responses: cat.value,
          Percentage: cat.percent !== null ? `${(cat.percent * 100).toFixed(1)}%` : "",
          "Min Range (THB)": "",
          "Max Range (THB)": "",
          Note: "",
        })),
        {
          Section: "Methodology",
          Label: "Note",
          Responses: "",
          Percentage: "",
          "Min Range (THB)": "",
          "Max Range (THB)": "",
          Note: data.expense.methodologyNote,
        },
      ];

      return await respondWithAudit(rows, exportType, format, guard, filtersForAudit);
    }

    if (exportType === "summary") {
      const data = await getDashboardAnalytics(params, "executive");
      const rows = data.executive.topAttractions.map((attr) => ({
        Rank: attr.rank,
        Attraction: attr.attractionName,
        Province: attr.provinceName,
        Visits: attr.visitCount,
        Certificates: attr.certificateCount,
        Surveys: attr.surveyResponseCount,
        "Average Satisfaction": attr.averageSatisfaction ?? "",
        "Generated At": data.generatedAt,
        Note: "Dashboard summary export uses aggregated planning metrics only",
      }));

      return await respondWithAudit(rows, exportType, format, guard, filtersForAudit);
    }

    const payload = await getDashboardRepositoryPayload(parsed.data as DashboardFilters, exportType);

    if (exportType === "tourists") {
      const uniqueTourists = new Map<string, DashboardExportRecord>();
      payload.visits.forEach((v) => {
        const tourist = firstJoin(v.tourists as SupabaseJoin<DashboardExportRecord>);
        if (tourist && v.tourist_id) {
          uniqueTourists.set(String(v.tourist_id), tourist);
        }
      });

      const rows = Array.from(uniqueTourists.values()).map((t) => {
        const country = firstJoin(t.countries as SupabaseJoin<DashboardExportRecord>);
        const province = firstJoin(t.provinces as SupabaseJoin<DashboardExportRecord>);
        return {
          "Age Group": safeString(t.age_group),
          "Preferred Language": safeString(t.preferred_language),
          "Origin Country (EN)": safeString(country?.country_name_en),
          "Origin Province (EN)": safeString(province?.province_name_en),
        };
      });

      return await respondWithAudit(rows, exportType, format, guard, filtersForAudit);
    }

    if (exportType === "visits") {
      const rows = payload.visits.map((v) => {
        const t = firstJoin(v.tourists as SupabaseJoin<DashboardExportRecord>);
        const country = firstJoin(t?.countries as SupabaseJoin<DashboardExportRecord>);
        const originProvince = firstJoin(t?.provinces as SupabaseJoin<DashboardExportRecord>);
        const attr = firstJoin(v.attractions as SupabaseJoin<DashboardExportRecord>);
        const destProvince = firstJoin(attr?.provinces as SupabaseJoin<DashboardExportRecord>);
        const companion = firstJoin(v.travel_companions as SupabaseJoin<DashboardExportRecord>);
        const transport = firstJoin(v.transport_modes as SupabaseJoin<DashboardExportRecord>);
        const purpose = firstJoin(v.travel_purposes as SupabaseJoin<DashboardExportRecord>);
        return {
          "Visit Date": safeString(v.visit_date),
          Attraction: safeString(attr?.name_en || attr?.name_th),
          "Destination Province": safeString(destProvince?.province_name_en),
          "Age Group": safeString(t?.age_group),
          "Origin Country": safeString(country?.country_name_en),
          "Origin Province": safeString(originProvince?.province_name_en),
          "Group Size": safeString(v.group_size),
          Overnight: safeString(v.overnight_status),
          Nights: safeString(v.nights),
          Companion: safeString(companion?.name_en),
          Transport: safeString(transport?.name_en),
          Purpose: safeString(purpose?.name_en),
        };
      });

      return await respondWithAudit(rows, exportType, format, guard, filtersForAudit);
    }

    const rows = payload.surveys.map((s) => {
      const v = firstJoin(s.visits as SupabaseJoin<DashboardExportRecord>);
      const attr = firstJoin(v?.attractions as SupabaseJoin<DashboardExportRecord>);
      const province = firstJoin(attr?.provinces as SupabaseJoin<DashboardExportRecord>);
      return {
        "Submitted At": safeString(s.submitted_at),
        "Completed At": safeString(s.completed_at),
        "Visit Date": safeString(v?.visit_date),
        Attraction: safeString(attr?.name_en || attr?.name_th),
        Province: safeString(province?.province_name_en),
        "Overall Score": safeString(s.overall_score),
        "Safety Score": safeString(s.safety_score),
        "Cleanliness Score": safeString(s.cleanliness_score),
        "Accessibility Score": safeString(s.accessibility_score),
        "Information Score": safeString(s.information_score),
        "Value Score": safeString(s.value_score),
        "Facility Score (Legacy)": safeString(s.facility_score),
        "Revisit Intention": safeString(s.revisit_intention),
        "Recommend Intention": safeString(s.recommend_intention),
      };
    });

    return await respondWithAudit(rows, exportType, format, guard, filtersForAudit);
  } catch (error) {
    if (guard && exportType) {
      await logAuditAction({
        actor: guard.actor,
        action: `export.dashboard.${exportType}.${format}`,
        entityType: "dashboard_export",
        result: "failed",
        metadata: {
          exportType,
          format,
          filters: filtersForAudit,
        },
      });
    }

    console.error("Dashboard export error:", error);
    const message = error instanceof DashboardServiceError ? error.message : "Failed to export data";
    return new NextResponse(message, { status: 500 });
  }
}
