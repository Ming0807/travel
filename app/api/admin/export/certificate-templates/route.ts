import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.certificate_templates");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from("certificate_templates")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(maxRows + 1);

    if (error) {
      throw new Error("EXPORT_CERTIFICATE_TEMPLATES_FAILED");
    }

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.certificate_templates.too_large",
        entityType: "certificate_template_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = ((data || []) as Array<Record<string, unknown>>).map((row) => ({
      "ID": String(row.template_id),
      "Name": row.name || "",
      "Language": row.language || "",
      "Attraction ID": row.attraction_id !== null ? String(row.attraction_id) : "",
      "Is Active": row.is_active ? "Yes" : "No",
      "Is Default": row.is_default ? "Yes" : "No",
      "Created At": row.created_at || "",
      "Updated At": row.updated_at || "",
    }));

    await logAuditAction({
      actor: guard.actor,
      action: `export.certificate_templates.${format}`,
      entityType: "certificate_template_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `certificate_templates_export_${date}`;

    return await createExportResponse(rows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Certificate Templates Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
