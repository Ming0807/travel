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
    const guard = await requirePermission("export.stories");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from("travel_stories")
      .select(`
        *,
        provinces (province_name_th, province_name_en)
      `)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(maxRows + 1);

    if (error) {
      throw new Error("EXPORT_STORIES_FAILED");
    }

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.stories.too_large",
        entityType: "story_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = ((data || []) as ExportRecord[]).map((row) => {
      const province = firstJoin(row.provinces as SupabaseJoin<ExportRecord>);

      return {
        "ID": String(row.story_id),
        "Title": row.title || "",
        "Slug": row.slug || "",
        "Excerpt": row.excerpt || "",
        "Category": row.category || "",
        "Province (TH)": province?.province_name_th || "",
        "Province (EN)": province?.province_name_en || "",
        "Is Published": row.is_published ? "Yes" : "No",
        "Published At": row.published_at || "",
        "Created At": row.created_at || "",
        "Updated At": row.updated_at || "",
      };
    });

    const exportRows = rows.length === 0 ? [{ Message: "No data available" }] : rows;

    await logAuditAction({
      actor: guard.actor,
      action: `export.stories.${format}`,
      entityType: "story_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `stories_export_${date}`;

    return await createExportResponse(exportRows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Stories Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
