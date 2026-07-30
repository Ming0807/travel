import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AttractionQuickCreate } from "@/components/admin/attractions/AttractionQuickCreate";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminAttractionTypes } from "@/lib/repositories/admin-attraction.repository";
import { listLiveDestinationProvinces } from "@/lib/repositories/destination-scope.repository";

export const metadata: Metadata = {
  title: "New Attraction | Admin",
};

export default async function NewAdminAttractionPage() {
  await requirePermission("attraction.create");

  const [provinces, types] = await Promise.all([
    listLiveDestinationProvinces(),
    getAdminAttractionTypes(),
  ]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Content Management"
          title="สร้างสถานที่ท่องเที่ยวใหม่"
          description="เพิ่มสถานที่ท่องเที่ยวใหม่เข้าสู่ระบบ"
        />

        <div className="mt-8 max-w-6xl">
          <AttractionQuickCreate
            provinces={provinces.map(p => ({ id: p.provinceId, label: p.nameTh }))}
            attractionTypes={types.map(t => ({ id: t.attraction_type_id, label: t.type_name_th }))}
          />
        </div>
      </div>
    </AdminShell>
  );
}
