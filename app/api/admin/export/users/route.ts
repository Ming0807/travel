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
    const guard = await requirePermission("export.users");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from("admin_users")
      .select(`
        admin_id,
        email,
        display_name,
        is_active,
        last_login_at,
        created_at,
        admin_user_roles (
          roles (role_name)
        )
      `)
      .order("created_at", { ascending: false })
      .limit(maxRows + 1);

    if (error) {
      throw new Error("EXPORT_USERS_FAILED");
    }

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.users.too_large",
        entityType: "user_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = ((data || []) as ExportRecord[]).map((row) => {
      const adminUserRoles = (row.admin_user_roles ?? []) as ExportRecord[];
      const roles = adminUserRoles
        .map((ur) => {
          const role = firstJoin(ur.roles as SupabaseJoin<ExportRecord>);
          return role?.role_name || "";
        })
        .filter(Boolean)
        .join(", ");

      return {
        "ID": String(row.admin_id),
        "Email": row.email || "",
        "Display Name": row.display_name || "",
        "Roles": roles,
        "Is Active": row.is_active ? "Yes" : "No",
        "Last Login At": row.last_login_at || "",
        "Created At": row.created_at || "",
      };
    });

    await logAuditAction({
      actor: guard.actor,
      action: `export.users.${format}`,
      entityType: "user_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `users_export_${date}`;

    return await createExportResponse(rows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Users Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
