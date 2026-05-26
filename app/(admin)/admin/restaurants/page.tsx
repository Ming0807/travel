export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { requirePermission } from "@/lib/auth/guards";
import { listAdminRestaurants } from "@/lib/repositories/admin-restaurant.repository";
import { adminRestaurantFiltersSchema } from "@/lib/validation/admin-restaurant";
import { RestaurantStatusActions } from "@/components/admin/restaurants/RestaurantStatusActions";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Restaurants Management | Admin",
};

const columns = [
  { key: "name", label: "ชื่อร้านอาหาร" },
  { key: "province", label: "จังหวัด", className: "hidden md:table-cell" },
  { key: "foodType", label: "ประเภทอาหาร", className: "hidden lg:table-cell" },
  { key: "attractions", label: "สถานที่ใกล้เคียง", className: "hidden lg:table-cell text-center" },
  { key: "status", label: "สถานะ" },
  { key: "actions", label: "", className: "w-10" },
];

const statusOptions = [
  { value: "true", label: "Published" },
  { value: "false", label: "Draft" },
];

export default async function AdminRestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("restaurant.read");
  const raw = await searchParams;
  const parsed = adminRestaurantFiltersSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 20 };
  const { items, total, page, pageSize } = await listAdminRestaurants(filters);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <AdminPageHeader
            eyebrow="Local Economy"
            title="ร้านอาหาร"
            description="จัดการข้อมูลร้านอาหารและธุรกิจชุมชนในยะลา ปัตตานี และนราธิวาส"
          />
          <Link
            href="/admin/restaurants/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#F3704C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E55A35] transition-colors"
          >
            <Plus size={20} weight="bold" />
            เพิ่มร้านอาหารใหม่
          </Link>
        </div>

        <FilterBar>
          <div className="min-w-[220px] flex-1">
            <SearchInput placeholder="ค้นหาชื่อร้าน, slug..." />
          </div>
          <FilterSelect
            label="สถานะ"
            paramKey="isPublished"
            options={statusOptions}
          />
        </FilterBar>

        {items.length === 0 ? (
          <EmptyState
            title="ไม่พบร้านอาหาร"
            description="ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง"
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <DataTable columns={columns}>
                {items.map((restaurant) => (
                  <tr key={restaurant.restaurant_id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div>
                        <a href={`/admin/restaurants/${restaurant.restaurant_id}/edit`} className="font-bold text-[#073F37] hover:text-[#F3704C] transition-colors">{restaurant.name_th}</a>
                        {restaurant.name_en && (
                          <p className="mt-0.5 text-xs text-slate-500">{restaurant.name_en}</p>
                        )}
                        <p className="mt-0.5 text-[11px] text-slate-400">{restaurant.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-slate-600">
                        {restaurant.province_name_th ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500">
                        {restaurant.food_type ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold text-slate-600">{restaurant.attraction_count}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusBadge
                          label={restaurant.is_published ? "Published" : "Draft"}
                          tone={restaurant.is_published ? "green" : "gray"}
                        />
                        {!restaurant.is_active && (
                          <StatusBadge label="Inactive" tone="red" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RestaurantStatusActions
                        restaurantId={restaurant.restaurant_id}
                        isPublished={restaurant.is_published}
                        isActive={restaurant.is_active}
                      />
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>

            {/* Mobile Card View */}
            <div className="grid gap-4 md:hidden">
              {items.map((restaurant) => (
                <div
                  key={restaurant.restaurant_id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-[#073F37]">{restaurant.name_th}</h3>
                      {restaurant.name_en && (
                        <p className="mt-0.5 text-xs text-slate-500">{restaurant.name_en}</p>
                      )}
                      <p className="mt-1 text-[11px] text-slate-400">/{restaurant.slug}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge
                        label={restaurant.is_published ? "Published" : "Draft"}
                        tone={restaurant.is_published ? "green" : "gray"}
                      />
                      {!restaurant.is_active && (
                        <StatusBadge label="Inactive" tone="red" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">จังหวัด</p>
                      <p className="font-semibold text-slate-700">{restaurant.province_name_th ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">ประเภทอาหาร</p>
                      <p className="font-semibold text-slate-700">{restaurant.food_type ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">สถานที่ใกล้เคียง</p>
                      <p className="font-semibold text-slate-700">{restaurant.attraction_count} แห่ง</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-end border-t border-slate-100 pt-4">
                    <RestaurantStatusActions
                      restaurantId={restaurant.restaurant_id}
                      isPublished={restaurant.is_published}
                      isActive={restaurant.is_active}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Pagination page={page} pageSize={pageSize} total={total} />
          </>
        )}
      </div>
    </AdminShell>
  );
}
