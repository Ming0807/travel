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
import { listAdminAttractions } from "@/lib/repositories/admin-attraction.repository";
import { adminAttractionFiltersSchema } from "@/lib/validation/admin-attraction";
import { AttractionStatusActions } from "@/components/admin/attractions/AttractionStatusActions";

export const metadata: Metadata = {
  title: "Attractions Management | Admin",
};

const columns = [
  { key: "name", label: "ชื่อแหล่งท่องเที่ยว" },
  { key: "province", label: "จังหวัด", className: "hidden md:table-cell" },
  { key: "type", label: "ประเภท", className: "hidden lg:table-cell" },
  { key: "spots", label: "จุดถ่าย", className: "hidden lg:table-cell text-center" },
  { key: "qr", label: "QR", className: "hidden lg:table-cell text-center" },
  { key: "status", label: "สถานะ" },
  { key: "actions", label: "", className: "w-10" },
];

const statusOptions = [
  { value: "true", label: "Published" },
  { value: "false", label: "Draft" },
];

export default async function AdminAttractionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("attraction.read");
  const raw = await searchParams;
  const parsed = adminAttractionFiltersSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 20 };
  const { items, total, page, pageSize } = await listAdminAttractions(filters);

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Content Management"
          title="แหล่งท่องเที่ยว"
          description="จัดการข้อมูลสถานที่ท่องเที่ยวในยะลา ปัตตานี และนราธิวาส"
        />

        <FilterBar>
          <div className="min-w-[220px] flex-1">
            <SearchInput placeholder="ค้นหาชื่อ, slug..." />
          </div>
          <FilterSelect
            label="สถานะ"
            paramKey="isPublished"
            options={statusOptions}
          />
        </FilterBar>

        {items.length === 0 ? (
          <EmptyState
            title="ไม่พบแหล่งท่องเที่ยว"
            description="ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง"
          />
        ) : (
          <>
            <DataTable columns={columns}>
              {items.map((attraction) => (
                <tr key={attraction.attraction_id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-bold text-[#073F37]">{attraction.name_th}</p>
                      {attraction.name_en && (
                        <p className="mt-0.5 text-xs text-slate-500">{attraction.name_en}</p>
                      )}
                      <p className="mt-0.5 text-[11px] text-slate-400">{attraction.slug}</p>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="text-xs font-semibold text-slate-600">
                      {attraction.province_name_th ?? "—"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="text-xs text-slate-500">
                      {attraction.attraction_type_name_th ?? "—"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-center lg:table-cell">
                    <span className="text-xs font-bold text-slate-600">{attraction.photo_spot_count}</span>
                  </td>
                  <td className="hidden px-4 py-3 text-center lg:table-cell">
                    <span className="text-xs font-bold text-slate-600">{attraction.checkin_code_count}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <StatusBadge
                        label={attraction.is_published ? "Published" : "Draft"}
                        tone={attraction.is_published ? "green" : "gray"}
                      />
                      {!attraction.is_active && (
                        <StatusBadge label="Inactive" tone="red" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <AttractionStatusActions
                      attractionId={attraction.attraction_id}
                      isPublished={attraction.is_published}
                      isActive={attraction.is_active}
                    />
                  </td>
                </tr>
              ))}
            </DataTable>
            <Pagination page={page} pageSize={pageSize} total={total} />
          </>
        )}
      </div>
    </AdminShell>
  );
}
