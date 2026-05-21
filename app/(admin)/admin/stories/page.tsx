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
import { listAdminStories } from "@/lib/repositories/admin-story.repository";
import { adminStoryFiltersSchema } from "@/lib/validation/story";
import { StoryStatusActions } from "@/components/admin/stories/StoryStatusActions";
import Link from "next/link";
import { Plus } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Travel Stories Management | Admin",
};

const columns = [
  { key: "title", label: "ชื่อบทความ" },
  { key: "category", label: "หมวดหมู่", className: "hidden md:table-cell" },
  { key: "province", label: "จังหวัด", className: "hidden lg:table-cell" },
  { key: "status", label: "สถานะ" },
  { key: "actions", label: "", className: "w-20" },
];

const statusOptions = [
  { value: "true", label: "Published" },
  { value: "false", label: "Draft" },
];

export default async function AdminStoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("story.read");
  const raw = await searchParams;
  const parsed = adminStoryFiltersSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 20 };
  const { items, total, page, pageSize } = await listAdminStories(filters);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AdminPageHeader
            eyebrow="Content Management"
            title="บทความท่องเที่ยว"
            description="จัดการบทความและเรื่องราวเกี่ยวกับสถานที่ท่องเที่ยว"
          />
          <Link
            href="/admin/stories/new"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#0A6B62] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#075049] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
          >
            <Plus size={16} weight="bold" />
            เพิ่มบทความ
          </Link>
        </div>

        <FilterBar>
          <div className="min-w-[220px] flex-1">
            <SearchInput placeholder="ค้นหาชื่อบทความ, slug..." />
          </div>
          <FilterSelect
            label="สถานะ"
            paramKey="isPublished"
            options={statusOptions}
          />
        </FilterBar>

        {items.length === 0 ? (
          <EmptyState
            title="ไม่พบบทความ"
            description="ลองเปลี่ยนเงื่อนไขการค้นหา หรือเพิ่มบทความใหม่"
            action={
              <Link
                href="/admin/stories/new"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0A6B62] px-4 py-2 text-sm font-semibold text-white hover:bg-[#075049]"
              >
                <Plus size={16} weight="bold" />
                เพิ่มบทความ
              </Link>
            }
          />
        ) : (
          <>
            <DataTable columns={columns}>
              {items.map((story) => (
                <tr key={story.story_id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-bold text-[#073F37]">{story.title}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{story.slug}</p>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="text-xs text-slate-500">
                      {story.category ?? "—"}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="text-xs font-semibold text-slate-600">
                      {story.province_name_th ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={story.is_published ? "Published" : "Draft"}
                      tone={story.is_published ? "green" : "gray"}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <StoryStatusActions
                      storyId={story.story_id}
                      isPublished={story.is_published}
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
