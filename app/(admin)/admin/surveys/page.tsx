export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChartBar, Eye, Star } from "@phosphor-icons/react/dist/ssr";
import { DataTable } from "@/components/admin/DataTable";
import { ExportButton } from "@/components/admin/ExportButton";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { ListPageShell } from "@/components/admin/ListPageShell";
import { SearchInput } from "@/components/admin/SearchInput";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SurveyDateFilters } from "@/components/admin/surveys/SurveyDateFilters";
import { hasPermission, requirePermission } from "@/lib/auth/guards";
import { getAdminAttractionsList, getAdminProvinces } from "@/lib/repositories/admin-attraction.repository";
import { listAdminSurveys, type AdminSurveyRow } from "@/lib/repositories/admin-survey.repository";
import { adminSurveyFiltersSchema } from "@/lib/validation/admin-survey";

export const metadata: Metadata = {
  title: "คำตอบแบบสำรวจ | ระบบผู้ดูแล",
};

const baseColumns = [
  { key: "date", label: "วันที่ตอบ" },
  { key: "tourist", label: "ผู้ตอบ" },
  { key: "attraction", label: "สถานที่", className: "hidden md:table-cell" },
  { key: "coverage", label: "ข้อมูลที่กรอก", className: "hidden lg:table-cell" },
  { key: "score", label: "โดยรวม" },
  { key: "action", label: "" },
];

const scoreOptions = [
  { value: "5", label: "5 - ดีมาก" },
  { value: "4", label: "4 - ดี" },
  { value: "3", label: "3 - ปานกลาง" },
  { value: "2", label: "2 - ควรปรับปรุง" },
  { value: "1", label: "1 - ไม่พึงพอใจ" },
];

function Score({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs font-medium text-slate-500">ไม่ได้ตอบ</span>;
  return (
    <span className="inline-flex items-center gap-1 font-bold text-[#075049]">
      <Star aria-hidden="true" size={15} weight="fill" className="text-amber-500" />
      {score}/5
    </span>
  );
}

function Coverage({ survey }: { survey: AdminSurveyRow }) {
  const sections = [
    ["พฤติกรรม", survey.has_travel_behavior],
    ["ค่าใช้จ่าย", survey.has_expense],
    ["ความพึงพอใจ", survey.has_satisfaction],
    ["ความคิดเห็น", survey.has_comment],
  ] as const;
  return (
    <div className="flex max-w-[300px] flex-wrap gap-1.5">
      {sections.filter(([, answered]) => answered).map(([label]) => (
        <StatusBadge key={label} label={label} tone="teal" />
      ))}
      {!sections.some(([, answered]) => answered) ? <StatusBadge label="ไม่มีข้อมูล" tone="gray" /> : null}
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ไม่ระบุ";
  return date.toLocaleString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminSurveysPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const guard = await requirePermission("survey.read");
  const canReadDetail = hasPermission(guard.actor, "survey.detail");
  const canReadTourist = hasPermission(guard.actor, "tourist.detail");
  const canExport = hasPermission(guard.actor, "export.survey_data");
  const parsed = adminSurveyFiltersSchema.safeParse(await searchParams);
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 20 };
  const [{ items, total, page, pageSize }, provinces, attractions] = await Promise.all([
    listAdminSurveys(filters),
    getAdminProvinces(),
    getAdminAttractionsList(),
  ]);

  const provinceOptions = provinces.map((province) => ({
    value: String(province.province_id),
    label: province.province_name_th ?? `จังหวัด ${province.province_id}`,
  }));
  const attractionOptions = attractions.map((attraction) => ({
    value: String(attraction.attraction_id),
    label: `${attraction.name_th ?? `สถานที่ ${attraction.attraction_id}`}${attraction.is_published ? "" : " (ฉบับร่าง)"}`,
  }));

  return (
    <ListPageShell
      eyebrow="ข้อมูลการท่องเที่ยว"
      title="คำตอบแบบสำรวจ"
      description="ตรวจคำตอบเพิ่มเติมที่นักท่องเที่ยวสมัครใจกรอก แยกตามผู้ตอบ การเข้าชม สถานที่ และหมวดข้อมูล"
      hideCreateButton
      headerActions={(
        <>
          <Link href="/admin/dashboard/satisfaction" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <ChartBar aria-hidden="true" size={18} /> ดูข้อมูลวิเคราะห์
          </Link>
          {canExport ? <ExportButton endpoint="/api/admin/export/surveys" label="ส่งออกข้อมูล" /> : null}
        </>
      )}
      total={total}
      page={page}
      pageSize={pageSize}
      emptyTitle="ไม่พบคำตอบแบบสำรวจ"
      emptyDescription="ยังไม่มีคำตอบในเงื่อนไขนี้ ลองเปลี่ยนคำค้นหา ช่วงวันที่ หรือตัวกรอง"
      filters={(
        <FilterBar>
          <div className="min-w-[220px] flex-1"><SearchInput placeholder="ค้นหาชื่อผู้ตอบ..." /></div>
          <SurveyDateFilters />
          <FilterSelect label="จังหวัด" paramKey="provinceId" options={provinceOptions} allLabel="ทุกจังหวัด" />
          <FilterSelect label="สถานที่" paramKey="attractionId" options={attractionOptions} allLabel="ทุกสถานที่" />
          <FilterSelect label="คะแนนขั้นต่ำ" paramKey="minScore" options={scoreOptions} allLabel="ไม่จำกัด" />
          <FilterSelect label="คะแนนสูงสุด" paramKey="maxScore" options={scoreOptions} allLabel="ไม่จำกัด" />
        </FilterBar>
      )}
    >
      <div className="hidden md:block">
        <DataTable columns={baseColumns}>
          {items.map((survey) => (
            <tr key={survey.survey_id} className="hover:bg-slate-50/70">
              <td className="px-4 py-3 text-xs font-medium text-slate-600">{formatDate(survey.submitted_at)}</td>
              <td className="px-4 py-3">
                {canReadTourist ? (
                  <Link href={`/admin/tourists/${survey.tourist_id}`} className="font-semibold text-[#075049] underline-offset-4 hover:underline">
                    {survey.tourist_display_name ?? "ผู้ใช้งานแบบผู้เยี่ยมชม"}
                  </Link>
                ) : <span className="font-semibold text-slate-800">{survey.tourist_display_name ?? "ผู้ใช้งานแบบผู้เยี่ยมชม"}</span>}
              </td>
              <td className="hidden px-4 py-3 md:table-cell"><p className="font-semibold text-slate-800">{survey.attraction_name_th ?? "ไม่ระบุ"}</p><p className="mt-0.5 text-xs text-slate-500">{survey.province_name_th ?? ""}</p></td>
              <td className="hidden px-4 py-3 lg:table-cell"><Coverage survey={survey} /></td>
              <td className="px-4 py-3"><Score score={survey.overall_score} /></td>
              <td className="px-4 py-3 text-right">
                {canReadDetail ? (
                  <Link href={`/admin/surveys/${survey.survey_id}`} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-[#075049] hover:bg-[#E6F4EF]" aria-label={`ดูคำตอบของ ${survey.tourist_display_name ?? "ผู้ใช้งาน"}`}>
                    <Eye aria-hidden="true" size={17} /> ดูคำตอบ
                  </Link>
                ) : null}
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      <div className="grid gap-3 md:hidden">
        {items.map((survey) => (
          <article key={survey.survey_id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">{formatDate(survey.submitted_at)}</p>
                <p className="mt-1 truncate font-bold text-slate-900">{survey.tourist_display_name ?? "ผู้ใช้งานแบบผู้เยี่ยมชม"}</p>
                <p className="mt-1 text-sm text-slate-600">{survey.attraction_name_th ?? "ไม่ระบุสถานที่"}</p>
              </div>
              <Score score={survey.overall_score} />
            </div>
            <div className="mt-4 border-t border-slate-100 pt-3"><p className="mb-2 text-xs font-semibold text-slate-500">ข้อมูลที่กรอก {survey.answered_field_count} ช่อง</p><Coverage survey={survey} /></div>
            {canReadDetail ? (
              <Link href={`/admin/surveys/${survey.survey_id}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#075049] px-4 text-sm font-semibold text-white">
                ดูรายละเอียด <ArrowRight aria-hidden="true" size={17} />
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </ListPageShell>
  );
}
