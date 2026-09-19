import { Metadata } from "next";
import { notFound } from "next/navigation";
import { RestaurantVisualEditor } from "@/components/admin/restaurants/visual-editor/RestaurantVisualEditor";
import { requirePermission } from "@/lib/auth/guards";
import {
  getAdminRestaurantById,
  getAdminProvinces,
  listAdminRestaurantAttractionIds,
} from "@/lib/repositories/admin-restaurant.repository";
import { getCoverMediaForEntity } from "@/lib/repositories/admin-media.repository";
import { adminMediaPreviewUrl } from "@/lib/media/storage-paths";
import { listAdminRestaurantCategories } from "@/lib/repositories/admin-restaurant-category.repository";
import { getAdminAttractionsList } from "@/lib/repositories/admin-attraction.repository";

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

  const [restaurant, provinces, coverMedia, categories, attractions, selectedAttractionIds] = await Promise.all([
    getAdminRestaurantById(restaurantId),
    getAdminProvinces(),
    getCoverMediaForEntity("restaurant", restaurantId),
    listAdminRestaurantCategories({ activeOnly: true }),
    getAdminAttractionsList(),
    listAdminRestaurantAttractionIds(restaurantId),
  ]);

  if (!restaurant) {
    notFound();
  }

  return (
    <RestaurantVisualEditor 
      restaurant={restaurant}
      provinces={provinces.map(p => ({ id: p.province_id, label: p.province_name_th }))}
      categories={categories}
      nearbyAttractions={attractions.map((attraction) => ({
        id: Number(attraction.attraction_id),
        label: attraction.name_th,
        isPublished: attraction.is_published === true,
      }))}
      selectedAttractionIds={selectedAttractionIds}
      coverMediaId={coverMedia?.media_id ?? null}
      coverMediaUrl={adminMediaPreviewUrl(coverMedia?.storage_path)}
    />
  );
}
