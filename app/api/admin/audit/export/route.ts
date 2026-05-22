import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth/guards";
import { getAuditLogsPaginated } from "@/lib/repositories/admin-audit.repository";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    // Requires the specific export permission
    await requirePermission("audit.export");

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

    // Build CSV
    const headers = ["Timestamp", "Admin Name", "Admin Email", "Action", "Entity Type", "Entity ID", "Details"];
    
    // Simple CSV escaping
    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    let csvContent = headers.map(escapeCsv).join(",") + "\n";

    for (const log of logs) {
      const row = [
        format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss"),
        log.admin_users?.display_name || "System",
        log.admin_users?.email || "system@local",
        log.action,
        log.entity_type,
        log.entity_id || "",
        log.details_json ? JSON.stringify(log.details_json) : ""
      ];
      csvContent += row.map(escapeCsv).join(",") + "\n";
    }

    const filename = `audit_logs_export_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`;

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Export audit logs error:", error);
    return new Response(JSON.stringify({ error: "Failed to export audit logs" }), {
      status: error.message.includes("FORBIDDEN") ? 403 : 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
