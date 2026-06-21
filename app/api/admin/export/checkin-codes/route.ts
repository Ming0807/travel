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
    const guard = await requirePermission("export.checkin_codes");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from("checkin_codes")
      .select("*, attractions (name_th, name_en), photo_spots (spot_name_th)")
      .order("created_at", { ascending: false })
      .limit(maxRows + 1);

    if (error) {
      throw new Error("EXPORT_CHECKIN_CODES_FAILED");
    }

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.checkin_codes.too_large",
        entityType: "checkin_code_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = ((data || []) as ExportRecord[]).map((row) => {
      const attraction = firstJoin(row.attractions as SupabaseJoin<ExportRecord>);
      const photoSpot = firstJoin(row.photo_spots as SupabaseJoin<ExportRecord>);
      return {
        "ID": String(row.checkin_code_id),
        "Code": row.code || "",
        "Label": row.label || "",
        "Attraction": attraction?.name_th || "",
        "Photo Spot": photoSpot?.spot_name_th || "",
        "Is Active": row.is_active ? "Yes" : "No",
        "Starts At": row.starts_at || "",
        "Ends At": row.ends_at || "",
        "Created At": row.created_at || "",
        "Updated At": row.updated_at || "",
      };
    });

    const exportRows = rows.length === 0 ? [{ Message: "No data available" }] : rows;

    await logAuditAction({
      actor: guard.actor,
      action: `export.checkin_codes.${format}`,
      entityType: "checkin_code_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `checkin_codes_export_${date}`;

    return await createExportResponse(exportRows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Check-in Codes Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
