import { Metadata } from "next";
import { RouteVisualEditor } from "@/components/admin/routes/visual-editor/RouteVisualEditor";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminRouteById, getRouteStops, listEligibleRouteAttractionIds } from "@/lib/repositories/admin-route.repository";
import { listAdminAttractions } from "@/lib/repositories/admin-attraction.repository";
import { getCoverMediaForEntity } from "@/lib/repositories/admin-media.repository";
import { adminMediaPreviewUrl } from "@/lib/media/storage-paths";
import { notFound } from "next/navigation";
import type { RouteAttractionOption } from "@/components/admin/routes/RouteStopsManager";

export const metadata: Metadata = {
  title: "Edit Suggested Route | Admin",
};

export default async function EditAdminRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("route.update");

  const resolvedParams = await params;
  const routeId = Number(resolvedParams.id);
  if (!Number.isSafeInteger(routeId) || routeId < 1) {
    notFound();
  }

  const [route, coverMedia, stops, attractions] = await Promise.all([
    getAdminRouteById(routeId),
    getCoverMediaForEntity("route", routeId),
    getRouteStops(routeId),
    listAdminAttractions({ page: 1, pageSize: 500, isActive: true, isPublished: true }),
  ]);
  if (!route) {
    notFound();
  }

  const eligibleAttractionIds = await listEligibleRouteAttractionIds(attractions.items.map((attraction) => attraction.attraction_id));
  const coverAttractionIds = Array.from(new Set([
    ...stops.map((stop) => stop.attraction_id),
    ...eligibleAttractionIds,
  ]));
  const stopCoverEntries = await Promise.all(coverAttractionIds.map(async (attractionId) => {
    const media = await getCoverMediaForEntity("attraction", attractionId);
    return [attractionId, adminMediaPreviewUrl(media?.storage_path)] as const;
  }));
  const stopCovers = new Map(stopCoverEntries);
  const attractionOptions: RouteAttractionOption[] = attractions.items.map((attraction) => ({
    attraction_id: attraction.attraction_id,
    name_th: attraction.name_th,
    name_en: attraction.name_en,
    province_name_th: attraction.province_name_th,
    is_active: attraction.is_active && eligibleAttractionIds.has(attraction.attraction_id),
    is_published: attraction.is_published && eligibleAttractionIds.has(attraction.attraction_id),
    coverImageUrl: stopCovers.get(attraction.attraction_id) ?? null,
  }));
  const includedAttractionIds = new Set(attractionOptions.map((attraction) => attraction.attraction_id));
  stops.forEach((stop) => {
    if (includedAttractionIds.has(stop.attraction_id)) return;
    attractionOptions.push({
      attraction_id: stop.attraction_id,
      name_th: stop.attraction_name_th ?? `สถานที่ #${stop.attraction_id}`,
      name_en: null,
      province_name_th: null,
      is_active: false,
      is_published: false,
      coverImageUrl: stopCovers.get(stop.attraction_id) ?? null,
    });
    includedAttractionIds.add(stop.attraction_id);
  });

  return (
    <RouteVisualEditor
      route={route}
      coverMediaId={coverMedia?.media_id ?? null}
      coverMediaUrl={adminMediaPreviewUrl(coverMedia?.storage_path)}
      stops={stops}
      attractions={attractionOptions}
    />
  );
}
