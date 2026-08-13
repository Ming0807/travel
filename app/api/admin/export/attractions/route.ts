import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { adminAttractionFiltersSchema } from "@/lib/validation/admin-attraction";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";
import { firstJoin, type SupabaseJoin } from "@/lib/utils/supabase-joins";
import { listAttractionIdsByType } from "@/lib/repositories/attraction-category.repository";

export const dynamic = "force-dynamic";

type ExportRecord = Record<string, unknown>;

function exportRecords(value: unknown): ExportRecord[] {
  return Array.isArray(value)
    ? value.filter((item): item is ExportRecord => Boolean(item) && typeof item === "object")
    : [];
}

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.attractions");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));
    const parsed = adminAttractionFiltersSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid export filters." }, { status: 400 });
    }
    const { page: _page, pageSize: _pageSize, ...filters } = parsed.data;
    void _page;
    void _pageSize;

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();
    const categoryAttractionIds = filters.attractionTypeId
      ? await listAttractionIdsByType(filters.attractionTypeId)
      : null;

    let query = supabase
      .from("attractions")
      .select(`
        *,
        provinces (province_name_th, province_name_en),
        districts (district_name_th, district_name_en),
        attraction_types (type_name_th, type_name_en),
        attraction_type_assignments (
          is_primary,
          display_order,
          attraction_types (type_name_th, type_name_en)
        )
      `)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(maxRows + 1);

    if (filters.search) {
      const escaped = filters.search.replace(/%/g, "\\%").replace(/_/g, "\\_");
      query = query.or(`name_th.ilike.%${escaped}%,name_en.ilike.%${escaped}%,slug.ilike.%${escaped}%`);
    }
    if (filters.provinceId) query = query.eq("province_id", filters.provinceId);
    if (filters.districtId) query = query.eq("district_id", filters.districtId);
    if (categoryAttractionIds?.length) query = query.in("attraction_id", categoryAttractionIds);
    if (categoryAttractionIds && categoryAttractionIds.length === 0) query = query.eq("attraction_id", -1);
    if (filters.isPublished !== undefined) query = query.eq("is_published", filters.isPublished);
    if (filters.isActive !== undefined) query = query.eq("is_active", filters.isActive);

    const { data, error } = await query;

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

    const rows = ((data || []) as ExportRecord[]).map((row) => {
      const province = firstJoin(row.provinces as SupabaseJoin<ExportRecord>);
      const district = firstJoin(row.districts as SupabaseJoin<ExportRecord>);
      const type = firstJoin(row.attraction_types as SupabaseJoin<ExportRecord>);
      const assignedTypes = exportRecords(row.attraction_type_assignments)
        .sort((left, right) => Number(Boolean(right.is_primary)) - Number(Boolean(left.is_primary))
          || Number(left.display_order ?? 0) - Number(right.display_order ?? 0))
        .map((assignment) => firstJoin(assignment.attraction_types as SupabaseJoin<ExportRecord>))
        .filter((category): category is ExportRecord => Boolean(category));

      return {
        "ID": String(row.attraction_id),
        "Name (TH)": row.name_th || "",
        "Name (EN)": row.name_en || "",
        "Slug": row.slug || "",
        "Province (TH)": province?.province_name_th || "",
        "Province (EN)": province?.province_name_en || "",
        "District (TH)": district?.district_name_th || "",
        "District (EN)": district?.district_name_en || "",
        "Primary Type (TH)": type?.type_name_th || "",
        "Primary Type (EN)": type?.type_name_en || "",
        "All Types (TH)": assignedTypes.map((category) => category.type_name_th).filter(Boolean).join(" | "),
        "All Types (EN)": assignedTypes.map((category) => category.type_name_en).filter(Boolean).join(" | "),
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
