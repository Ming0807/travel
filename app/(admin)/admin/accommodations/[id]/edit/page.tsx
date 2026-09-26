import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AccommodationForm } from "@/components/admin/accommodations/AccommodationForm";
import {
  getAdminProvinces,
  getAdminAccommodationById,
  getAdminAccommodationRelatedAttractions,
} from "@/lib/repositories/admin-accommodation.repository";
import { getCoverMediaForEntity, listAdminMedia } from "@/lib/repositories/admin-media.repository";
import { requirePermission } from "@/lib/auth/guards";
import { adminMediaPreviewUrl } from "@/lib/media/storage-paths";
import { listLiveDestinationProvinceIds } from "@/lib/repositories/destination-scope.repository";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Edit Accommodation | Admin",
};

export default async function EditAccommodationPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("attraction.update");
  const { id } = await params;
  const accommodationId = Number(id);
  if (!Number.isSafeInteger(accommodationId) || accommodationId <= 0) notFound();

  const [provincesData, accommodation, coverMedia, liveProvinceIds, galleryMedia, relatedAttractions] = await Promise.all([
    getAdminProvinces(),
    getAdminAccommodationById(accommodationId),
    getCoverMediaForEntity("accommodation", accommodationId),
    listLiveDestinationProvinceIds(),
    listAdminMedia({ entityType: "accommodation", entityId: accommodationId, page: 1, pageSize: 100 }),
    getAdminAccommodationRelatedAttractions(accommodationId),
  ]);

  if (!accommodation) notFound();

  const provinces = (provincesData ?? []).map(p => ({
    id: Number(p.province_id),
    label: p.province_name_th
  }));

  return (
    <AdminShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Link href="/admin/accommodations" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 mb-4 transition-colors">
            <ArrowLeft size={16} /> กลับไปหน้ารายการ
          </Link>
          <AdminPageHeader
            eyebrow="Edit Mode"
            title={`แก้ไข: ${accommodation.name_th}`}
            description="ปรับปรุงข้อมูลพื้นฐานและพิกัดที่ตั้งของที่พัก"
          />
        </div>

        <AccommodationForm 
          provinces={provinces} 
          accommodation={accommodation}
          submitLabel="บันทึกการแก้ไข"
          coverMediaId={coverMedia?.media_id ?? null}
          coverPreviewUrl={adminMediaPreviewUrl(coverMedia?.storage_path)}
          isPubliclyAvailable={accommodation.is_active && accommodation.is_published && liveProvinceIds.includes(accommodation.province_id)}
          galleryMedia={galleryMedia.items}
          relatedAttractions={relatedAttractions}
        />
      </div>
    </AdminShell>
  );
}
