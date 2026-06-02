export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SearchInput } from "@/components/admin/SearchInput";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { requirePermission } from "@/lib/auth/guards";
import { listAdminStories } from "@/lib/repositories/admin-story.repository";
import { adminStoryFiltersSchema } from "@/lib/validation/story";
import { StoryStatusActions } from "@/components/admin/stories/StoryStatusActions";
import { ExportButton } from "@/components/admin/ExportButton";

export const metadata: Metadata = {
  title: "Travel Stories Management | Admin",
};

const columns = [
  { key: "title", label: "ชื่อบทความ" },
  { key: "author", label: "ผู้เขียน", className: "hidden md:table-cell" },
  { key: "category", label: "หมวดหมู่", className: "hidden md:table-cell" },
  { key: "province", label: "จังหวัด", className: "hidden lg:table-cell" },
  { key: "status", label: "สถานะ" },
  { key: "actions", label: "", className: "w-20" },
];

const statusOptions = [
  { value: "published", label: "Published" },
  { value: "pending", label: "Pending Review" },
  { value: "draft", label: "Draft" },
  { value: "rejected", label: "Rejected" },
];

function getTone(status: string): import("@/components/admin/StatusBadge").StatusBadgeTone {
  switch(status) {
    case 'published': return 'green';
    case 'pending': return 'gold';
    case 'rejected': return 'red';
    default: return 'gray';
  }
}

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
    <ListPageShell
      eyebrow="Content Management"
      title="บทความท่องเที่ยว"
      description="จัดการบทความและเรื่องราวเกี่ยวกับสถานที่ท่องเที่ยว"
      createHref="/admin/stories/new"
      createLabel="เพิ่มบทความ"
      headerActions={<ExportButton endpoint="/api/admin/export/stories" label="Export CSV" />}
      total={total}
      page={page}
      pageSize={pageSize}
      emptyTitle="ไม่พบบทความ"
      emptyDescription="ลองเปลี่ยนเงื่อนไขการค้นหา หรือเพิ่มบทความใหม่"
      filters={
        <FilterBar>
          <div className="min-w-[220px] flex-1">
            <SearchInput placeholder="ค้นหาชื่อบทความ, slug..." />
          </div>
          <FilterSelect
            label="สถานะ"
            paramKey="status"
            options={statusOptions}
          />
        </FilterBar>
      }
    >
      {/* Desktop Table View */}
      <div className="hidden md:block">
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
                      {story.author_type === 'tourist' ? (
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{story.tourist_name ?? 'Unknown Tourist'}</p>
                          <p className="text-[10px] text-slate-400">Tourist UGC</p>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">Admin</span>
                      )}
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
                        label={story.status}
                        tone={getTone(story.status)}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <StoryStatusActions
                        storyId={story.story_id}
                        status={story.status}
                      />
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>

            {/* Mobile Card View */}
            <div className="grid gap-4 md:hidden">
              {items.map((story) => (
                <div
                  key={story.story_id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-[#073F37]">{story.title}</h3>
                      <p className="mt-0.5 text-[11px] text-slate-400">{story.slug}</p>
                    </div>
                    <StatusBadge
                      label={story.status}
                      tone={getTone(story.status)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400">หมวดหมู่</p>
                      <p className="font-semibold text-slate-700">{story.category ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">จังหวัด</p>
                      <p className="font-semibold text-slate-700">{story.province_name_th ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">ผู้เขียน</p>
                      <p className="font-semibold text-slate-700">
                        {story.author_type === 'tourist' ? (story.tourist_name ?? 'Tourist') : 'Admin'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end border-t border-slate-100 pt-4">
                    <StoryStatusActions
                      storyId={story.story_id}
                      status={story.status}
                    />
                  </div>
                </div>
              ))}
            </div>

    </ListPageShell>
  );
}
