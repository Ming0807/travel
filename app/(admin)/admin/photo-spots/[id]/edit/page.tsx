import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PhotoSpotForm } from "@/components/admin/photo-spots/PhotoSpotForm";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminPhotoSpotById } from "@/lib/repositories/photo-spot.repository";
import { listAdminAttractions } from "@/lib/repositories/admin-attraction.repository";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Photo Spot | Admin",
};

export default async function EditAdminPhotoSpotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("photo_spot.update");

  const resolvedParams = await params;
  const photoSpotId = parseInt(resolvedParams.id, 10);
  if (isNaN(photoSpotId)) {
    notFound();
  }

  const [photoSpot, { items: attractions }] = await Promise.all([
    getAdminPhotoSpotById(photoSpotId),
    listAdminAttractions({ page: 1, pageSize: 1000 }),
  ]);

  if (!photoSpot) {
    notFound();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Content Management"
          title={`แก้ไขจุดถ่ายภาพ: ${photoSpot.spot_name_th}`}
          description="แก้ไขรายละเอียดจุดถ่ายภาพ"
        />

        <div className="mt-8 max-w-6xl">
          <PhotoSpotForm 
            photoSpot={photoSpot}
            attractions={attractions.map(a => ({ id: a.attraction_id, label: a.name_th }))}
            submitLabel="บันทึกการแก้ไข"
          />
        </div>
      </div>
    </AdminShell>
  );
}
