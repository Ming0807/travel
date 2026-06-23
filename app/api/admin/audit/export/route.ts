import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getAuditLogsPaginated } from "@/lib/repositories/admin-audit.repository";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";
import { logAuditAction } from "@/lib/services/audit-log.service";

export async function GET(request: NextRequest) {
  try {
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    // Requires the specific export permission
    const guard = await requirePermission("audit.export");

    const searchParams = request.nextUrl.searchParams;
    const filters = {
      adminId: searchParams.get("adminId") || undefined,
      action: searchParams.get("action") || undefined,
      entityType: searchParams.get("entityType") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      search: searchParams.get("search") || undefined,
    };

    // Fetch up to 10000 records for export to prevent overwhelming server
    const { data: logs } = await getAuditLogsPaginated(1, 10000, filters);

    if (!logs || logs.length === 0) {
      await logAuditAction({
        actor: guard.actor,
        action: `export.audit.${format}`,
        entityType: "audit_export",
        result: "success",
        metadata: { rowCount: 0, filters },
      });
      return await createExportResponse([{ Message: "No data available" }], "audit_logs_export_empty", format);
    }

    // Map logs to flat CSV rows
    const rows = logs.map((log) => ({
      "Timestamp": formatDate(log.created_at),
      "Actor": log.admin_users?.display_name || "System",
      "Action": log.action,
      "Entity Type": log.entity_type,
      "Entity ID": log.entity_id || "",
      "Old Data Fields": fieldList(log.old_data),
      "New Data Fields": fieldList(log.new_data),
    }));

    const now = new Date();
    const baseFilename = `audit_logs_export_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;

    await logAuditAction({
      actor: guard.actor,
      action: `export.audit.${format}`,
      entityType: "audit_export",
      result: "success",
      metadata: { rowCount: rows.length, filters },
    });

    return await createExportResponse(rows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export audit logs error:", error);
    return NextResponse.json({ error: "Failed to export audit logs" }, { status: 500 });
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
  } catch {
    return dateStr;
  }
}

function fieldList(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  return Object.keys(value).sort().join(", ");
}
