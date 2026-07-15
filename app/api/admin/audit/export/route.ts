import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { getAuditLogsPaginated } from "@/lib/repositories/admin-audit.repository";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { adminAuditQuerySchema, auditExportFilters, toAuditExportRows } from "@/lib/validation/admin-audit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));
    const guard = await requirePermission("audit.export");
    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    delete rawParams.format;

    const parsed = adminAuditQuerySchema.safeParse(rawParams);
    if (!parsed.success) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.audit.invalid_filters",
        entityType: "audit_export",
        result: "failed",
        metadata: { reason: "invalid_filters", privacyLevel: "internal" },
      });
      return NextResponse.json({ error: "Invalid export filters." }, { status: 400 });
    }

    const filters = auditExportFilters(parsed.data);
    const { data: logs } = await getAuditLogsPaginated(1, maxRows + 1, filters);
    const safeLogs = logs ?? [];

    if (safeLogs.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.audit.too_large",
        entityType: "audit_export",
        result: "failed",
        metadata: { maxRows, filters, privacyLevel: "internal" },
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = toAuditExportRows(safeLogs);
    const exportRows = rows.length === 0 ? [{ Message: "No data available" }] : rows;

    const now = new Date();
    const baseFilename = `audit_logs_export_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;

    await logAuditAction({
      actor: guard.actor,
      action: `export.audit.${format}`,
      entityType: "audit_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows, format, filters, privacyLevel: "internal" },
    });

    return await createExportResponse(exportRows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export audit logs error:", error);
    return NextResponse.json({ error: "Failed to export audit logs" }, { status: 500 });
  }
}
