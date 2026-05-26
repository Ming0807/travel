import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AccommodationForm } from "@/components/admin/accommodations/AccommodationForm";
import { getAdminProvinces } from "@/lib/repositories/admin-accommodation.repository";
import { requirePermission } from "@/lib/auth/guards";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Add Accommodation | Admin",
};

export default async function NewAccommodationPage() {
  await requirePermission("attraction.create");
  const provincesData = await getAdminProvinces();
  
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
            eyebrow="Create New"
            title="เพิ่มที่พักใหม่"
            description="กรอกข้อมูลพื้นฐานของที่พัก เพื่อให้แสดงในหน้าสถานที่ท่องเที่ยวที่เกี่ยวข้อง"
          />
        </div>

        <AccommodationForm provinces={provinces} submitLabel="เพิ่มที่พักใหม่" />
      </div>
    </AdminShell>
  );
}
