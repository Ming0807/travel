import { NextRequest, NextResponse } from "next/server";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { exportAdminUsers } from "@/lib/repositories/admin-user.repository";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { createExportResponse, parseExportFormat } from "@/lib/utils/export-response";
import { adminUserFiltersSchema, type AdminUserFilters } from "@/lib/validation/admin-user";

export const dynamic = "force-dynamic";

function auditFilterSummary(filters: Omit<AdminUserFilters, "page" | "pageSize">) {
  return {
    hasSearch: Boolean(filters.search),
    status: filters.status,
    roleId: filters.roleId,
    sort: filters.sort,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission("user.read");
    await requirePermission("user.manage");
    await requirePermission("export.users");
    const guard = await requirePermission("export.personal_data");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));
    const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    delete rawParams.format;
    const parsed = adminUserFiltersSchema.safeParse(rawParams);

    if (!parsed.success) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.admin_users.invalid_filters",
        entityType: "user_export",
        result: "failed",
        metadata: { reason: "invalid_filters", privacyLevel: "restricted" },
      });
      return NextResponse.json({ error: "Invalid export filters." }, { status: 400 });
    }

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;
    const { page: _page, pageSize: _pageSize, ...filters } = parsed.data;
    void _page;
    void _pageSize;
    const filterSummary = auditFilterSummary(filters);
    const data = await exportAdminUsers(filters, maxRows + 1);

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.admin_users.too_large",
        entityType: "user_export",
        result: "failed",
        metadata: {
          maxRows,
          format,
          privacyLevel: "restricted",
          filters: filterSummary,
        },
      });
      return NextResponse.json(
        { error: "Export is too large. Please apply more filters." },
        { status: 413 }
      );
    }

    const rows = data.map((row, index) => ({
      "รหัสอ้างอิง": `A-${String(index + 1).padStart(6, "0")}`,
      "อีเมล": row.email || "",
      "ชื่อที่แสดง": row.display_name || "",
      "บทบาท": row.roles.join(", "),
      "สถานะ": row.is_active ? "ใช้งานอยู่" : "ปิดใช้งาน",
      "เข้าสู่ระบบล่าสุด": row.last_login_at || "",
      "สร้างเมื่อ": row.created_at || "",
    }));

    await logAuditAction({
      actor: guard.actor,
      action: `export.admin_users.${format}`,
      entityType: "user_export",
      result: "success",
      metadata: {
        rowCount: rows.length,
        maxRows,
        format,
        privacyLevel: "restricted",
        filters: filterSummary,
      },
    });

    const date = new Date().toISOString().split("T")[0];
    return await createExportResponse(rows, `users_export_${date}`, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "UNAUTHORIZED" ? 401 : 403 }
      );
    }
    console.error("Export Users Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
