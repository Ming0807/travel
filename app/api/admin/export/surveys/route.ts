import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { exportAdminSurveys, toSafeSurveyExportRows } from "@/lib/repositories/admin-survey.repository";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { adminSurveyFiltersSchema } from "@/lib/validation/admin-survey";
import { generateCsv } from "@/lib/utils/csv";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.survey_data");

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

    const csvData = generateCsv(toSafeSurveyExportRows(data));
    await logAuditAction({
      actor: guard.actor,
      action: "export.surveys.csv",
      entityType: "survey_export",
      result: "success",
      metadata: { rowCount: data.length, maxRows }
    });

    // Format filename with current date
    const date = new Date().toISOString().split("T")[0];
    const filename = `survey_responses_export_${date}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Surveys Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
