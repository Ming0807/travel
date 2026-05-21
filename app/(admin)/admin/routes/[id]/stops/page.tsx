import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminRouteById, getRouteStops } from "@/lib/repositories/admin-route.repository";
import { listAdminAttractions } from "@/lib/repositories/admin-attraction.repository";
import { notFound } from "next/navigation";
import { RouteStopsManager } from "@/components/admin/routes/RouteStopsManager";

export const metadata: Metadata = {
  title: "Manage Route Stops | Admin",
};

export default async function AdminRouteStopsPage({
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

  const route = await getAdminRouteById(routeId);
  if (!route) {
    notFound();
  }

  const stops = await getRouteStops(routeId);
  
  // Fetch all published/active attractions to be used in the stops selector.
  // In a real app with many attractions, this would be an async search/autocomplete,
  // but for MVP we can fetch all or a large page of them.
  const attractions = await listAdminAttractions({ page: 1, pageSize: 500, isActive: true, isPublished: true });

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Content Management"
          title={`จุดแวะ: ${route.name_th}`}
          description="จัดการสถานที่และจุดแวะในแต่ละวันของเส้นทางนี้"
        />

        <div className="mt-8">
          <RouteStopsManager 
            routeId={routeId} 
            initialStops={stops} 
            attractions={attractions.items} 
          />
        </div>
      </div>
    </AdminShell>
  );
}
