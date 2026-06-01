export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SearchInput } from "@/components/admin/SearchInput";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { requirePermission } from "@/lib/auth/guards";
import { listAdminRoutes } from "@/lib/repositories/admin-route.repository";
import { adminRouteFiltersSchema } from "@/lib/validation/route";
import { RouteStatusActions } from "@/components/admin/routes/RouteStatusActions";
import { ExportButton } from "@/components/admin/ExportButton";

export const metadata: Metadata = {
  title: "Suggested Routes Management | Admin",
};

const columns = [
  { key: "name", label: "ชื่อเส้นทาง" },
  { key: "stops", label: "จำนวนจุดแวะ", className: "hidden md:table-cell text-center" },
  { key: "status", label: "สถานะ" },
  { key: "actions", label: "", className: "w-32" },
];

const statusOptions = [
  { value: "true", label: "Published" },
  { value: "false", label: "Draft" },
];

export default async function AdminRoutesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("route.read");
  const raw = await searchParams;
  const parsed = adminRouteFiltersSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 20 };
  const { items, total, page, pageSize } = await listAdminRoutes(filters);

  return (
    <ListPageShell
      eyebrow="Content Management"
      title="เส้นทางแนะนำ"
      description="จัดการข้อมูลเส้นทางท่องเที่ยวแนะนำ (Suggested Routes)"
      createHref="/admin/routes/new"
      createLabel="เพิ่มเส้นทางใหม่"
      headerActions={<ExportButton endpoint="/api/admin/export/routes" label="Export CSV" />}
      total={total}
      page={page}
      pageSize={pageSize}
      emptyTitle="ไม่พบเส้นทางแนะนำ"
      emptyDescription="ลองเปลี่ยนเงื่อนไขการค้นหา หรือเพิ่มเส้นทางใหม่"
      filters={
        <FilterBar>
          <div className="min-w-[220px] flex-1">
            <SearchInput placeholder="ค้นหาชื่อเส้นทาง..." />
          </div>
          <FilterSelect
            label="สถานะ"
            paramKey="isPublished"
            options={statusOptions}
          />
        </FilterBar>
      }
    >
      {/* Desktop Table View */}
      <div className="hidden md:block">
              <DataTable columns={columns}>
                {items.map((route) => (
                  <tr key={route.route_id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-[#073F37]">{route.name_th}</p>
                        {route.name_en && (
                          <p className="mt-0.5 text-xs text-slate-500">{route.name_en}</p>
                        )}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-center md:table-cell">
                      <span className="text-xs font-bold text-slate-600">{route.stop_count}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <StatusBadge
                          label={route.is_published ? "Published" : "Draft"}
                          tone={route.is_published ? "green" : "gray"}
                        />
                        {!route.is_active && (
                          <StatusBadge label="Inactive" tone="red" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RouteStatusActions
                        routeId={route.route_id}
                        isPublished={route.is_published}
                        isActive={route.is_active}
                      />
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>

            {/* Mobile Card View */}
            <div className="grid gap-4 md:hidden">
              {items.map((route) => (
                <div
                  key={route.route_id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-[#073F37]">{route.name_th}</h3>
                      {route.name_en && (
                        <p className="mt-0.5 text-xs text-slate-500">{route.name_en}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge
                        label={route.is_published ? "Published" : "Draft"}
                        tone={route.is_published ? "green" : "gray"}
                      />
                      {!route.is_active && (
                        <StatusBadge label="Inactive" tone="red" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">จำนวนจุดแวะ</p>
                      <p className="font-semibold text-slate-700">{route.stop_count} จุด</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end border-t border-slate-100 pt-4">
                    <RouteStatusActions
                      routeId={route.route_id}
                      isPublished={route.is_published}
                      isActive={route.is_active}
                    />
                  </div>
                </div>
              ))}
            </div>

    </ListPageShell>
  );
}
