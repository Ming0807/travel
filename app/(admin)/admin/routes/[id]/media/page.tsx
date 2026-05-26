import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminRouteById } from "@/lib/repositories/admin-route.repository";
import { listAdminMedia } from "@/lib/repositories/admin-media.repository";
import { notFound } from "next/navigation";
import { MediaManager } from "@/components/admin/attractions/MediaManager";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Route Media | Admin",
};

export default async function AdminRouteMediaPage({
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

  const mediaList = await listAdminMedia({ entityType: 'route', entityId: routeId, page: 1, pageSize: 100 });

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <Link href="/admin/routes" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#0A6B62]">
            <ArrowLeft size={16} /> กลับไปยังหน้ารายการ
          </Link>
          <AdminPageHeader
            eyebrow="Route Media"
            title={`จัดการสื่อ: ${route.name_th}`}
            description="จัดการรูปภาพและแกลอรี่สำหรับเส้นทางนี้"
          />
        </div>

        <div className="mt-8">
          <MediaManager entityId={routeId} entityType="route" initialMedia={mediaList.items} />
        </div>
      </div>
    </AdminShell>
  );
}
