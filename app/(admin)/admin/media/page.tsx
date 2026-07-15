import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { ExportButton } from "@/components/admin/ExportButton";
import { listAdminMediaLibraryAssets } from "@/lib/repositories/admin-media-library.repository";
import { adminMediaLibraryFiltersSchema } from "@/lib/validation/media-library";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "คลังสื่อ | Admin",
};

export default async function MediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const guard = await requirePermission("media.read");
  const rawFilters = await searchParams;
  const parsed = adminMediaLibraryFiltersSchema.safeParse(rawFilters);
  const filters = parsed.success
    ? parsed.data
    : adminMediaLibraryFiltersSchema.parse({});
  const media = await listAdminMediaLibraryAssets(filters);
  const exportParams = {
    search: filters.search,
    category: filters.category,
    lifecycleStatus: filters.lifecycleStatus,
    mediaType: filters.mediaType,
  };

  return (
    <AdminShell>
      <div className="mx-auto flex max-w-7xl flex-col">
        <div className="mb-6 shrink-0">
          <AdminPageHeader
            eyebrow="สื่อเนื้อหา (Content Assets)"
            title="คลังสื่อ (Media Library)"
            description="ค้นหา อัปโหลด และจัดการสื่อทางการของเว็บไซต์ ตัวกรองและไฟล์ส่งออกใช้ข้อมูลชุดเดียวกัน"
            actions={hasPermission(guard.actor, "export.media") ? (
              <ExportButton
                endpoint="/api/admin/export/media"
                label="ส่งออกข้อมูล"
                params={exportParams}
              />
            ) : null}
          />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <ErrorBoundary fallbackTitle="ไม่สามารถเปิดคลังสื่อได้" fallbackDescription="กรุณารีเฟรชหน้าแล้วลองอีกครั้ง">
            <MediaLibrary
              mode="manage"
              serverData={{
                assets: media.items,
                total: media.total,
                page: media.page,
                pageSize: media.pageSize,
                filters: {
                  search: filters.search,
                  category: filters.category,
                  lifecycleStatus: filters.lifecycleStatus,
                  mediaType: filters.mediaType,
                },
              }}
            />
          </ErrorBoundary>
        </div>
      </div>
    </AdminShell>
  );
}
