import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { exportAdminSurveys, toSafeSurveyExportRows } from "@/lib/repositories/admin-survey.repository";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { adminSurveyFiltersSchema } from "@/lib/validation/admin-survey";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.survey_data");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = adminSurveyFiltersSchema.safeParse(rawParams);
    if (!parsed.success) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.surveys.invalid_filters",
        entityType: "survey_export",
        result: "failed",
        metadata: { reason: "invalid_filters" }
      });
      return NextResponse.json({ error: "Invalid export filters." }, { status: 400 });
    }

    const { page: _page, pageSize: _pageSize, ...filters } = parsed.data;
    void _page;
    void _pageSize;
    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const data = await exportAdminSurveys(filters, maxRows + 1);
    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.surveys.too_large",
        entityType: "survey_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = toSafeSurveyExportRows(data);
    await logAuditAction({
      actor: guard.actor,
      action: `export.surveys.${format}`,
      entityType: "survey_export",
      result: "success",
      metadata: { rowCount: data.length, maxRows, format }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `survey_responses_export_${date}`;

    return await createExportResponse(rows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Surveys Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
