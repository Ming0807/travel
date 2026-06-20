import { Metadata } from "next";
import { AttractionVisualEditor } from "@/components/admin/attractions/visual-editor/AttractionVisualEditor";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminAttractionById, getAdminProvinces, getAdminAttractionTypes, getAdminDistricts, getAdminAllContentList, getAdminAttractionRelatedContent } from "@/lib/repositories/admin-attraction.repository";
import { listAdminMedia } from "@/lib/repositories/admin-media.repository";
import { getPublicAttractionDetail } from "@/lib/repositories/public-content.repository";
import { getReviewStatsByAttraction, listPublicReviewsByAttraction } from "@/lib/repositories/admin-review.repository";
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

  const [attraction, provinces, districts, types, mediaRes] = await Promise.all([
    getAdminAttractionById(attractionId),
    getAdminProvinces(),
    getAdminDistricts(),
    getAdminAttractionTypes(),
    listAdminMedia({ page: 1, pageSize: 100, entityType: 'attraction', entityId: attractionId })
  ]);

  if (!attraction) {
    notFound();
  }

  // Fetch contextual public data for the Visual Editor preview
  const [publicDetail, reviewStats, publicReviews, allContent, relatedContent] = await Promise.all([
    getPublicAttractionDetail(attraction.slug, { previewMode: true }),
    getReviewStatsByAttraction(attractionId),
    listPublicReviewsByAttraction(attractionId),
    getAdminAllContentList(),
    getAdminAttractionRelatedContent(attractionId)
  ]);

  // Remove AdminShell here because Visual Editor uses full screen layout
  return (
    <AttractionVisualEditor
      attraction={attraction}
      media={mediaRes.items}
      provinces={provinces.map(p => ({ id: p.province_id, label: p.province_name_th }))}
      districts={districts.map(d => ({ id: d.district_id, label: d.district_name_th, provinceId: d.province_id }))}
      attractionTypes={types.map(t => ({ id: t.attraction_type_id, label: t.type_name_th }))}
      publicDetail={publicDetail}
      reviewStats={reviewStats}
      publicReviews={publicReviews}
      allContent={allContent}
      relatedContent={relatedContent}
    />
  );
}
