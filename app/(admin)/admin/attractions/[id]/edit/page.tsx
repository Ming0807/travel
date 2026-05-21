import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AttractionForm } from "@/components/admin/attractions/AttractionForm";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminAttractionById, getAdminProvinces, getAdminAttractionTypes } from "@/lib/repositories/admin-attraction.repository";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Attraction | Admin",
};

export default async function EditAdminAttractionPage({
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

  const [attraction, provinces, types] = await Promise.all([
    getAdminAttractionById(attractionId),
    getAdminProvinces(),
    getAdminAttractionTypes(),
  ]);

  if (!attraction) {
    notFound();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Content Management"
          title={`แก้ไขสถานที่: ${attraction.name_th}`}
          description="แก้ไขรายละเอียดสถานที่ท่องเที่ยว"
        />

        <div className="mt-8 max-w-4xl">
          <AttractionForm 
            attraction={attraction}
            provinces={provinces.map(p => ({ id: p.province_id, label: p.province_name_th }))}
            districts={[]} 
            attractionTypes={types.map(t => ({ id: t.attraction_type_id, label: t.type_name_th }))}
            submitLabel="บันทึกการแก้ไข"
          />
        </div>
      </div>
    </AdminShell>
  );
}
