import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import {
  exportAdminTourists,
  toSafeTouristExportRows,
} from "@/lib/repositories/admin-tourist.repository";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { adminTouristFiltersSchema } from "@/lib/validation/admin-tourist";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.tourist_summary");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));
    const parsed = adminTouristFiltersSchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    if (!parsed.success) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.tourist_summary.invalid_filters",
        entityType: "tourist_export",
        result: "failed",
        metadata: { reason: "invalid_filters" },
      });
      return NextResponse.json({ error: "Invalid export filters." }, { status: 400 });
    }

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;
    const { page: _page, pageSize: _pageSize, ...filters } = parsed.data;
    void _page;
    void _pageSize;
    const data = await exportAdminTourists(filters, maxRows + 1);

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.tourist_summary.too_large",
        entityType: "tourist_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = toSafeTouristExportRows(data);

    await logAuditAction({
      actor: guard.actor,
      action: `export.tourist_summary.${format}`,
      entityType: "tourist_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows, format }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `tourists_export_${date}`;

    return await createExportResponse(rows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Tourists Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
