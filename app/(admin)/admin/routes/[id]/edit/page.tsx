import { Metadata } from "next";
import { RouteVisualEditor } from "@/components/admin/routes/visual-editor/RouteVisualEditor";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminRouteById, getRouteStops } from "@/lib/repositories/admin-route.repository";
import { getAdminAttractionsList } from "@/lib/repositories/admin-attraction.repository";
import { getCoverMediaForEntity } from "@/lib/repositories/admin-media.repository";
import { notFound } from "next/navigation";

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
  const routeId = parseInt(resolvedParams.id, 10);
  if (isNaN(routeId)) {
    notFound();
  }

  const [route, coverMedia, stops, attractions] = await Promise.all([
    getAdminRouteById(routeId),
    getCoverMediaForEntity("route", routeId),
    getRouteStops(routeId),
    getAdminAttractionsList(),
  ]);
  if (!route) {
    notFound();
  }

  return (
    <RouteVisualEditor
      route={route}
      coverMediaId={coverMedia?.media_id ?? null}
      coverMediaUrl={coverMedia?.storage_path ? (coverMedia.storage_path.startsWith('cloudinary:') ? `/api/media/image?path=${encodeURIComponent(coverMedia.storage_path)}` : `/site-media/${coverMedia.storage_path}`) : null}
      stops={stops}
      attractions={attractions}
    />
  );
}
