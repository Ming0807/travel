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
  parseRequestedExportFormat,
  type ExportFormat,
} from "@/lib/utils/export-response";
import { firstJoin, type SupabaseJoin } from "@/lib/utils/supabase-joins";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { DASHBOARD_EXPORT_MIN_SAMPLE, dashboardExportBlockReason } from "@/lib/dashboard/dashboard-quality";
import {
  attachDashboardExportMetadata,
  buildDashboardExportMetadata,
} from "@/lib/dashboard/dashboard-export-metadata";
import {
  dashboardFiltersToSafeQuery,
  sanitizeDashboardQuery,
} from "@/lib/dashboard/dashboard-saved-views";
import { buildDashboardSummaryExportRows } from "@/lib/dashboard/dashboard-summary-export";

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

const EXPORT_TITLES: Record<DashboardExportType, string> = {
  summary: "รายงานสรุปภาพรวมการท่องเที่ยว",
  expenses: "สัญญาณค่าใช้จ่ายที่รายงานด้วยตนเอง",
  tourists: "โปรไฟล์นักท่องเที่ยวแบบไม่ระบุตัวบุคคล",
  visits: "รายการเข้าชมแบบไม่ระบุตัวบุคคล",
  surveys: "ผลแบบสำรวจแบบไม่ระบุตัวบุคคล",
};

const RAW_EXPORT_EXCLUSIONS: Record<Exclude<DashboardExportType, "summary" | "expenses">, string[]> = {
  tourists: ["ชื่อ อีเมล เบอร์โทร รหัสตัวตน และโทเคน", "โปรไฟล์ที่ไม่มี Visit ในช่วงที่เลือก"],
  visits: ["ชื่อ อีเมล เบอร์โทร รหัสตัวตน และโทเคน", "QR scan ที่ยังไม่สร้าง Visit"],
  surveys: ["ข้อมูลระบุตัวบุคคลและโทเคน", "ความคิดเห็นอิสระที่อาจมีข้อมูลส่วนบุคคล", "คำตอบว่างจากตัวหารรายมิติ"],
};

async function respondWithAudit(
  rows: Array<Record<string, unknown>>,
  type: DashboardExportType,
  format: ExportFormat,
  guard: GuardResult,
  filters: Record<string, string>,
) {
  const exportRows = rows.length === 0 ? [{ Message: "No data available" }] : rows;
  const response = await createExportResponse(exportRows, dashboardFilename(type), format);

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

  return response;
}

async function respondBlockedExport(
  reason: string,
  type: DashboardExportType,
  format: ExportFormat,
  guard: GuardResult,
  filters: Record<string, string>,
) {
  await logAuditAction({
    actor: guard.actor,
    action: `export.dashboard.${type}.${format}`,
    entityType: "dashboard_export",
    result: "failed",
    metadata: { exportType: type, format, filters, reason: "quality_gate", qualityReason: reason },
  });
  return new NextResponse(`ไม่สามารถส่งออกข้อมูลได้: ${reason}`, { status: 422 });
}

function rawExportBlockReason(isTruncated: boolean, sampleSize: number): string | null {
  if (isTruncated) return "ข้อมูลถูกตัดที่ขีดจำกัดการอ่าน กรุณาลดช่วงวันที่หรือเพิ่มตัวกรอง";
  if (sampleSize < DASHBOARD_EXPORT_MIN_SAMPLE) return `ฐานข้อมูลต่ำกว่า ${DASHBOARD_EXPORT_MIN_SAMPLE} รายการ`;
  return null;
}

export async function GET(request: Request) {
  let guard: GuardResult | null = null;
  let exportType: DashboardExportType | null = null;
  let format: ExportFormat = "csv";
  let filtersForAudit: Record<string, string> = {};
  let parsedFilters: DashboardFilters | null = null;

  try {
    const { searchParams } = new URL(request.url);
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (!(key in params)) params[key] = value;
    });
    filtersForAudit = sanitizeDashboardQuery(searchParams);

    const requestedFormat = parseRequestedExportFormat(searchParams.get("format"));
    format = requestedFormat ?? "csv";
    exportType = parseExportType(params.type);

    try {
      guard = await requirePermission("dashboard.read", { unauthenticated: "throw" });
    } catch (error) {
      const err = mapAdminError(error as AdminAuthError);
      return new NextResponse(err.message, { status: err.code === "UNAUTHORIZED" ? 401 : 403 });
    }

    if (!requestedFormat) {
      await logAuditAction({ actor: guard.actor, action: "export.dashboard.invalid", entityType: "dashboard_export", result: "failed", metadata: { reason: "invalid_format" } });
      return new NextResponse("Unsupported export format", { status: 400 });
    }
    if (!exportType) {
      await logAuditAction({ actor: guard.actor, action: "export.dashboard.invalid", entityType: "dashboard_export", result: "failed", metadata: { reason: "invalid_export_type" } });
      return new NextResponse("Unknown export type", { status: 400 });
    }

    try {
      guard = await requirePermission(permissionForExportType(exportType), { unauthenticated: "throw" });
    } catch (error) {
      const err = mapAdminError(error as AdminAuthError);
      await logAuditAction({
        actor: guard.actor,
        action: `export.dashboard.${exportType}.${format}`,
        entityType: "dashboard_export",
        result: "failed",
        metadata: { exportType, reason: "permission_denied" },
      });
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
          reason: "invalid_filters",
        },
      });
      return new NextResponse("Invalid filters", { status: 400 });
    }
    parsedFilters = parsed.data as DashboardFilters;
    filtersForAudit = dashboardFiltersToSafeQuery(parsedFilters);
    if (!filtersForAudit.date_from || !filtersForAudit.date_to || (parsedFilters.ageGroup && !filtersForAudit.age_group)) {
      await logAuditAction({ actor: guard.actor, action: `export.dashboard.${exportType}.${format}`, entityType: "dashboard_export", result: "failed", metadata: { exportType, format, reason: "invalid_filters" } });
      return new NextResponse("Invalid filters", { status: 400 });
    }

    if (exportType === "expenses") {
      const data = await getDashboardAnalytics(filtersForAudit, "expenses");
      const qualityReason = dashboardExportBlockReason(data.quality);
      if (qualityReason) return await respondBlockedExport(qualityReason, exportType, format, guard, filtersForAudit);
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

      const exportRows = attachDashboardExportMetadata(rows, buildDashboardExportMetadata({
        title: EXPORT_TITLES.expenses,
        generatedAt: data.generatedAt,
        filters: parsedFilters,
        quality: data.quality,
      }));
      return await respondWithAudit(exportRows, exportType, format, guard, filtersForAudit);
    }

    if (exportType === "summary") {
      const data = await getDashboardAnalytics(filtersForAudit, "executive");
      const qualityReason = dashboardExportBlockReason(data.quality);
      if (qualityReason) return await respondBlockedExport(qualityReason, exportType, format, guard, filtersForAudit);
      const rows = buildDashboardSummaryExportRows(data);

      const exportRows = attachDashboardExportMetadata(rows, buildDashboardExportMetadata({
        title: EXPORT_TITLES.summary,
        generatedAt: data.generatedAt,
        filters: parsedFilters,
        quality: data.quality,
      }));
      return await respondWithAudit(exportRows, exportType, format, guard, filtersForAudit);
    }

    const payload = await getDashboardRepositoryPayload(parsedFilters, exportType);

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

      const qualityReason = rawExportBlockReason(payload.isTruncated, rows.length);
      if (qualityReason) return await respondBlockedExport(qualityReason, exportType, format, guard, filtersForAudit);

      const exportRows = attachDashboardExportMetadata(rows, buildDashboardExportMetadata({
        title: EXPORT_TITLES.tourists,
        generatedAt: new Date().toISOString(),
        filters: parsedFilters,
        denominator: rows.length,
        exclusions: RAW_EXPORT_EXCLUSIONS.tourists,
      }));
      return await respondWithAudit(exportRows, exportType, format, guard, filtersForAudit);
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

      const qualityReason = rawExportBlockReason(payload.isTruncated, rows.length);
      if (qualityReason) return await respondBlockedExport(qualityReason, exportType, format, guard, filtersForAudit);

      const exportRows = attachDashboardExportMetadata(rows, buildDashboardExportMetadata({
        title: EXPORT_TITLES.visits,
        generatedAt: new Date().toISOString(),
        filters: parsedFilters,
        denominator: rows.length,
        exclusions: RAW_EXPORT_EXCLUSIONS.visits,
      }));
      return await respondWithAudit(exportRows, exportType, format, guard, filtersForAudit);
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
        "Facility Score": safeString(s.facility_score),
        "Revisit Intention": safeString(s.revisit_intention),
        "Recommend Intention": safeString(s.recommend_intention),
      };
    });

    const qualityReason = rawExportBlockReason(payload.isTruncated, rows.length);
    if (qualityReason) return await respondBlockedExport(qualityReason, exportType, format, guard, filtersForAudit);

    const exportRows = attachDashboardExportMetadata(rows, buildDashboardExportMetadata({
      title: EXPORT_TITLES.surveys,
      generatedAt: new Date().toISOString(),
      filters: parsedFilters,
      denominator: rows.length,
      exclusions: RAW_EXPORT_EXCLUSIONS.surveys,
    }));
    return await respondWithAudit(exportRows, exportType, format, guard, filtersForAudit);
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
