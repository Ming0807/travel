import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";
import { adminReviewFiltersSchema } from "@/lib/validation/admin-review";
import { exportAdminReviews } from "@/lib/repositories/admin-review.repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.comments");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));
    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const rawParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = adminReviewFiltersSchema.safeParse(rawParams);
    if (!parsed.success) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.review_comments.invalid_filters",
        entityType: "review_export",
        result: "failed",
        metadata: { reason: "invalid_filters" }
      });
      return NextResponse.json({ error: "Invalid export filters." }, { status: 400 });
    }

    const { page: _page, pageSize: _pageSize, ...filters } = parsed.data;
    void _page;
    void _pageSize;

    const data = await exportAdminReviews(filters, maxRows + 1);

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

    const rows = data.map((row, index) => ({
      "Review Ref": `R-${String(index + 1).padStart(6, "0")}`,
      "Attraction": row.attraction_name || "",
      "Restaurant": row.restaurant_name || "",
      "Rating": String(row.rating),
      "Is Approved": row.is_approved ? "Yes" : "No",
      "Is Published": row.is_published ? "Yes" : "No",
      "Moderated At": row.moderated_at || "",
      "Created At": row.created_at || "",
    }));

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
