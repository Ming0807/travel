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
    const guard = await requirePermission("export.comments");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from("reviews")
      .select(`
        review_id,
        rating,
        title,
        is_approved,
        is_published,
        moderated_at,
        created_at,
        attractions (name_th),
        restaurants (name_th)
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(maxRows + 1);

    if (error) {
      throw new Error("EXPORT_REVIEWS_FAILED");
    }

    if (data.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.review_comments.too_large",
        entityType: "review_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = ((data || []) as ExportRecord[]).map((row, index) => {
      const attraction = firstJoin(row.attractions as SupabaseJoin<ExportRecord>);
      const restaurant = firstJoin(row.restaurants as SupabaseJoin<ExportRecord>);

      return {
        "Review Ref": `R-${String(index + 1).padStart(6, "0")}`,
        "Attraction": attraction?.name_th || "",
        "Restaurant": restaurant?.name_th || "",
        "Rating": String(row.rating),
        "Title": row.title || "",
        "Is Approved": row.is_approved ? "Yes" : "No",
        "Is Published": row.is_published ? "Yes" : "No",
        "Moderated At": row.moderated_at || "",
        "Created At": row.created_at || "",
      };
    });

    await logAuditAction({
      actor: guard.actor,
      action: `export.review_comments.${format}`,
      entityType: "review_export",
      result: "success",
      metadata: { rowCount: rows.length, maxRows }
    });

    const date = new Date().toISOString().split("T")[0];
    const baseFilename = `reviews_export_${date}`;

    return await createExportResponse(rows, baseFilename, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "UNAUTHORIZED" ? 401 : 403 });
    }
    console.error("Export Reviews Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
