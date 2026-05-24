import { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminRestaurantById } from "@/lib/repositories/admin-restaurant.repository";
import { listAdminMedia } from "@/lib/repositories/admin-media.repository";
import { notFound } from "next/navigation";
import { MediaManager } from "@/components/admin/attractions/MediaManager";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Restaurant Media | Admin",
};

export default async function AdminRestaurantMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("attraction.update");

  const resolvedParams = await params;
  const restaurantId = parseInt(resolvedParams.id, 10);
  if (isNaN(restaurantId)) {
    notFound();
  }

  const restaurant = await getAdminRestaurantById(restaurantId);
  if (!restaurant) {
    notFound();
  }

  const mediaList = await listAdminMedia({ entityType: 'restaurant', entityId: restaurantId, page: 1, pageSize: 100 });

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <Link href="/admin/restaurants" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-[#0A6B62]">
            <ArrowLeft size={16} /> กลับไปยังหน้ารายการ
          </Link>
          <AdminPageHeader
            eyebrow="Restaurant Media"
            title={`จัดการสื่อ: ${restaurant.name_th}`}
            description="จัดการรูปภาพและแกลอรี่สำหรับร้านอาหารนี้"
          />
        </div>

        <div className="mt-8">
          <MediaManager entityId={restaurantId} entityType="restaurant" initialMedia={mediaList.items} />
        </div>
      </div>
    </AdminShell>
  );
}
