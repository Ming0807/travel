import { NextRequest, NextResponse } from "next/server";
import { requirePermission, AdminAuthError } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { adminStoryFiltersSchema } from "@/lib/validation/story";
import { parseExportFormat, createExportResponse } from "@/lib/utils/export-response";
import { firstJoin, type SupabaseJoin } from "@/lib/utils/supabase-joins";

export const dynamic = "force-dynamic";

type ExportRecord = Record<string, unknown>;

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.stories");
    const format = parseExportFormat(request.nextUrl.searchParams.get("format"));
    const parsed = adminStoryFiltersSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid export filters." }, { status: 400 });
    }
    const { page: _page, pageSize: _pageSize, ...filters } = parsed.data;
    void _page;
    void _pageSize;

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;

    const supabase = createSupabaseServiceRoleClient();

    const topicRelation = filters.topicId
      ? "story_topic_links!inner (topic_id)"
      : "story_topic_links (topic_id)";
    let query = supabase
      .from("travel_stories")
      .select(`
        *,
        provinces (province_name_th, province_name_en),
        ${topicRelation}
      `)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(maxRows + 1);

    if (filters.search) {
      const escaped = filters.search.replace(/%/g, "\\%").replace(/_/g, "\\_");
      query = query.or(`title.ilike.%${escaped}%,slug.ilike.%${escaped}%`);
    }
    if (filters.authorType) query = query.eq("author_type", filters.authorType);
    if (filters.provinceId) query = query.eq("province_id", filters.provinceId);
    if (filters.topicId) query = query.eq("story_topic_links.topic_id", filters.topicId);
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.readiness === "ready") query = query.eq("content_quality_score", 100);
    if (filters.readiness === "needs_work") {
      query = query.or("content_quality_score.lt.100,content_quality_score.is.null");
    }
    if (filters.readiness === "unscored") query = query.is("content_quality_score", null);
    if (filters.dateFrom) query = query.gte("created_at", `${filters.dateFrom}T00:00:00.000Z`);
    if (filters.dateTo) query = query.lte("created_at", `${filters.dateTo}T23:59:59.999Z`);
    if (filters.isPublished !== undefined) query = query.eq("is_published", filters.isPublished);

    const { data, error } = await query;

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
