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
import { listAdminAccommodations } from "@/lib/repositories/admin-accommodation.repository";
import { adminAccommodationFiltersSchema } from "@/lib/validation/admin-accommodation";
import { AccommodationStatusActions } from "@/components/admin/accommodations/AccommodationStatusActions";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Accommodations Management | Admin",
};

const columns = [
  { key: "name", label: "ชื่อที่พัก" },
  { key: "province", label: "จังหวัด", className: "hidden md:table-cell" },
  { key: "type", label: "ประเภทที่พัก", className: "hidden lg:table-cell" },
  { key: "price", label: "ระดับราคา", className: "hidden lg:table-cell" },
  { key: "attractions", label: "สถานที่ใกล้เคียง", className: "hidden lg:table-cell text-center" },
  { key: "status", label: "สถานะ" },
  { key: "actions", label: "", className: "w-10" },
];

const statusOptions = [
  { value: "true", label: "Published" },
  { value: "false", label: "Draft" },
];

export default async function AdminAccommodationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("attraction.read");
  const raw = await searchParams;
  const parsed = adminAccommodationFiltersSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 20 };
  const { items, total, page, pageSize } = await listAdminAccommodations(filters);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <AdminPageHeader
            eyebrow="Local Economy"
            title="ที่พัก (Accommodations)"
            description="จัดการข้อมูลที่พัก โรงแรม รีสอร์ท ในยะลา ปัตตานี และนราธิวาส"
          />
          <Link
            href="/admin/accommodations/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#F3704C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E55A35] transition-colors"
          >
            <Plus size={20} weight="bold" />
            เพิ่มที่พักใหม่
          </Link>
        </div>

        <FilterBar>
          <div className="min-w-[220px] flex-1">
            <SearchInput placeholder="ค้นหาชื่อที่พัก, slug..." />
          </div>
          <FilterSelect
            label="สถานะ"
            paramKey="isPublished"
            options={statusOptions}
          />
        </FilterBar>

        {items.length === 0 ? (
          <EmptyState
            title="ไม่พบข้อมูลที่พัก"
            description="ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง"
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <DataTable columns={columns}>
                {items.map((accommodation) => (
                  <tr key={accommodation.accommodation_id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div>
                        <a href={`/admin/accommodations/${accommodation.accommodation_id}/edit`} className="font-bold text-[#073F37] hover:text-[#F3704C] transition-colors">{accommodation.name_th}</a>
                        {accommodation.name_en && (
                          <p className="mt-0.5 text-xs text-slate-500">{accommodation.name_en}</p>
                        )}
                        <p className="mt-0.5 text-[11px] text-slate-400">{accommodation.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-slate-600">
                        {accommodation.province_name_th ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500">
                        {accommodation.accommodation_type ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 font-medium text-emerald-600">
                        {accommodation.price_range ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold text-slate-600">{accommodation.attraction_count}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusBadge
                          label={accommodation.is_published ? "Published" : "Draft"}
                          tone={accommodation.is_published ? "green" : "gray"}
                        />
                        {!accommodation.is_active && (
                          <StatusBadge label="Inactive" tone="red" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <AccommodationStatusActions
                        accommodationId={accommodation.accommodation_id}
                        isPublished={accommodation.is_published}
                        isActive={accommodation.is_active}
                      />
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>

            {/* Mobile Card View */}
            <div className="grid gap-4 md:hidden">
              {items.map((accommodation) => (
                <div
                  key={accommodation.accommodation_id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-[#073F37]">{accommodation.name_th}</h3>
                      {accommodation.name_en && (
                        <p className="mt-0.5 text-xs text-slate-500">{accommodation.name_en}</p>
                      )}
                      <p className="mt-1 text-[11px] text-slate-400">/{accommodation.slug}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge
                        label={accommodation.is_published ? "Published" : "Draft"}
                        tone={accommodation.is_published ? "green" : "gray"}
                      />
                      {!accommodation.is_active && (
                        <StatusBadge label="Inactive" tone="red" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">จังหวัด</p>
                      <p className="font-semibold text-slate-700">{accommodation.province_name_th ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">ประเภท</p>
                      <p className="font-semibold text-slate-700">{accommodation.accommodation_type ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">ระดับราคา</p>
                      <p className="font-semibold text-emerald-600">{accommodation.price_range ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">สถานที่ใกล้เคียง</p>
                      <p className="font-semibold text-slate-700">{accommodation.attraction_count} แห่ง</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-end border-t border-slate-100 pt-4">
                    <AccommodationStatusActions
                      accommodationId={accommodation.accommodation_id}
                      isPublished={accommodation.is_published}
                      isActive={accommodation.is_active}
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
