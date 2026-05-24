import { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RestaurantForm } from "@/components/admin/restaurants/RestaurantForm";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminRestaurantById, getAdminProvinces } from "@/lib/repositories/admin-restaurant.repository";

export const metadata: Metadata = {
  title: "Edit Restaurant | Admin",
};

export default async function EditAdminRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("restaurant.update");

  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isFinite(restaurantId)) {
    notFound();
  }

  const [restaurant, provinces] = await Promise.all([
    getAdminRestaurantById(restaurantId),
    getAdminProvinces(),
  ]);

  if (!restaurant) {
    notFound();
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Local Economy"
          title={`แก้ไข: ${restaurant.name_th}`}
          description={restaurant.name_en ?? "แก้ไขข้อมูลร้านอาหาร"}
        />

        <div className="mt-8 max-w-6xl">
          <RestaurantForm 
            restaurant={restaurant}
            provinces={provinces.map(p => ({ id: p.province_id, label: p.province_name_th }))}
            submitLabel="บันทึกการเปลี่ยนแปลง"
          />
        </div>
      </div>
    </AdminShell>
  );
}
