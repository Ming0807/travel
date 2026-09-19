import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RestaurantForm } from "@/components/admin/restaurants/RestaurantForm";
import { requirePermission } from "@/lib/auth/guards";
import { listLiveDestinationProvinces } from "@/lib/repositories/destination-scope.repository";
import { listAdminRestaurantCategories } from "@/lib/repositories/admin-restaurant-category.repository";
import { getAdminAttractionsList } from "@/lib/repositories/admin-attraction.repository";

export const metadata: Metadata = {
  title: "New Restaurant | Admin",
};

export default async function NewAdminRestaurantPage() {
  await requirePermission("restaurant.create");

  const [provinces, categories, attractions] = await Promise.all([
    listLiveDestinationProvinces(),
    listAdminRestaurantCategories({ activeOnly: true }),
    getAdminAttractionsList(),
  ]);

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
            categories={categories}
            nearbyAttractions={attractions.map((attraction) => ({
              id: Number(attraction.attraction_id),
              label: attraction.name_th,
              isPublished: attraction.is_published === true,
            }))}
          />
        </div>
      </div>
    </AdminShell>
  );
}
