import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RestaurantCategoryManager } from "@/components/admin/restaurants/categories/RestaurantCategoryManager";
import { requirePermission } from "@/lib/auth/guards";
import { listAdminRestaurantCategories } from "@/lib/repositories/admin-restaurant-category.repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Restaurant Categories | Admin" };

export default async function RestaurantCategoriesPage() {
  await requirePermission("restaurant.read");
  const categories = await listAdminRestaurantCategories();

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Restaurant CMS"
          title="หมวดหมู่ร้านอาหาร"
          description="จัดชื่อ กลุ่มเมนู ลำดับ และหมวดเด่นจากจุดเดียว ร้านอาหารหนึ่งแห่งเลือกได้หลายหมวด"
          actions={(
            <Link href="/admin/restaurants" className="inline-flex min-h-11 items-center gap-2 border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <ArrowLeft size={18} /> กลับไปรายการร้านอาหาร
            </Link>
          )}
        />
        <RestaurantCategoryManager categories={categories} />
      </div>
    </AdminShell>
  );
}
