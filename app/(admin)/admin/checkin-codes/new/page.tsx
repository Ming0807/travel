import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CheckinCodeForm } from "@/components/admin/checkin-codes/CheckinCodeForm";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminAttractionsList, getAdminPhotoSpotsList } from "@/lib/repositories/admin-attraction.repository";

export const metadata: Metadata = {
  title: "New Check-in Code | Admin",
};

export default async function NewAdminCheckinCodePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("checkin_code.create");
  const resolvedSearchParams = await searchParams;
  const rawAttractionId = Array.isArray(resolvedSearchParams?.attraction_id)
    ? resolvedSearchParams?.attraction_id[0]
    : resolvedSearchParams?.attraction_id;
  const rawPhotoSpotId = Array.isArray(resolvedSearchParams?.photo_spot_id)
    ? resolvedSearchParams?.photo_spot_id[0]
    : resolvedSearchParams?.photo_spot_id;
  const defaultAttractionId = rawAttractionId ? Number(rawAttractionId) : null;
  const defaultPhotoSpotId = rawPhotoSpotId ? Number(rawPhotoSpotId) : null;

  const [attractions, photoSpots] = await Promise.all([
    getAdminAttractionsList(),
    getAdminPhotoSpotsList(),
  ]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Content Management"
          title="สร้าง Check-in Code ใหม่"
          description="เพิ่มรหัส QR สำหรับนักท่องเที่ยวสแกนเช็คอิน"
        />

        <div className="mt-8 max-w-4xl">
          <CheckinCodeForm 
            attractions={attractions}
            photoSpots={photoSpots}
            defaultAttractionId={Number.isFinite(defaultAttractionId) ? defaultAttractionId : null}
            defaultPhotoSpotId={Number.isFinite(defaultPhotoSpotId) ? defaultPhotoSpotId : null}
          />
        </div>
      </div>
    </AdminShell>
  );
}
