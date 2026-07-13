import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { exportAdminCheckinCodes } from "@/lib/repositories/admin-checkin-code.repository";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { adminCheckinCodeFiltersSchema } from "@/lib/validation/checkin-code";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.checkin_codes");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));
    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = adminCheckinCodeFiltersSchema.safeParse(rawParams);
    if (!parsed.success) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.checkin_codes.invalid_filters",
        entityType: "checkin_code_export",
        result: "failed",
        metadata: { reason: "invalid_filters" }
      });
      return NextResponse.json({ error: "Invalid export filters." }, { status: 400 });
    }

    const { page: _page, pageSize: _pageSize, ...filters } = parsed.data;
    void _page;
    void _pageSize;
    const data = await exportAdminCheckinCodes(filters, maxRows + 1);

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.checkin_codes.too_large",
        entityType: "checkin_code_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = data.map((row) => ({
      "ID": String(row.checkin_code_id),
      "Code": row.code,
      "Label": row.label || "",
      "Attraction": row.attraction_name_th || "",
      "Photo Spot": row.photo_spot_name_th || "",
      "Is Active": row.is_active ? "Yes" : "No",
      "Starts At": row.starts_at || "",
      "Ends At": row.ends_at || "",
      "Created At": row.created_at,
      "Updated At": row.updated_at || "",
    }));

    const exportRows = rows.length === 0 ? [{ Message: "No data available" }] : rows;

    await logAuditAction({
      actor: guard.actor,
      action: `export.checkin_codes.${format}`,
      entityType: "checkin_code_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows, filters }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `checkin_codes_export_${date}`;

    return await createExportResponse(exportRows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Check-in Codes Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
