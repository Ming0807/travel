export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SearchInput } from "@/components/admin/SearchInput";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminAttractionTypes, getAdminProvinces, listAdminAttractions } from "@/lib/repositories/admin-attraction.repository";
import { adminAttractionFiltersSchema } from "@/lib/validation/admin-attraction";
import { AttractionStatusActions } from "@/components/admin/attractions/AttractionStatusActions";
import { ExportButton } from "@/components/admin/ExportButton";

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
  const [attractionsResult, provinces, attractionTypes] = await Promise.all([
    listAdminAttractions(filters),
    getAdminProvinces(),
    getAdminAttractionTypes(),
  ]);
  const { items, total, page, pageSize } = attractionsResult;

  return (
    <ListPageShell
      eyebrow="Content Management"
      title="แหล่งท่องเที่ยว"
      description="จัดการข้อมูลสถานที่ท่องเที่ยวในยะลา ปัตตานี และนราธิวาส"
      createHref="/admin/attractions/new"
      createLabel="เพิ่มสถานที่ใหม่"
      headerActions={<ExportButton endpoint="/api/admin/export/attractions" label="Export CSV" />}
      emptyTitle="ไม่พบแหล่งท่องเที่ยว"
      emptyDescription="ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง"
      total={total}
      page={page}
      pageSize={pageSize}
      filters={
        <FilterBar>
          <div className="min-w-[220px] flex-1">
            <SearchInput placeholder="ค้นหาชื่อ, slug..." />
          </div>
          <FilterSelect
            label="สถานะ"
            paramKey="isPublished"
            options={statusOptions}
          />
          <FilterSelect
            label="จังหวัด"
            paramKey="provinceId"
            options={provinces.map((province) => ({
              value: String(province.province_id),
              label: province.province_name_th,
            }))}
          />
          <FilterSelect
            label="ประเภท"
            paramKey="attractionTypeId"
            options={attractionTypes.map((type) => ({
              value: String(type.attraction_type_id),
              label: type.type_name_th,
            }))}
          />
        </FilterBar>
      }
    >
      {/* Desktop Table View */}
      <div className="hidden md:block">
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
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-slate-600">
                        {attraction.province_name_th ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div title={attraction.attraction_type_names_th.join(", ")}>
                        <span className="text-xs font-semibold text-slate-700">
                          {attraction.attraction_type_name_th ?? "—"}
                        </span>
                        {attraction.attraction_type_names_th.length > 1 ? (
                          <span className="ml-1 text-xs text-slate-500">
                            +{attraction.attraction_type_names_th.length - 1} หมวด
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold text-slate-600">{attraction.photo_spot_count}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
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
            </div>

            {/* Mobile Card View */}
            <div className="grid gap-4 md:hidden">
              {items.map((attraction) => (
                <div
                  key={attraction.attraction_id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-[#073F37]">{attraction.name_th}</h3>
                      {attraction.name_en && (
                        <p className="mt-0.5 text-xs text-slate-500">{attraction.name_en}</p>
                      )}
                      <p className="mt-1 text-[11px] text-slate-400">/{attraction.slug}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge
                        label={attraction.is_published ? "Published" : "Draft"}
                        tone={attraction.is_published ? "green" : "gray"}
                      />
                      {!attraction.is_active && (
                        <StatusBadge label="Inactive" tone="red" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">จังหวัด</p>
                      <p className="font-semibold text-slate-700">{attraction.province_name_th ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">ประเภท</p>
                      <p className="font-semibold text-slate-700">
                        {attraction.attraction_type_name_th ?? "—"}
                        {attraction.attraction_type_names_th.length > 1
                          ? ` +${attraction.attraction_type_names_th.length - 1} หมวด`
                          : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">จุดถ่ายรูป</p>
                      <p className="font-semibold text-slate-700">{attraction.photo_spot_count} จุด</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">QR Codes</p>
                      <p className="font-semibold text-slate-700">{attraction.checkin_code_count} โค้ด</p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-end border-t border-slate-100 pt-4">
                    <AttractionStatusActions
                      attractionId={attraction.attraction_id}
                      isPublished={attraction.is_published}
                      isActive={attraction.is_active}
                    />
                  </div>
                </div>
              ))}
            </div>

    </ListPageShell>
  );
}
