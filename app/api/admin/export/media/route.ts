import { NextRequest, NextResponse } from "next/server";
import { AdminAuthError, requirePermission } from "@/lib/auth/guards";
import { getServerEnv } from "@/lib/config/server-env";
import { exportAdminMediaLibraryAssets } from "@/lib/repositories/admin-media-library.repository";
import { logAuditAction } from "@/lib/services/audit-log.service";
import { createExportResponse } from "@/lib/utils/export-response";
import { adminMediaLibraryExportFiltersSchema } from "@/lib/validation/media-library";

export const dynamic = "force-dynamic";

function storageReferenceType(value: string) {
  if (/^https?:\/\//i.test(value)) return "external_url";
  if (value.startsWith("cloudinary:")) return "cloudinary_reference";
  if (value.startsWith("site-media/")) return "site_media";
  return "storage_reference";
}

export async function GET(request: NextRequest) {
  try {
    const guard = await requirePermission("export.media");
    const parsed = adminMediaLibraryExportFiltersSchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );

    if (!parsed.success) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.media.invalid_filters",
        entityType: "media_export",
        result: "failed",
        metadata: {
          providedKeys: Array.from(request.nextUrl.searchParams.keys()).sort(),
        },
      });
      return NextResponse.json({ error: "Invalid export filters." }, { status: 400 });
    }

    const {
      page: _page,
      pageSize: _pageSize,
      format,
      ...filters
    } = parsed.data;
    void _page;
    void _pageSize;

    const maxRows = getServerEnv().EXPORT_MAX_ROWS;
    const assets = await exportAdminMediaLibraryAssets(filters, maxRows + 1);
    const auditFilters = {
      category: filters.category ?? null,
      lifecycleStatus: filters.lifecycleStatus,
      mediaType: filters.mediaType ?? null,
      hasSearch: Boolean(filters.search),
    };

    if (assets.length > maxRows) {
      await logAuditAction({
        actor: guard.actor,
        action: "export.media.too_large",
        entityType: "media_export",
        result: "failed",
        metadata: { maxRows, filters: auditFilters },
      });
      return NextResponse.json(
        { error: "Export is too large. Please apply more filters." },
        { status: 413 },
      );
    }

    const rows = assets.map((asset) => ({
      "Asset ID": asset.id,
      "File Name": asset.file_name,
      Category: asset.category,
      "Media Type": asset.mime_type.replace("image/", "").toUpperCase(),
      "Size (Bytes)": String(asset.size_bytes),
      "Lifecycle Status": asset.lifecycle_status,
      "Has Thumbnail": asset.thumbnail_storage_path ? "Yes" : "No",
      "Storage Reference Type": storageReferenceType(asset.storage_path),
      "Created At": asset.created_at,
    }));

    await logAuditAction({
      actor: guard.actor,
      action: `export.media.${format}`,
      entityType: "media_export",
      result: "success",
      metadata: {
        rowCount: rows.length,
        maxRows,
        filters: auditFilters,
      },
    });

    const exportRows = rows.length === 0 ? [{ Message: "No data available" }] : rows;
    const date = new Date().toISOString().split("T")[0];
    return await createExportResponse(exportRows, `media_library_export_${date}`, format);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.code === "UNAUTHORIZED" ? 401 : 403 },
      );
    }
    console.error("Export Media Error:", error);
    return NextResponse.json({ error: "Failed to export data." }, { status: 500 });
  }
}
