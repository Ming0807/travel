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

    const rows = (data || []).map((row: any) => {
      const attraction = Array.isArray(row.attractions) ? row.attractions[0] : row.attractions;
      const photoSpot = Array.isArray(row.photo_spots) ? row.photo_spots[0] : row.photo_spots;
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

    const csvData = rows.length === 0 ? generateCsv([{ Message: "No data available" }]) : generateCsv(rows);

    await logAuditAction({
      actor: guard.actor,
      action: `export.checkin_codes.${format}`,
      entityType: "checkin_code_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `checkin_codes_export_${date}`;

    return await createExportResponse(rows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Check-in Codes Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
