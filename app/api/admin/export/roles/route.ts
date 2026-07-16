import { NextRequest, NextResponse } from "next/server";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { exportAdminRoles } from "@/lib/repositories/role.repository";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { createExportResponse, parseExportFormat } from "@/lib/utils/export-response";
import { adminRoleFiltersSchema, roleExportFilters } from "@/lib/validation/admin-role";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requirePermission("role.read");
    const guard = await requirePermission("export.roles");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));
    const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    delete rawParams.format;
    const parsed = adminRoleFiltersSchema.safeParse(rawParams);

    if (!parsed.success) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.roles.invalid_filters",
        entityType: "role_export",
        result: "failed",
        metadata: { reason: "invalid_filters", privacyLevel: "internal" },
      });
      return NextResponse.json({ error: "Invalid export filters." }, { status: 400 });
    }

    const filters = roleExportFilters(parsed.data);
    const filterSummary = {
      hasSearch: Boolean(filters.search),
      status: filters.status ?? null,
      sort: filters.sort,
    };
    const maxRows = getServerEnv().EXPORT_MAX_ROWS;
    const data = await exportAdminRoles(filters, maxRows + 1);

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.roles.too_large",
        entityType: "role_export",
        result: "failed",
        metadata: { maxRows, filters: filterSummary, privacyLevel: "internal" },
      });
      return NextResponse.json(
        { error: "Export is too large. Please apply more filters." },
        { status: 413 }
      );
    }

    const rows = data.map((role) => ({
      "รหัสบทบาท": String(role.role_id),
      "ชื่อบทบาท": role.role_name,
      "คำอธิบาย": role.description,
      "สิทธิ์": role.permissions.join(", "),
      "สถานะ": role.is_active ? "ใช้งานอยู่" : "ปิดใช้งาน",
      "สร้างเมื่อ": role.created_at,
    }));

    await logAuditAction({
      actor: guard.actor,
      action: `export.roles.${format}`,
      entityType: "role_export",
      result: "success",
      metadata: {
        rowCount: rows.length,
        maxRows,
        filters: filterSummary,
        privacyLevel: "internal",
      },
    });

    const date = new Date().toISOString().split("T")[0];
    return await createExportResponse(rows, `roles_export_${date}`, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "UNAUTHORIZED" ? 401 : 403 }
      );
    }
    console.error("Export Roles Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
