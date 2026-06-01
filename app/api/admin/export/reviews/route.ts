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
    const guard = await requirePermission("export.reviews");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        tourists (display_name),
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
        action: "export.reviews.too_large",
        entityType: "review_export",
        result: "failed",
        metadata: { maxRows }
      });
      return NextResponse.json({ error: "Export is too large. Please apply more filters." }, { status: 413 });
    }

    const rows = (data || []).map((row: any) => {
      const tourist = Array.isArray(row.tourists) ? row.tourists[0] : row.tourists;
      const attraction = Array.isArray(row.attractions) ? row.attractions[0] : row.attractions;
      const restaurant = Array.isArray(row.restaurants) ? row.restaurants[0] : row.restaurants;

      return {
        "ID": String(row.review_id),
        "Tourist Name": tourist?.display_name || "",
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
      action: `export.reviews.${format}`,
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
