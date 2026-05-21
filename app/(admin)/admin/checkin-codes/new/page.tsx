import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CheckinCodeForm } from "@/components/admin/checkin-codes/CheckinCodeForm";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminAttractionsList, getAdminPhotoSpotsList } from "@/lib/repositories/admin-attraction.repository";

export const metadata: Metadata = {
  title: "New Check-in Code | Admin",
};

export default async function NewAdminCheckinCodePage() {
  await requirePermission("checkin_code.create");

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
          />
        </div>
      </div>
    </AdminShell>
  );
}
