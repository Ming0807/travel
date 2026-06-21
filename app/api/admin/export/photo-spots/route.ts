import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.photo_spots");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from("photo_spots")
      .select("*, attractions (name_th, name_en)")
      .order("attraction_id", { ascending: true })
      .order("display_order", { ascending: true, nullsFirst: false })
      .limit(maxRows + 1);

    if (error) {
      throw new Error("EXPORT_PHOTO_SPOTS_FAILED");
    }

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.photo_spots.too_large",
        entityType: "photo_spot_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = (data || []).map((row: any) => {
      const attraction = Array.isArray(row.attractions) ? row.attractions[0] : row.attractions;
      return {
        "ID": String(row.photo_spot_id),
        "Name (TH)": row.spot_name_th || "",
        "Name (EN)": row.spot_name_en || "",
        "Description (TH)": row.description_th || "",
        "Description (EN)": row.description_en || "",
        "Attraction": attraction?.name_th || "",
        "Latitude": row.latitude !== null ? String(row.latitude) : "",
        "Longitude": row.longitude !== null ? String(row.longitude) : "",
        "Display Order": row.display_order !== null ? String(row.display_order) : "",
        "Is Active": row.is_active ? "Yes" : "No",
        "Created At": row.created_at || "",
        "Updated At": row.updated_at || "",
      };
    });

    const exportRows = rows.length === 0 ? [{ Message: "No data available" }] : rows;

    await logAuditAction({
      actor: guard.actor,
      action: `export.photo_spots.${format}`,
      entityType: "photo_spot_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `photo_spots_export_${date}`;

    return await createExportResponse(exportRows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Photo Spots Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
