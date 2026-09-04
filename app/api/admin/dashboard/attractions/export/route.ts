import { NextResponse } from "next/server";

import { AdminAuthError, requirePermission, type GuardResult } from "@/lib/auth/guards";
import { getAttractionAnalytics } from "@/lib/services/attraction-analytics.service";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { DASHBOARD_METRIC_VERSION } from "@/lib/dashboard/dashboard-quality";
import { createExportResponse, parseRequestedExportFormat, type ExportFormat } from "@/lib/utils/export-response";
import { attractionAnalyticsFiltersSchema } from "@/lib/validation/attraction-analytics";

export async function GET(request: Request) {
  let guard: GuardResult | null = null;
  const url = new URL(request.url);
  const format: ExportFormat | null = parseRequestedExportFormat(url.searchParams.get("format"));
  try {
    guard = await requirePermission("dashboard.read", { unauthenticated: "throw" });
  } catch (error) {
    const status = error instanceof AdminAuthError && error.code === "UNAUTHORIZED" ? 401 : 403;
    return new NextResponse(status === 401 ? "Authentication required" : "Export permission required", { status });
  }
  if (!format) {
    await logAuditAction({
      actor: guard.actor,
      action: "export.dashboard.attraction_analytics.invalid",
      entityType: "dashboard_export",
      result: "failed",
      metadata: { reason: "invalid_format" },
    });
    return new NextResponse("Unsupported export format", { status: 400 });
  }
  try {
    guard = await requirePermission("export.summary", { unauthenticated: "throw" });
  } catch (error) {
    await logAuditAction({
      actor: guard.actor,
      action: `export.dashboard.attraction_analytics.${format}`,
      entityType: "dashboard_export",
      result: "failed",
      metadata: { reason: "permission_denied" },
    });
    const status = error instanceof AdminAuthError && error.code === "UNAUTHORIZED" ? 401 : 403;
    return new NextResponse(status === 401 ? "Authentication required" : "Export permission required", { status });
  }
  const parsed = attractionAnalyticsFiltersSchema.safeParse({
    attractionId: url.searchParams.get("attractionId"),
    dateFrom: url.searchParams.get("dateFrom"),
    dateTo: url.searchParams.get("dateTo"),
    campaignId: url.searchParams.get("campaignId") || undefined,
    checkinCodeId: url.searchParams.get("checkinCodeId") || undefined,
    evidenceScope: url.searchParams.get("evidenceScope") || "field_claim",
    entryChannel: url.searchParams.get("entryChannel") || undefined,
  });
  if (!parsed.success) {
    await logAuditAction({
      actor: guard.actor,
      action: `export.dashboard.attraction_analytics.${format}`,
      entityType: "dashboard_export",
      result: "failed",
      metadata: { reason: "invalid_filters" },
    });
    return new NextResponse("Invalid filters", { status: 400 });
  }
  try {
    const data = await getAttractionAnalytics(parsed.data);
    if (!data) {
      await logAuditAction({ actor: guard.actor, action: `export.dashboard.attraction_analytics.${format}`, entityType: "dashboard_export", entityId: String(parsed.data.attractionId), result: "failed", metadata: { filters: parsed.data, reason: "not_found" } });
      return new NextResponse("Attraction not found", { status: 404 });
    }
    if (data.quality.truncated) {
      await logAuditAction({ actor: guard.actor, action: `export.dashboard.attraction_analytics.${format}`, entityType: "dashboard_export", entityId: String(parsed.data.attractionId), result: "failed", metadata: { filters: parsed.data, reason: "quality_gate", qualityReason: "truncated_read" } });
      return new NextResponse("Date scope is too large for a complete export", { status: 409 });
    }
    if (data.kpis.visits < data.quality.smallCellThreshold) {
      await logAuditAction({ actor: guard.actor, action: `export.dashboard.attraction_analytics.${format}`, entityType: "dashboard_export", entityId: String(parsed.data.attractionId), result: "failed", metadata: { filters: parsed.data, reason: "quality_gate", qualityReason: "insufficient_sample" } });
      return new NextResponse("ฐานข้อมูลยังไม่ถึงเกณฑ์ขั้นต่ำสำหรับส่งออกรายงานสถานที่", { status: 422 });
    }
    const suppressedCellCount = [
      ...data.satisfaction,
      ...data.expenses.ranges,
      ...data.expenses.categories,
    ].filter((row) => row.suppressed).length;
    const selectedScope = JSON.stringify({
      attractionId: parsed.data.attractionId,
      dateFrom: parsed.data.dateFrom,
      dateTo: parsed.data.dateTo,
      evidenceScope: parsed.data.evidenceScope,
      campaignId: parsed.data.campaignId ?? null,
      checkinCodeId: parsed.data.checkinCodeId ?? null,
      entryChannel: parsed.data.entryChannel ?? null,
    });
    const kpiValue = (value: number | null) => value ?? "";
    const kpiDenominator = data.kpis.visits;
    const rows: Array<Record<string, unknown>> = [
      { Section: "Metadata", Metric: "report_title", Value: "รายงานวิเคราะห์ระดับสถานที่", Denominator: "", Note: "Presentation-ready aggregate evidence" },
      { Section: "Metadata", Metric: "selected_scope", Value: selectedScope, Denominator: "", Note: data.quality.scopeNote },
      { Section: "Metadata", Metric: "generated_at", Value: data.generatedAt, Denominator: "", Note: "ISO 8601" },
      { Section: "Metadata", Metric: "report_denominator", Value: kpiDenominator, Denominator: "", Note: "Visit records in selected scope" },
      { Section: "Metadata", Metric: "exclusions", Value: "ข้อมูลระบุตัวบุคคล; คำตอบว่างจากตัวหารรายมิติ; QR scan ที่ยังไม่สร้าง Visit", Denominator: "", Note: "Missing values are not zero" },
      { Section: "Metadata", Metric: "suppression_note", Value: `${suppressedCellCount} suppressed cells`, Denominator: "", Note: `Small-cell threshold n=${data.quality.smallCellThreshold}` },
      { Section: "Metadata", Metric: "metric_version", Value: DASHBOARD_METRIC_VERSION, Denominator: "", Note: data.metricContract.map((metric) => `${metric.key}:${metric.source}`).join("; ") },
      { Section: "KPI", Metric: "unique_tourists", Value: kpiValue(data.kpis.uniqueTourists), Denominator: "", Note: "System profiles, not verified real-world persons" },
      { Section: "KPI", Metric: "visits", Value: kpiValue(data.kpis.visits), Denominator: "", Note: "Visit records" },
      { Section: "KPI", Metric: "repeat_visits", Value: kpiValue(data.kpis.repeatVisits), Denominator: kpiDenominator, Note: "Visits beyond unique tourist profiles in selected scope" },
      { Section: "KPI", Metric: "certificate_visits", Value: kpiValue(data.kpis.certificateVisits), Denominator: kpiDenominator, Note: "Visits with at least one certificate" },
      { Section: "KPI", Metric: "survey_rate", Value: kpiValue(data.kpis.surveyRate), Denominator: kpiDenominator, Note: "Percent" },
      ...data.satisfaction.map((metric) => ({ Section: "Satisfaction", Metric: metric.key, Value: metric.suppressed ? "SUPPRESSED" : metric.value ?? "", Denominator: metric.suppressed ? "SUPPRESSED" : metric.sampleSize, Note: metric.suppressed ? `n < ${data.quality.smallCellThreshold}` : "Scale 1-5" })),
      ...data.funnel.map((stage) => ({ Section: "Funnel", Metric: stage.key, Value: stage.available ? stage.count : "UNAVAILABLE", Denominator: stage.conversionFromPrevious === null ? "" : "previous stage", Note: stage.note ?? `conversion ${stage.conversionFromPrevious}%` })),
      ...data.expenses.ranges.map((row) => ({ Section: "Self-reported expense range", Metric: row.label, Value: row.suppressed ? "SUPPRESSED" : row.count ?? "", Denominator: row.denominator, Note: data.expenses.note })),
      ...data.expenses.categories.map((row) => ({ Section: "Self-reported expense category", Metric: row.label, Value: row.suppressed ? "SUPPRESSED" : row.count ?? "", Denominator: row.denominator, Note: "Not business revenue" })),
    ];
    const response = await createExportResponse(rows, `attraction_analytics_${parsed.data.attractionId}_${parsed.data.dateFrom}_${parsed.data.dateTo}`, format);
    await logAuditAction({
      actor: guard.actor,
      action: `export.dashboard.attraction_analytics.${format}`,
      entityType: "dashboard_export",
      entityId: String(parsed.data.attractionId),
      metadata: { filters: parsed.data, rowCount: rows.length, aggregated: true, smallCellThreshold: data.quality.smallCellThreshold },
      result: "success",
    });
    return response;
  } catch {
    await logAuditAction({ actor: guard.actor, action: `export.dashboard.attraction_analytics.${format}`, entityType: "dashboard_export", entityId: String(parsed.data.attractionId), result: "failed", metadata: { filters: parsed.data } });
    return new NextResponse("Failed to export attraction analytics", { status: 500 });
  }
}
