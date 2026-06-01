import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { generateCsv } from "@/lib/utils/csv";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.routes");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from("suggested_routes")
      .select("*")
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(maxRows + 1);

    if (error) {
      throw new Error("EXPORT_ROUTES_FAILED");
    }

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.routes.too_large",
        entityType: "route_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = (data || []).map((row: any) => ({
      "ID": String(row.route_id),
      "Name (TH)": row.name_th || "",
      "Name (EN)": row.name_en || "",
      "Slug": row.slug || "",
      "Description (TH)": row.description_th || "",
      "Description (EN)": row.description_en || "",
      "Is Published": row.is_published ? "Yes" : "No",
      "Is Active": row.is_active ? "Yes" : "No",
      "Created At": row.created_at || "",
      "Updated At": row.updated_at || "",
    }));

    const csvData = rows.length === 0 ? generateCsv([{ Message: "No data available" }]) : generateCsv(rows);

    await logAuditAction({
      actor: guard.actor,
      action: `export.routes.${format}`,
      entityType: "route_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `routes_export_${date}`;

    return await createExportResponse(rows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Routes Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
