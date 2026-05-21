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
import { listAdminRoutes } from "@/lib/repositories/admin-route.repository";
import { adminRouteFiltersSchema } from "@/lib/validation/route";
import { RouteStatusActions } from "@/components/admin/routes/RouteStatusActions";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";

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
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AdminPageHeader
            eyebrow="Content Management"
            title="เส้นทางแนะนำ"
            description="จัดการข้อมูลเส้นทางท่องเที่ยวแนะนำ (Suggested Routes)"
          />
          <Link
            href="/admin/routes/new"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#0A6B62] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#075049] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
          >
            <Plus size={16} weight="bold" />
            เพิ่มเส้นทางใหม่
          </Link>
        </div>

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

        {items.length === 0 ? (
          <EmptyState
            title="ไม่พบเส้นทางแนะนำ"
            description="ลองเปลี่ยนเงื่อนไขการค้นหา หรือเพิ่มเส้นทางใหม่"
            actionLabel="เพิ่มเส้นทาง"
            actionHref="/admin/routes/new"
          />
        ) : (
          <>
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
            <Pagination page={page} pageSize={pageSize} total={total} />
          </>
        )}
      </div>
    </AdminShell>
  );
}
