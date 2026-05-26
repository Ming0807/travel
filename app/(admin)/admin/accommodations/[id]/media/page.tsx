import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminAccommodationById } from "@/lib/repositories/admin-accommodation.repository";
import { listAdminMedia } from "@/lib/repositories/admin-media.repository";
import { notFound } from "next/navigation";
import { MediaManager } from "@/components/admin/attractions/MediaManager";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Accommodation Media | Admin",
};

export default async function AdminAccommodationMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("attraction.update");

  const resolvedParams = await params;
  const accommodationId = parseInt(resolvedParams.id, 10);
  if (isNaN(accommodationId)) {
    notFound();
  }

  const accommodation = await getAdminAccommodationById(accommodationId);
  if (!accommodation) {
    notFound();
  }

  const mediaList = await listAdminMedia({ entityType: 'accommodation', entityId: accommodationId, page: 1, pageSize: 100 });

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <Link href="/admin/accommodations" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#F3704C]">
            <ArrowLeft size={16} /> กลับไปยังหน้ารายการ
          </Link>
          <AdminPageHeader
            eyebrow="Accommodation Media"
            title={`จัดการสื่อ: ${accommodation.name_th}`}
            description="จัดการรูปภาพและแกลอรี่สำหรับที่พักนี้"
          />
        </div>

        <div className="mt-8">
          <MediaManager entityId={accommodationId} entityType="accommodation" initialMedia={mediaList.items} />
        </div>
      </div>
    </AdminShell>
  );
}
