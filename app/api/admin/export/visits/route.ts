import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { exportAdminVisits, toSafeVisitExportRows } from "@/lib/repositories/admin-visit.repository";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { adminVisitFiltersSchema } from "@/lib/validation/admin-visit";
import { generateCsv } from "@/lib/utils/csv";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.visit_records");

    const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = adminVisitFiltersSchema.safeParse(rawParams);
    if (!parsed.success) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.visits.invalid_filters",
        entityType: "visit_export",
        result: "failed",
        metadata: { reason: "invalid_filters" }
      });
      return NextResponse.json({ error: "Invalid export filters." }, { status: 400 });
    }

    const { page: _page, pageSize: _pageSize, ...filters } = parsed.data;
    void _page;
    void _pageSize;
    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const data = await exportAdminVisits(filters, maxRows + 1);
    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.visits.too_large",
        entityType: "visit_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const csvData = generateCsv(toSafeVisitExportRows(data));
    await logAuditAction({
      actor: guard.actor,
      action: "export.visits.csv",
      entityType: "visit_export",
      result: "success",
      metadata: { rowCount: data.length, maxRows }
    });

    // Format filename with current date
    const date = new Date().toISOString().split("T")[0];
    const filename = `visit_records_export_${date}.csv`;

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
    console.error("Export Visits Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
