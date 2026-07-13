export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SearchInput } from "@/components/admin/SearchInput";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { listAdminPhotoSpots } from "@/lib/repositories/photo-spot.repository";
import { adminPhotoSpotFiltersSchema } from "@/lib/validation/photo-spot";
import { PhotoSpotStatusAction } from "@/components/admin/photo-spots/PhotoSpotStatusAction";
import { ExportButton } from "@/components/admin/ExportButton";
import Link from "next/link";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { getAdminAttractionsList } from "@/lib/repositories/admin-attraction.repository";

export const metadata: Metadata = {
  title: "Photo Spots Management | Admin",
};

const columns = [
  { key: "name", label: "ชื่อจุดถ่ายภาพ" },
  { key: "attraction", label: "แหล่งท่องเที่ยว", className: "hidden md:table-cell" },
  { key: "order", label: "ลำดับ", className: "hidden lg:table-cell text-center" },
  { key: "coords", label: "พิกัด", className: "hidden lg:table-cell" },
  { key: "status", label: "สถานะ" },
  { key: "actions", label: "", className: "w-10" },
];

export default async function AdminPhotoSpotsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const guard = await requirePermission("photo_spot.read");
  const raw = await searchParams;
  const parsed = adminPhotoSpotFiltersSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 20 };
  const [{ items, total, page, pageSize }, attractions] = await Promise.all([
    listAdminPhotoSpots(filters),
    getAdminAttractionsList(),
  ]);
  const canCreate = hasPermission(guard.actor, "photo_spot.create");
  const canEdit = hasPermission(guard.actor, "photo_spot.update");
  const canToggle = hasPermission(guard.actor, "photo_spot.deactivate");
  const canExport = hasPermission(guard.actor, "export.photo_spots");

  return (
    <ListPageShell
      eyebrow="Content Management"
      title="จุดถ่ายภาพ"
      description="จัดการจุดถ่ายภาพในแต่ละแหล่งท่องเที่ยว"
      createHref="/admin/photo-spots/new"
      createLabel="เพิ่มจุดถ่ายภาพ"
      hideCreateButton={!canCreate}
      headerActions={canExport ? <ExportButton endpoint="/api/admin/export/photo-spots" label="ส่งออก" /> : null}
      total={total}
      page={page}
      pageSize={pageSize}
      emptyTitle="ไม่พบจุดถ่ายภาพ"
      emptyDescription="ลองเปลี่ยนเงื่อนไขการค้นหา หรือเพิ่มจุดถ่ายภาพใหม่ก่อนเชื่อมกับรหัส Check-in"
      filters={
        <FilterBar>
          <div className="w-full sm:min-w-[220px] sm:flex-1">
            <SearchInput placeholder="ค้นหาชื่อจุดถ่ายภาพ..." />
          </div>
          <FilterSelect
            label="สถานที่"
            paramKey="attractionId"
            allLabel="ทุกสถานที่"
            options={attractions.map((attraction) => ({
              value: attraction.attraction_id.toString(),
              label: attraction.name_th,
            }))}
          />
          <FilterSelect
            label="สถานะ"
            paramKey="isActive"
            allLabel="ทุกสถานะ"
            options={[
              { value: "true", label: "เปิดใช้งาน" },
              { value: "false", label: "ปิดใช้งาน" },
            ]}
          />
        </FilterBar>
      }
    >
      {/* Desktop Table View */}
      <div className="hidden md:block">
              <DataTable columns={columns}>
                {items.map((spot) => (
                  <tr key={spot.photo_spot_id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#073F37]">{spot.spot_name_th}</p>
                      {spot.spot_name_en && (
                        <p className="mt-0.5 text-xs text-slate-500">{spot.spot_name_en}</p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="text-xs font-semibold text-slate-600">
                        {spot.attraction_name_th ?? "—"}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-center lg:table-cell">
                      <span className="text-xs text-slate-500">{spot.display_order ?? "—"}</span>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {spot.latitude && spot.longitude ? (
                        <span className="text-[11px] text-slate-400">
                          {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={spot.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        tone={spot.is_active ? "green" : "red"}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {canEdit ? (
                          <Link
                            href={`/admin/photo-spots/${spot.photo_spot_id}/edit`}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            aria-label={`แก้ไข ${spot.spot_name_th}`}
                            title="แก้ไข"
                          >
                            <PencilSimple size={20} />
                          </Link>
                        ) : null}
                        {canToggle ? (
                          <PhotoSpotStatusAction
                            photoSpotId={spot.photo_spot_id}
                            isActive={spot.is_active}
                          />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>

            {/* Mobile Card View */}
            <div className="grid gap-4 md:hidden">
              {items.map((spot) => (
                <div
                  key={spot.photo_spot_id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-[#073F37]">{spot.spot_name_th}</h3>
                      {spot.spot_name_en && (
                        <p className="mt-0.5 text-xs text-slate-500">{spot.spot_name_en}</p>
                      )}
                    </div>
                    <StatusBadge
                      label={spot.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      tone={spot.is_active ? "green" : "red"}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">แหล่งท่องเที่ยว</p>
                      <p className="font-semibold text-slate-700">{spot.attraction_name_th ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">ลำดับ</p>
                      <p className="font-semibold text-slate-700">{spot.display_order ?? "—"}</p>
                    </div>
                    {spot.latitude && spot.longitude && (
                      <div className="col-span-2">
                        <p className="text-xs text-slate-400">พิกัด</p>
                        <p className="font-mono text-xs text-slate-500">
                          {spot.latitude.toFixed(4)}, {spot.longitude.toFixed(4)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                    {canEdit ? (
                      <Link
                        href={`/admin/photo-spots/${spot.photo_spot_id}/edit`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        aria-label={`แก้ไข ${spot.spot_name_th}`}
                      >
                        <PencilSimple size={20} />
                      </Link>
                    ) : null}
                    {canToggle ? (
                      <PhotoSpotStatusAction
                        photoSpotId={spot.photo_spot_id}
                        isActive={spot.is_active}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

    </ListPageShell>
  );
}
