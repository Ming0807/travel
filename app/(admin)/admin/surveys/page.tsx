export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SearchInput } from "@/components/admin/SearchInput";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { listAdminSurveys } from "@/lib/repositories/admin-survey.repository";
import { adminSurveyFiltersSchema } from "@/lib/validation/admin-survey";
import { Star, ThumbsUp, ThumbsDown } from "@phosphor-icons/react/dist/ssr";
import { ExportButton } from "@/components/admin/ExportButton";

export const metadata: Metadata = {
  title: "Survey Responses | Admin",
};

const baseColumns = [
  { key: "date", label: "วันที่" },
  { key: "tourist", label: "นักท่องเที่ยว" },
  { key: "attraction", label: "แหล่งท่องเที่ยว", className: "hidden md:table-cell" },
  { key: "score", label: "คะแนน" },
  { key: "intention", label: "กลับมาอีก", className: "hidden lg:table-cell" },
  { key: "comments", label: "ความคิดเห็น", className: "hidden xl:table-cell" },
];

const scoreOptions = [
  { value: "5", label: "⭐ 5 (ดีมาก)" },
  { value: "4", label: "⭐ 4 (ดี)" },
  { value: "3", label: "⭐ 3 (ปานกลาง)" },
  { value: "2", label: "⭐ 2 (ต้องปรับปรุง)" },
  { value: "1", label: "⭐ 1 (แย่)" },
];

function ScoreStars({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-slate-400">—</span>;
  return (
    <div className="flex items-center gap-1">
      <Star size={14} weight="fill" className="text-amber-500" />
      <span className="text-sm font-black text-[#073F37]">{score}</span>
      <span className="text-[10px] text-slate-400">/5</span>
    </div>
  );
}

export default async function AdminSurveysPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const guard = await requirePermission("survey.read");
  const canReadComments = hasPermission(guard.actor, "survey.comment_read");
  const columns = canReadComments ? baseColumns : baseColumns.filter((column) => column.key !== "comments");
  const raw = await searchParams;
  const parsed = adminSurveyFiltersSchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 20 };
  const { items, total, page, pageSize } = await listAdminSurveys(filters);

  return (
    <ListPageShell
      eyebrow="Data Records"
      title="Survey Responses"
      description="ข้อมูลจากแบบสอบถามความพึงพอใจหลังสร้างใบประกาศ"
      hideCreateButton
      headerActions={<ExportButton endpoint="/api/admin/export/surveys" label="Export CSV" />}
      total={total}
      page={page}
      pageSize={pageSize}
      emptyTitle="ไม่พบแบบสอบถาม"
      emptyDescription="ยังไม่มีนักท่องเที่ยวตอบแบบสอบถาม หรือลองเปลี่ยนตัวกรอง"
      filters={
        <FilterBar>
          <div className="min-w-[220px] flex-1">
            <SearchInput placeholder="ค้นหา..." />
          </div>
          <FilterSelect
            label="คะแนนขั้นต่ำ"
            paramKey="minScore"
            options={scoreOptions}
            allLabel="ทุกคะแนน"
          />
        </FilterBar>
      }
    >
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <DataTable columns={columns}>
          {items.map((survey) => (
            <tr key={survey.survey_id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3">
                <p className="text-sm font-semibold text-[#073F37]">
                  {new Date(survey.submitted_at).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </td>
              <td className="px-4 py-3">
                <p className="text-sm font-semibold text-slate-700">
                  {survey.tourist_display_name ?? "Guest"}
                </p>
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <div>
                  <span className="text-xs font-semibold text-slate-600">
                    {survey.attraction_name_th ?? "—"}
                  </span>
                  {survey.province_name_th && (
                    <span className="ml-1 text-[10px] text-slate-400">
                      ({survey.province_name_th})
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <ScoreStars score={survey.overall_score} />
              </td>
              <td className="hidden px-4 py-3 lg:table-cell">
                <div className="flex items-center gap-2">
                  {survey.revisit_intention === "yes" ? (
                    <StatusBadge label="กลับมาอีก" tone="green" />
                  ) : survey.revisit_intention === "no" ? (
                    <StatusBadge label="ไม่กลับ" tone="red" />
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                  {survey.recommend_intention === "yes" ? (
                    <ThumbsUp size={14} weight="fill" className="text-emerald-600" />
                  ) : survey.recommend_intention === "no" ? (
                    <ThumbsDown size={14} weight="fill" className="text-rose-500" />
                  ) : null}
                </div>
              </td>
              {canReadComments && (
                <td className="hidden px-4 py-3 xl:table-cell">
                  {survey.comments ? (
                    <p className="max-w-[200px] truncate text-xs text-slate-500" title={survey.comments}>
                      {survey.comments}
                    </p>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </DataTable>
      </div>

      {/* Mobile Card View */}
      <div className="grid gap-4 md:hidden">
        {items.map((survey) => (
          <div
            key={survey.survey_id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#073F37]">
                  {new Date(survey.submitted_at).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {survey.tourist_display_name ?? "Guest"}
                </p>
              </div>
              <ScoreStars score={survey.overall_score} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <p className="text-xs text-slate-400">แหล่งท่องเที่ยว</p>
                <p className="font-semibold text-slate-700">
                  {survey.attraction_name_th ?? "—"}
                  {survey.province_name_th && (
                    <span className="ml-1 text-xs text-slate-400">({survey.province_name_th})</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">กลับมาอีก</p>
                <div className="mt-0.5">
                  {survey.revisit_intention === "yes" ? (
                    <StatusBadge label="กลับมาอีก" tone="green" />
                  ) : survey.revisit_intention === "no" ? (
                    <StatusBadge label="ไม่กลับ" tone="red" />
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400">แนะนำ</p>
                <div className="mt-0.5">
                  {survey.recommend_intention === "yes" ? (
                    <ThumbsUp size={16} weight="fill" className="text-emerald-600" />
                  ) : survey.recommend_intention === "no" ? (
                    <ThumbsDown size={16} weight="fill" className="text-rose-500" />
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </div>
              </div>
            </div>

            {canReadComments && survey.comments && (
              <div className="border-t border-slate-100 pt-3">
                <p className="mb-1 text-xs text-slate-400">ความคิดเห็น</p>
                <p className="line-clamp-2 text-sm text-slate-600">{survey.comments}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </ListPageShell>
  );
}
