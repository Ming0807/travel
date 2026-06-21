import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.media");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from("content_media")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(maxRows + 1);

    if (error) {
      throw new Error("EXPORT_MEDIA_FAILED");
    }

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.media.too_large",
        entityType: "media_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const entityTypeMap: Record<string, string> = {
      attraction_id: "attraction",
      restaurant_id: "restaurant",
      accommodation_id: "accommodation",
      story_id: "story",
      route_id: "route",
    };

    const rows = ((data || []) as Array<Record<string, unknown>>).map((row) => {
      // Determine entity type from which FK column is set
      let entityType = "";
      let entityId = "";
      for (const [col, label] of Object.entries(entityTypeMap)) {
        if (row[col] !== null && row[col] !== undefined) {
          entityType = label;
          entityId = String(row[col]);
          break;
        }
      }

      return {
        "ID": String(row.media_id),
        "Media Type": row.media_type || "",
        "Storage Path": row.storage_path || "",
        "Entity Type": entityType,
        "Entity ID": entityId,
        "Alt Text (TH)": row.alt_text_th || "",
        "Alt Text (EN)": row.alt_text_en || "",
        "Caption (TH)": row.caption_th || "",
        "Caption (EN)": row.caption_en || "",
        "Is Cover": row.is_cover ? "Yes" : "No",
        "Is Active": row.is_active ? "Yes" : "No",
        "Lifecycle Status": row.lifecycle_status || "",
        "Display Order": row.display_order !== null ? String(row.display_order) : "",
        "Created At": row.created_at || "",
        "Updated At": row.updated_at || "",
      };
    });

    const exportRows = rows.length === 0 ? [{ Message: "No data available" }] : rows;

    await logAuditAction({
      actor: guard.actor,
      action: `export.media.${format}`,
      entityType: "media_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `media_export_${date}`;

    return await createExportResponse(exportRows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Media Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
