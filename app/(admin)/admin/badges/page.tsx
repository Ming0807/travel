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
import { listAdminBadges } from "@/lib/repositories/admin-badge.repository";
import { adminBadgeFiltersSchema } from "@/lib/validation/admin-badge";
import { toggleBadgeActiveAction } from "@/app/actions/admin-badge-actions";
import Link from "next/link";
import { Plus, PencilSimple } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Badges Management | Admin",
};

const CATEGORY_LABELS: Record<string, string> = {
  exploration: "สำรวจ",
  engagement: "มีส่วนร่วม",
  milestone: "ความสำเร็จ",
  social: "สังคม",
};

const CATEGORY_COLORS: Record<string, string> = {
  exploration: "bg-blue-100 text-blue-700",
  engagement: "bg-orange-100 text-orange-700",
  milestone: "bg-purple-100 text-purple-700",
  social: "bg-rose-100 text-rose-700",
};

const columns = [
  { key: "name", label: "Badge" },
  { key: "badgeKey", label: "Key", className: "hidden lg:table-cell" },
  { key: "category", label: "หมวดหมู่", className: "hidden md:table-cell" },
  { key: "requirement", label: "เงื่อนไข", className: "hidden lg:table-cell" },
  { key: "status", label: "สถานะ" },
  { key: "actions", label: "", className: "w-10" },
];

const categoryOptions = [
  { value: "exploration", label: "Exploration" },
  { value: "engagement", label: "Engagement" },
  { value: "milestone", label: "Milestone" },
  { value: "social", label: "Social" },
];

const activeOptions = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default async function AdminBadgesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("badge.read");
  const raw = await searchParams;
  const parsed = adminBadgeFiltersSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 20 };
  const { items, total, page, pageSize } = await listAdminBadges(filters);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <AdminPageHeader
            eyebrow="Gamification"
            title="Badges"
            description="จัดการเหรียญตราและเงื่อนไขการปลดล็อคสำหรับนักท่องเที่ยว"
          />
          <Link
            href="/admin/badges/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[#F3704C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E55A35] transition-colors"
          >
            <Plus size={20} weight="bold" />
            เพิ่ม Badge ใหม่
          </Link>
        </div>

        <FilterBar>
          <div className="min-w-[220px] flex-1">
            <SearchInput placeholder="ค้นหาชื่อ badge, key..." />
          </div>
          <FilterSelect label="หมวดหมู่" paramKey="category" options={categoryOptions} />
          <FilterSelect label="สถานะ" paramKey="isActive" options={activeOptions} />
        </FilterBar>

        {items.length === 0 ? (
          <EmptyState title="ไม่พบ Badge" description="ลองเปลี่ยนเงื่อนไขการค้นหาหรือตัวกรอง" />
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block">
              <DataTable columns={columns}>
                {items.map((badge) => (
                  <tr key={badge.badgeId} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white text-lg"
                          style={{ backgroundColor: badge.iconColor }}
                        >
                          {badge.iconName?.[0] ?? "B"}
                        </div>
                        <div>
                          <Link
                            href={`/admin/badges/${badge.badgeId}`}
                            className="font-bold text-[#073F37] hover:text-[#F3704C] transition-colors"
                          >
                            {badge.nameTh}
                          </Link>
                          <p className="mt-0.5 text-xs text-slate-500">{badge.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono text-slate-600">
                        {badge.badgeKey}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${CATEGORY_COLORS[badge.category] ?? "bg-slate-100 text-slate-700"}`}
                      >
                        {CATEGORY_LABELS[badge.category] ?? badge.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600">
                        {badge.requirementValue}x {badge.requirementType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={badge.isActive ? "Active" : "Inactive"}
                        tone={badge.isActive ? "green" : "gray"}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/badges/${badge.badgeId}`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[#F3704C] transition"
                        >
                          <PencilSimple size={16} />
                        </Link>
                        <form action={toggleBadgeActiveAction}>
                          <input type="hidden" name="badgeId" value={badge.badgeId} />
                          <button
                            type="submit"
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-amber-600 transition"
                            title={badge.isActive ? "Deactivate" : "Activate"}
                          >
                            {badge.isActive ? "🔴" : "🟢"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>

            {/* Mobile */}
            <div className="grid gap-4 md:hidden">
              {items.map((badge) => (
                <div
                  key={badge.badgeId}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white text-lg"
                        style={{ backgroundColor: badge.iconColor }}
                      >
                        {badge.iconName?.[0] ?? "B"}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#073F37]">{badge.nameTh}</h3>
                        <p className="text-xs text-slate-500">{badge.nameEn}</p>
                      </div>
                    </div>
                    <StatusBadge
                      label={badge.isActive ? "Active" : "Inactive"}
                      tone={badge.isActive ? "green" : "gray"}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span
                      className={`rounded-full px-2.5 py-1 font-bold ${CATEGORY_COLORS[badge.category] ?? "bg-slate-100 text-slate-700"}`}
                    >
                      {CATEGORY_LABELS[badge.category] ?? badge.category}
                    </span>
                    <code className="rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-600">
                      {badge.badgeKey}
                    </code>
                    <span className="py-1 text-slate-500">
                      {badge.requirementValue} {badge.requirementType}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                    <Link
                      href={`/admin/badges/${badge.badgeId}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-[#F3704C] transition"
                    >
                      <PencilSimple size={16} />
                    </Link>
                    <form action={toggleBadgeActiveAction}>
                      <input type="hidden" name="badgeId" value={badge.badgeId} />
                      <button
                        type="submit"
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-amber-600 transition"
                      >
                        {badge.isActive ? "🔴" : "🟢"}
                      </button>
                    </form>
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
