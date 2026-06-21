import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";
import { firstJoin, type SupabaseJoin } from "@/lib/utils/supabase-joins";

export const dynamic = "force-dynamic";

type ExportRecord = Record<string, unknown>;

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.roles");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from("roles")
      .select(`
        *,
        role_permissions (
          permissions (permission_name)
        )
      `)
      .order("role_id", { ascending: true })
      .limit(maxRows + 1);

    if (error) {
      throw new Error("EXPORT_ROLES_FAILED");
    }

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.roles.too_large",
        entityType: "role_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = ((data || []) as ExportRecord[]).map((row) => {
      const rolePermissions = (row.role_permissions ?? []) as ExportRecord[];
      const permissions = rolePermissions
        .map((rp) => {
          const perm = firstJoin(rp.permissions as SupabaseJoin<ExportRecord>);
          return perm?.permission_name || "";
        })
        .filter(Boolean)
        .join(", ");

      return {
        "ID": String(row.role_id),
        "Role Name": row.role_name || "",
        "Description": row.description || "",
        "Permissions": permissions,
        "Is Active": row.is_active ? "Yes" : "No",
        "Created At": row.created_at || "",
      };
    });

    await logAuditAction({
      actor: guard.actor,
      action: `export.roles.${format}`,
      entityType: "role_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `roles_export_${date}`;

    return await createExportResponse(rows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Roles Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
