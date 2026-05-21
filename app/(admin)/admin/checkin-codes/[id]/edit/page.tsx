import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CheckinCodeForm } from "@/components/admin/checkin-codes/CheckinCodeForm";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminAttractionsList, getAdminPhotoSpotsList } from "@/lib/repositories/admin-attraction.repository";
import { getAdminCheckinCodeById } from "@/lib/repositories/admin-checkin-code.repository";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Check-in Code | Admin",
};

export default async function EditAdminCheckinCodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("checkin_code.update");

  const resolvedParams = await params;
  const checkinCodeId = parseInt(resolvedParams.id, 10);
  if (isNaN(checkinCodeId)) {
    notFound();
  }

  const [checkinCode, attractions, photoSpots] = await Promise.all([
    getAdminCheckinCodeById(checkinCodeId),
    getAdminAttractionsList(),
    getAdminPhotoSpotsList(),
  ]);

  if (!checkinCode) {
    notFound();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Content Management"
          title={`แก้ไข Check-in Code: ${checkinCode.code}`}
          description="แก้ไขรายละเอียดรหัส QR Code"
        />

        <div className="mt-8 max-w-4xl">
          <CheckinCodeForm 
            initialData={checkinCode}
            attractions={attractions}
            photoSpots={photoSpots}
          />
        </div>
      </div>
    </AdminShell>
  );
}
