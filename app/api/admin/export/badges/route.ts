import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.badges");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from("badge_definitions")
      .select("*")
      .order("display_order", { ascending: true })
      .limit(maxRows + 1);

    if (error) {
      throw new Error("EXPORT_BADGES_FAILED");
    }

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.badges.too_large",
        entityType: "badge_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = ((data || []) as Array<Record<string, unknown>>).map((row) => ({
      "ID": String(row.badge_id),
      "Badge Key": row.badge_key || "",
      "Name (TH)": row.name_th || "",
      "Name (EN)": row.name_en || "",
      "Description (TH)": row.description_th || "",
      "Description (EN)": row.description_en || "",
      "Category": row.category || "",
      "Requirement Type": row.requirement_type || "",
      "Requirement Value": row.requirement_value !== null ? String(row.requirement_value) : "",
      "Icon Name": row.icon_name || "",
      "Icon Color": row.icon_color || "",
      "Display Order": String(row.display_order ?? 0),
      "Is Active": row.is_active ? "Yes" : "No",
      "Created At": row.created_at || "",
      "Updated At": row.updated_at || "",
    }));

    const exportRows = rows.length === 0 ? [{ Message: "No data available" }] : rows;

    await logAuditAction({
      actor: guard.actor,
      action: `export.badges.${format}`,
      entityType: "badge_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `badges_export_${date}`;

    return await createExportResponse(exportRows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Badges Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
