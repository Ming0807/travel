import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { adminAccommodationFiltersSchema } from "@/lib/validation/admin-accommodation";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";
import { firstJoin, type SupabaseJoin } from "@/lib/utils/supabase-joins";

export const dynamic = "force-dynamic";

type ExportRecord = Record<string, unknown>;

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.accommodations");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));
    const parsed = adminAccommodationFiltersSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid export filters." }, { status: 400 });
    }
    const { page: _page, pageSize: _pageSize, ...filters } = parsed.data;
    void _page;
    void _pageSize;

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    let query = supabase
      .from("accommodations")
      .select(`
        *,
        provinces (province_name_th, province_name_en)
      `)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(maxRows + 1);

    if (filters.search) {
      const escaped = filters.search.replace(/%/g, "\\%").replace(/_/g, "\\_");
      query = query.or(`name_th.ilike.%${escaped}%,name_en.ilike.%${escaped}%,slug.ilike.%${escaped}%`);
    }
    if (filters.provinceId) query = query.eq("province_id", filters.provinceId);
    if (filters.accommodationType) {
      const escapedType = filters.accommodationType.replace(/%/g, "\\%").replace(/_/g, "\\_");
      query = query.ilike("accommodation_type", `%${escapedType}%`);
    }
    if (filters.isPublished !== undefined) query = query.eq("is_published", filters.isPublished);

    const { data, error } = await query;

    if (error) {
      throw new Error("EXPORT_ACCOMMODATIONS_FAILED");
    }

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.accommodations.too_large",
        entityType: "accommodation_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = ((data || []) as ExportRecord[]).map((row) => {
      const province = firstJoin(row.provinces as SupabaseJoin<ExportRecord>);

      return {
        "ID": String(row.accommodation_id),
        "Name (TH)": row.name_th || "",
        "Name (EN)": row.name_en || "",
        "Slug": row.slug || "",
        "Province (TH)": province?.province_name_th || "",
        "Province (EN)": province?.province_name_en || "",
        "Type": row.accommodation_type || "",
        "Price Range": row.price_range || "",
        "Latitude": row.latitude !== null ? String(row.latitude) : "",
        "Longitude": row.longitude !== null ? String(row.longitude) : "",
        "Address": row.address_text || "",
        "Contact Info": row.contact_info || "",
        "Is Published": row.is_published ? "Yes" : "No",
        "Is Active": row.is_active ? "Yes" : "No",
        "Created At": row.created_at || "",
        "Updated At": row.updated_at || "",
      };
    });

    await logAuditAction({
      actor: guard.actor,
      action: `export.accommodations.${format}`,
      entityType: "accommodation_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `accommodations_export_${date}`;

    return await createExportResponse(rows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Accommodations Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
