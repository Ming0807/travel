import { Metadata } from "next";
import { AttractionVisualEditor } from "@/components/admin/attractions/visual-editor/AttractionVisualEditor";
import { requirePermission } from "@/lib/auth/guards";
import {
  getAdminAttractionById,
  getAdminProvinces,
  getAdminAttractionTypes,
  getAdminDistricts,
  getAdminAttractionRelatedContent,
  getAdminAttractionRelatedContentSettings,
  getAdminSelectedRelatedContent,
} from "@/lib/repositories/admin-attraction.repository";
import { listAdminMedia } from "@/lib/repositories/admin-media.repository";
import { getAdminAttractionPreview } from "@/lib/repositories/public-content.repository";
import { getReviewStatsByAttraction, listPublicReviewsByAttraction } from "@/lib/repositories/admin-review.repository";
import { notFound } from "next/navigation";
import { listAttractionTypeAssignments } from "@/lib/repositories/attraction-category.repository";
import { sanitizeAdminRichHtml } from "@/lib/content/admin-rich-html";

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

  const [attraction, provinces, districts, types, mediaRes, categoryAssignments] = await Promise.all([
    getAdminAttractionById(attractionId),
    getAdminProvinces(),
    getAdminDistricts(),
    getAdminAttractionTypes(),
    listAdminMedia({ page: 1, pageSize: 100, entityType: 'attraction', entityId: attractionId }),
    listAttractionTypeAssignments(attractionId),
  ]);

  if (!attraction) {
    notFound();
  }

  // Fetch contextual public data for the Visual Editor preview
  const [publicDetail, reviewStats, publicReviews, relatedContent, relatedSettings] = await Promise.all([
    getAdminAttractionPreview(attraction.slug),
    getReviewStatsByAttraction(attractionId),
    listPublicReviewsByAttraction(attractionId),
    getAdminAttractionRelatedContent(attractionId),
    getAdminAttractionRelatedContentSettings(attractionId),
  ]);
  const [selectedAttractions, selectedRestaurants, selectedAccommodations, selectedStories] = await Promise.all([
    getAdminSelectedRelatedContent(
      attractionId,
      "attractions",
      relatedContent.attractions.map((item) => Number(item.related_attraction_id)),
    ),
    getAdminSelectedRelatedContent(
      attractionId,
      "restaurants",
      relatedContent.restaurants.map((item) => Number(item.restaurant_id)),
    ),
    getAdminSelectedRelatedContent(
      attractionId,
      "accommodations",
      relatedContent.accommodations.map((item) => Number(item.accommodation_id)),
    ),
    getAdminSelectedRelatedContent(
      attractionId,
      "stories",
      relatedContent.stories.map((item) => Number(item.story_id)),
    ),
  ]);
  const selectedRelatedContent = {
    attractions: selectedAttractions,
    restaurants: selectedRestaurants,
    accommodations: selectedAccommodations,
    stories: selectedStories,
  };

  // Remove AdminShell here because Visual Editor uses full screen layout
  return (
    <AttractionVisualEditor
      attraction={attraction}
      media={mediaRes.items}
      provinces={provinces.map(p => ({ id: p.province_id, label: p.province_name_th }))}
      districts={districts.map(d => ({ id: d.district_id, label: d.district_name_th, provinceId: d.province_id }))}
      attractionTypes={types.map(t => ({ id: t.attraction_type_id, label: t.type_name_th, labelEn: t.type_name_en, isActive: t.is_active }))}
      categoryAssignments={categoryAssignments}
      richContentPreview={{
        descriptionTh: sanitizeAdminRichHtml(attraction.description_th),
        historyTh: sanitizeAdminRichHtml(attraction.history_th),
      }}
      publicDetail={publicDetail}
      reviewStats={reviewStats}
      publicReviews={publicReviews}
      relatedSettings={relatedSettings}
      selectedRelatedContent={selectedRelatedContent}
    />
  );
}
