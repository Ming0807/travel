import Link from "next/link";
import { Article, ChatCircleText } from "@phosphor-icons/react/dist/ssr";
import { DataTable } from "@/components/admin/DataTable";
import { ExportButton } from "@/components/admin/ExportButton";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StoryStatusActions } from "@/components/admin/stories/StoryStatusActions";
import { StoryDateFilter } from "@/components/admin/stories/library/StoryDateFilter";
import {
  getStoryReadinessPresentation,
  getStoryStatusPresentation,
  type StoryLibraryMode,
} from "@/lib/content/story-library";
import {
  getStoryLibrarySummary,
  listAdminStories,
  type StoryLibrarySummary,
} from "@/lib/repositories/admin-story.repository";
import {
  listStoryProvinceOptions,
  listStoryTopics,
} from "@/lib/repositories/story-taxonomy.repository";
import { adminStoryFiltersSchema } from "@/lib/validation/story";

const editorialStatuses = [
  { value: "draft", label: "ฉบับร่าง" },
  { value: "in_review", label: "กำลังตรวจ" },
  { value: "approved", label: "อนุมัติแล้ว" },
  { value: "scheduled", label: "ตั้งเวลาแล้ว" },
  { value: "published", label: "เผยแพร่แล้ว" },
  { value: "archived", label: "เก็บถาวร" },
];

const submissionStatuses = [
  { value: "submitted", label: "รอตรวจ" },
  { value: "in_review", label: "กำลังตรวจ" },
  { value: "changes_requested", label: "ขอข้อมูลเพิ่ม" },
  { value: "approved", label: "อนุมัติแล้ว" },
  { value: "published", label: "เผยแพร่แล้ว" },
  { value: "rejected", label: "ไม่อนุมัติ" },
  { value: "archived", label: "เก็บถาวร" },
];

function formatAdminDate(value: string | null): string {
  if (!value) return "ยังไม่มีข้อมูล";
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function summaryItems(mode: StoryLibraryMode, summary: StoryLibrarySummary) {
  return mode === "editorial"
    ? [
        { label: "บทความทั้งหมด", value: summary.total },
        { label: "รอตรวจเนื้อหา", value: summary.awaitingReview },
        { label: "ตั้งเวลาแล้ว", value: summary.scheduled },
        { label: "เผยแพร่แล้ว", value: summary.published },
      ]
    : [
        { label: "เรื่องเล่าทั้งหมด", value: summary.total },
        { label: "รอเริ่มตรวจ", value: summary.awaitingReview },
        { label: "กำลังตรวจ", value: summary.inReview },
        { label: "อนุมัติแล้ว", value: summary.approved },
      ];
}

export async function StoryLibraryPage({
  mode,
  rawSearchParams,
}: {
  mode: StoryLibraryMode;
  rawSearchParams: Record<string, string | string[] | undefined>;
}) {
  const parsed = adminStoryFiltersSchema.safeParse(rawSearchParams);
  const baseFilters = parsed.success ? parsed.data : { page: 1, pageSize: 20 };
  const authorType = mode === "editorial" ? "admin" : "tourist";
  const filters = { ...baseFilters, authorType } as const;
  const [{ items, total, page, pageSize }, summary, topics, provinces] = await Promise.all([
    listAdminStories(filters),
    getStoryLibrarySummary(authorType),
    listStoryTopics(),
    listStoryProvinceOptions(),
  ]);
  const topicNames = new Map(topics.map((topic) => [topic.id, topic.nameTh]));
  const exportParams = {
    search: filters.search,
    authorType,
    provinceId: filters.provinceId,
    topicId: filters.topicId,
    status: filters.status,
    readiness: filters.readiness,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  };
  const isEditorial = mode === "editorial";

  return (
    <ListPageShell
      eyebrow="จัดการเนื้อหา"
      title={isEditorial ? "คลังบทความ" : "เรื่องเล่าจากนักเดินทาง"}
      description={
        isEditorial
          ? "เขียน ตรวจความพร้อม ตั้งเวลา และดูแลบทความที่เผยแพร่โดยทีมงาน"
          : "ตรวจเรื่องเล่าที่นักเดินทางส่งเข้ามา โดยแยกจากบทความของทีมงานอย่างชัดเจน"
      }
      createHref="/admin/stories/new"
      createLabel="สร้างบทความ"
      hideCreateButton={!isEditorial}
      headerActions={<ExportButton endpoint="/api/admin/export/stories" label="ส่งออกรายการ" params={exportParams} />}
      total={total}
      page={page}
      pageSize={pageSize}
      emptyTitle={isEditorial ? "ยังไม่มีบทความตามเงื่อนไขนี้" : "ไม่มีเรื่องเล่าที่รอตรวจตามเงื่อนไขนี้"}
      emptyDescription={
        isEditorial
          ? "เปลี่ยนตัวกรอง หรือสร้างบทความใหม่เพื่อเริ่มจัดการเนื้อหา"
          : "เปลี่ยนตัวกรองเพื่อตรวจเรื่องเล่าในสถานะหรือช่วงเวลาอื่น"
      }
      filters={
        <div className="space-y-4">
          <nav aria-label="ประเภทงานเรื่องราว" className="flex gap-1 border-b border-slate-200">
            <Link
              href="/admin/stories"
              aria-current={isEditorial ? "page" : undefined}
              className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-3 text-sm font-bold transition ${
                isEditorial
                  ? "border-[#0A6B62] text-[#073F37]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Article size={18} /> บทความทีมงาน
            </Link>
            <Link
              href="/admin/stories/submissions"
              aria-current={!isEditorial ? "page" : undefined}
              className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-3 text-sm font-bold transition ${
                !isEditorial
                  ? "border-[#0A6B62] text-[#073F37]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <ChatCircleText size={18} /> เรื่องเล่านักเดินทาง
            </Link>
          </nav>

          <section aria-label="สรุปสถานะ" className="grid grid-cols-2 divide-x divide-y divide-slate-200 border-y border-slate-200 bg-white lg:grid-cols-4 lg:divide-y-0">
            {summaryItems(mode, summary).map((item) => (
              <div key={item.label} className="min-w-0 px-4 py-3">
                <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                <p className="mt-1 text-xl font-black text-slate-800">{item.value.toLocaleString("th-TH")}</p>
              </div>
            ))}
          </section>

          {!parsed.success ? (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span>ตัวกรองบางรายการไม่ถูกต้อง ระบบจึงแสดงข้อมูลหน้าแรก</span>
              <Link href={isEditorial ? "/admin/stories" : "/admin/stories/submissions"} className="font-bold underline underline-offset-4">
                ล้างตัวกรอง
              </Link>
            </div>
          ) : null}

          <FilterBar>
            <div className="min-w-[220px] flex-1">
              <SearchInput placeholder="ค้นหาชื่อบทความหรือ slug" />
            </div>
            <FilterSelect
              label="สถานะ"
              paramKey="status"
              options={isEditorial ? editorialStatuses : submissionStatuses}
              allLabel="ทุกสถานะ"
            />
            <FilterSelect
              label="จังหวัด"
              paramKey="provinceId"
              options={provinces.map((province) => ({ value: String(province.id), label: province.nameTh }))}
              allLabel="ทุกจังหวัด"
            />
            <FilterSelect
              label="หัวข้อ"
              paramKey="topicId"
              options={topics.map((topic) => ({ value: String(topic.id), label: topic.nameTh }))}
              allLabel="ทุกหัวข้อ"
            />
            {isEditorial ? (
              <FilterSelect
                label="ความพร้อม"
                paramKey="readiness"
                options={[
                  { value: "ready", label: "พร้อมเผยแพร่" },
                  { value: "needs_work", label: "ต้องตรวจเพิ่ม" },
                  { value: "unscored", label: "ยังไม่ประเมิน" },
                ]}
                allLabel="ทุกระดับ"
              />
            ) : null}
            <StoryDateFilter label="ตั้งแต่วันที่" paramKey="dateFrom" />
            <StoryDateFilter label="ถึงวันที่" paramKey="dateTo" />
            <Link
              href={isEditorial ? "/admin/stories" : "/admin/stories/submissions"}
              className="inline-flex h-11 items-center justify-center px-3 text-sm font-bold text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
            >
              ล้างตัวกรอง
            </Link>
          </FilterBar>
        </div>
      }
    >
      <div className="hidden md:block">
        <DataTable
          columns={[
            { key: "story", label: isEditorial ? "บทความ" : "เรื่องเล่า" },
            { key: "context", label: "จังหวัด / หัวข้อ", className: "hidden lg:table-cell" },
            { key: "updated", label: isEditorial ? "แก้ไขล่าสุด" : "ส่งเมื่อ", className: "hidden xl:table-cell" },
            ...(isEditorial ? [{ key: "readiness", label: "ความพร้อม", className: "hidden lg:table-cell" }] : []),
            { key: "status", label: "สถานะ" },
            { key: "actions", label: "การทำงาน", className: "w-32 text-right" },
          ]}
        >
          {items.map((story) => {
            const status = getStoryStatusPresentation(story.status);
            const readiness = getStoryReadinessPresentation(story.content_quality_score ?? null);
            const topicLabel = (story.topic_ids ?? []).map((id) => topicNames.get(id)).filter(Boolean).join(", ");
            return (
              <tr key={story.story_id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3">
                  <p className="max-w-xl font-bold text-[#073F37]">{story.title}</p>
                  <p className="mt-1 max-w-xl truncate text-xs text-slate-500">
                    {isEditorial ? story.excerpt || story.slug : `ผู้ส่ง: ${story.tourist_name ?? "นักเดินทาง"}`}
                  </p>
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  <p className="text-sm font-semibold text-slate-700">{story.province_name_th ?? "ไม่ระบุจังหวัด"}</p>
                  <p className="mt-1 max-w-56 truncate text-xs text-slate-500">{topicLabel || "ยังไม่กำหนดหัวข้อ"}</p>
                </td>
                <td className="hidden px-4 py-3 text-sm text-slate-600 xl:table-cell">
                  {formatAdminDate(isEditorial ? story.updated_at ?? story.created_at : story.created_at)}
                </td>
                {isEditorial ? (
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <StatusBadge label={readiness.label} tone={readiness.tone} />
                  </td>
                ) : null}
                <td className="px-4 py-3"><StatusBadge label={status.label} tone={status.tone} /></td>
                <td className="px-4 py-3 text-right">
                  <StoryStatusActions storyId={story.story_id} mode={mode} />
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>

      <div className="grid gap-3 md:hidden">
        {items.map((story) => {
          const status = getStoryStatusPresentation(story.status);
          const readiness = getStoryReadinessPresentation(story.content_quality_score ?? null);
          return (
            <article key={story.story_id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-bold text-[#073F37]">{story.title}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {isEditorial ? story.province_name_th ?? "ไม่ระบุจังหวัด" : `ผู้ส่ง: ${story.tourist_name ?? "นักเดินทาง"}`}
                  </p>
                </div>
                <StatusBadge label={status.label} tone={status.tone} />
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div className="text-xs text-slate-500">
                  {isEditorial ? <StatusBadge label={readiness.label} tone={readiness.tone} /> : formatAdminDate(story.created_at)}
                </div>
                <StoryStatusActions storyId={story.story_id} mode={mode} />
              </div>
            </article>
          );
        })}
      </div>
    </ListPageShell>
  );
}
