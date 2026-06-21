import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.attractions");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from("attractions")
      .select(`
        *,
        provinces (province_name_th, province_name_en),
        districts (district_name_th, district_name_en),
        attraction_types (type_name_th, type_name_en)
      `)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(maxRows + 1);

    if (error) {
      throw new Error("EXPORT_ATTRACTIONS_FAILED");
    }

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.attractions.too_large",
        entityType: "attraction_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = (data || []).map((row: any) => {
      const province = Array.isArray(row.provinces) ? row.provinces[0] : row.provinces;
      const district = Array.isArray(row.districts) ? row.districts[0] : row.districts;
      const type = Array.isArray(row.attraction_types) ? row.attraction_types[0] : row.attraction_types;

      return {
        "ID": String(row.attraction_id),
        "Name (TH)": row.name_th || "",
        "Name (EN)": row.name_en || "",
        "Slug": row.slug || "",
        "Province (TH)": province?.province_name_th || "",
        "Province (EN)": province?.province_name_en || "",
        "District (TH)": district?.district_name_th || "",
        "District (EN)": district?.district_name_en || "",
        "Type (TH)": type?.type_name_th || "",
        "Type (EN)": type?.type_name_en || "",
        "Is Published": row.is_published ? "Yes" : "No",
        "Is Active": row.is_active ? "Yes" : "No",
        "Sustainability": row.sustainability_category || "",
        "Created At": row.created_at || "",
        "Updated At": row.updated_at || "",
      };
    });

    const exportRows = rows.length === 0 ? [{ Message: "No data available" }] : rows;

    await logAuditAction({
      actor: guard.actor,
      action: `export.attractions.${format}`,
      entityType: "attraction_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `attractions_export_${date}`;

    return await createExportResponse(exportRows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Attractions Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
