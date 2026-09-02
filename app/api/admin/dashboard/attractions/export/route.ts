import { NextResponse } from "next/server";

import { AdminAuthError, requirePermission, type GuardResult } from "@/lib/auth/guards";
import { getAttractionAnalytics } from "@/lib/services/attraction-analytics.service";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { createExportResponse, parseExportFormat } from "@/lib/utils/export-response";
import { attractionAnalyticsFiltersSchema } from "@/lib/validation/attraction-analytics";

export async function GET(request: Request) {
  let guard: GuardResult | null = null;
  const url = new URL(request.url);
  const format = parseExportFormat(url.searchParams.get("format"));
  try {
    await requirePermission("dashboard.read");
    guard = await requirePermission("export.summary");
  } catch (error) {
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
  if (!parsed.success) return new NextResponse("Invalid filters", { status: 400 });
  try {
    const data = await getAttractionAnalytics(parsed.data);
    if (!data) return new NextResponse("Attraction not found", { status: 404 });
    if (data.quality.truncated) return new NextResponse("Date scope is too large for a complete export", { status: 409 });
    const metadata = JSON.stringify({
      attractionId: parsed.data.attractionId,
      dateFrom: parsed.data.dateFrom,
      dateTo: parsed.data.dateTo,
      evidenceScope: parsed.data.evidenceScope,
      campaignId: parsed.data.campaignId ?? null,
      checkinCodeId: parsed.data.checkinCodeId ?? null,
      entryChannel: parsed.data.entryChannel ?? null,
      generatedAt: data.generatedAt,
      smallCellThreshold: data.quality.smallCellThreshold,
    });
    const rows: Array<Record<string, unknown>> = [
      { Section: "Metadata", Metric: "scope", Value: metadata, Denominator: "", Note: data.quality.scopeNote },
      { Section: "KPI", Metric: "unique_tourists", Value: data.kpis.uniqueTourists, Denominator: "", Note: "System profiles, not verified real-world persons" },
      { Section: "KPI", Metric: "visits", Value: data.kpis.visits, Denominator: "", Note: "Visit records" },
      { Section: "KPI", Metric: "repeat_visits", Value: data.kpis.repeatVisits, Denominator: data.kpis.visits, Note: "Visits beyond unique tourist profiles in selected scope" },
      { Section: "KPI", Metric: "certificate_visits", Value: data.kpis.certificateVisits, Denominator: data.kpis.visits, Note: "Visits with at least one certificate" },
      { Section: "KPI", Metric: "survey_rate", Value: data.kpis.surveyRate ?? "", Denominator: data.kpis.visits, Note: "Percent" },
      ...data.satisfaction.map((metric) => ({ Section: "Satisfaction", Metric: metric.key, Value: metric.suppressed ? "SUPPRESSED" : metric.value ?? "", Denominator: metric.sampleSize, Note: metric.suppressed ? `n < ${data.quality.smallCellThreshold}` : "Scale 1-5" })),
      ...data.funnel.map((stage) => ({ Section: "Funnel", Metric: stage.key, Value: stage.available ? stage.count : "UNAVAILABLE", Denominator: stage.conversionFromPrevious === null ? "" : "previous stage", Note: stage.note ?? `conversion ${stage.conversionFromPrevious}%` })),
      ...data.expenses.ranges.map((row) => ({ Section: "Self-reported expense range", Metric: row.label, Value: row.suppressed ? "SUPPRESSED" : row.count ?? "", Denominator: row.denominator, Note: data.expenses.note })),
      ...data.expenses.categories.map((row) => ({ Section: "Self-reported expense category", Metric: row.label, Value: row.suppressed ? "SUPPRESSED" : row.count ?? "", Denominator: row.denominator, Note: "Not business revenue" })),
    ];
    await logAuditAction({
      actor: guard.actor,
      action: `export.dashboard.attraction_analytics.${format}`,
      entityType: "dashboard_export",
      entityId: String(parsed.data.attractionId),
      metadata: { filters: parsed.data, rowCount: rows.length, aggregated: true, smallCellThreshold: data.quality.smallCellThreshold },
    });
    return createExportResponse(rows, `attraction_analytics_${parsed.data.attractionId}_${parsed.data.dateFrom}_${parsed.data.dateTo}`, format);
  } catch {
    await logAuditAction({ actor: guard.actor, action: `export.dashboard.attraction_analytics.${format}`, entityType: "dashboard_export", entityId: String(parsed.data.attractionId), result: "failed", metadata: { filters: parsed.data } });
    return new NextResponse("Failed to export attraction analytics", { status: 500 });
  }
}
