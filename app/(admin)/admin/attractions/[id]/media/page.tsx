import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminAttractionById } from "@/lib/repositories/admin-attraction.repository";
import { listAdminMedia } from "@/lib/repositories/admin-media.repository";
import { notFound } from "next/navigation";
import { MediaManager } from "@/components/admin/attractions/MediaManager";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Attraction Media | Admin",
};

export default async function AdminAttractionMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("attraction.update");

  const resolvedParams = await params;
  const attractionId = parseInt(resolvedParams.id, 10);
  if (isNaN(attractionId)) {
    notFound();
  }

  const attraction = await getAdminAttractionById(attractionId);
  if (!attraction) {
    notFound();
  }

  const mediaList = await listAdminMedia({ attractionId, page: 1, pageSize: 100 });

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <Link href="/admin/attractions" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#0A6B62]">
            <ArrowLeft size={16} /> กลับไปยังหน้ารายการ
          </Link>
          <AdminPageHeader
            eyebrow="Attraction Media"
            title={`จัดการสื่อ: ${attraction.name_th}`}
            description="จัดการรูปภาพ วิดีโอ 360 และสื่ออื่นๆ สำหรับสถานที่ท่องเที่ยวนี้"
          />
        </div>

        <div className="mt-8">
          <MediaManager attractionId={attractionId} initialMedia={mediaList.items} />
        </div>
      </div>
    </AdminShell>
  );
}
