import { Metadata } from "next";
import { notFound } from "next/navigation";
import { RestaurantVisualEditor } from "@/components/admin/restaurants/visual-editor/RestaurantVisualEditor";
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
    <RestaurantVisualEditor 
      restaurant={restaurant}
      provinces={provinces.map(p => ({ id: p.province_id, label: p.province_name_th }))}
    />
  );
}
