import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RestaurantForm } from "@/components/admin/restaurants/RestaurantForm";
import { requirePermission } from "@/lib/auth/guards";
import { listLiveDestinationProvinces } from "@/lib/repositories/destination-scope.repository";

export const metadata: Metadata = {
  title: "New Restaurant | Admin",
};

export default async function NewAdminRestaurantPage() {
  await requirePermission("restaurant.create");

  const provinces = await listLiveDestinationProvinces();

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Local Economy"
          title="สร้างร้านอาหารใหม่"
          description="เพิ่มร้านอาหารหรือธุรกิจชุมชนใหม่เข้าสู่ระบบ"
        />

        <div className="mt-8 max-w-6xl">
          <RestaurantForm 
            provinces={provinces.map(p => ({ id: p.provinceId, label: p.nameTh }))}
          />
        </div>
      </div>
    </AdminShell>
  );
}
