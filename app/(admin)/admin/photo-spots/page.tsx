export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/admin/EmptyState";
import { Pagination } from "@/components/admin/Pagination";
import { SearchInput } from "@/components/admin/SearchInput";
import { FilterBar } from "@/components/admin/FilterBar";
import { requirePermission } from "@/lib/auth/guards";
import { listAdminPhotoSpots } from "@/lib/repositories/photo-spot.repository";
import { adminPhotoSpotFiltersSchema } from "@/lib/validation/photo-spot";
import { PhotoSpotStatusAction } from "@/components/admin/photo-spots/PhotoSpotStatusAction";

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
  await requirePermission("photo_spot.read");
  const raw = await searchParams;
  const parsed = adminPhotoSpotFiltersSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 20 };
  const { items, total, page, pageSize } = await listAdminPhotoSpots(filters);

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Content Management"
          title="จุดถ่ายภาพ"
          description="จัดการจุดถ่ายภาพในแต่ละแหล่งท่องเที่ยว"
        />

        <FilterBar>
          <div className="min-w-[220px] flex-1">
            <SearchInput placeholder="ค้นหาชื่อจุดถ่ายภาพ..." />
          </div>
        </FilterBar>

        {items.length === 0 ? (
          <EmptyState
            title="ไม่พบจุดถ่ายภาพ"
            description="ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง"
          />
        ) : (
          <>
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
                      label={spot.is_active ? "Active" : "Inactive"}
                      tone={spot.is_active ? "green" : "red"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <PhotoSpotStatusAction
                      photoSpotId={spot.photo_spot_id}
                      isActive={spot.is_active}
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
