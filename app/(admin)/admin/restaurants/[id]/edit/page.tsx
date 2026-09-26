import { Metadata } from "next";
import { notFound } from "next/navigation";
import { RestaurantVisualEditor } from "@/components/admin/restaurants/visual-editor/RestaurantVisualEditor";
import { requirePermission } from "@/lib/auth/guards";
import {
  getAdminRestaurantById,
  getAdminProvinces,
  listAdminRestaurantAttractionIds,
} from "@/lib/repositories/admin-restaurant.repository";
import { getCoverMediaForEntity, listAdminMedia } from "@/lib/repositories/admin-media.repository";
import { adminMediaPreviewUrl } from "@/lib/media/storage-paths";
import { listAdminRestaurantCategories } from "@/lib/repositories/admin-restaurant-category.repository";
import { getAdminAttractionsList } from "@/lib/repositories/admin-attraction.repository";
import { listLiveDestinationProvinceIds } from "@/lib/repositories/destination-scope.repository";
import { sanitizeAdminRichHtml } from "@/lib/content/admin-rich-html";

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

  if (!Number.isSafeInteger(restaurantId) || restaurantId <= 0) {
    notFound();
  }

  const [restaurant, provinces, coverMedia, media, categories, attractions, selectedAttractionIds, liveProvinceIds] = await Promise.all([
    getAdminRestaurantById(restaurantId),
    getAdminProvinces(),
    getCoverMediaForEntity("restaurant", restaurantId),
    listAdminMedia({ entityType: "restaurant", entityId: restaurantId, page: 1, pageSize: 100 }),
    listAdminRestaurantCategories({ activeOnly: true }),
    getAdminAttractionsList(),
    listAdminRestaurantAttractionIds(restaurantId),
    listLiveDestinationProvinceIds(),
  ]);

  if (!restaurant) {
    notFound();
  }

  return (
    <RestaurantVisualEditor 
      restaurant={restaurant}
      descriptionPreviewHtml={restaurant.description_th && /<[a-z][\s\S]*>/i.test(restaurant.description_th)
        ? sanitizeAdminRichHtml(restaurant.description_th)
        : null}
      media={media.items}
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
      isPubliclyAvailable={
        restaurant.is_active
        && restaurant.is_published
        && liveProvinceIds.includes(restaurant.province_id)
      }
    />
  );
}
