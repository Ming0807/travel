import {
  ArrowCircleUpRight,
  ChartDonut,
  CheckCircle,
  Info,
  Megaphone,
  ShieldCheck,
  Wrench,
} from "@phosphor-icons/react/dist/ssr";
import { AnalyticsSectionHeader } from "@/components/dashboard/AnalyticsSectionHeader";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { localizeDashboardInsight } from "@/components/dashboard/dashboard-localization";
import type { DashboardViewModel, InsightCardData } from "@/types/dashboard";

type CategoryPresentation = {
  label: string;
  icon: typeof Wrench;
  className: string;
};

const CATEGORY: Record<InsightCardData["category"], CategoryPresentation> = {
  improvement: { label: "ควรปรับปรุง", icon: Wrench, className: "bg-rose-50 text-rose-800" },
  promotion: { label: "ควรส่งเสริม", icon: Megaphone, className: "bg-[#FFF0EA] text-[#8F351F]" },
  concentration: { label: "การกระจุกตัว", icon: ChartDonut, className: "bg-amber-50 text-amber-800" },
  opportunity: { label: "โอกาส", icon: ArrowCircleUpRight, className: "bg-emerald-50 text-emerald-800" },
  data_quality: { label: "คุณภาพข้อมูล", icon: ShieldCheck, className: "bg-sky-50 text-sky-800" },
};

const CONFIDENCE: Record<InsightCardData["confidence"], string> = {
  low: "หลักฐานยังน้อย",
  medium: "หลักฐานปานกลาง",
  high: "หลักฐานค่อนข้างชัด",
};

const CATEGORY_ORDER: InsightCardData["category"][] = [
  "improvement",
  "promotion",
  "concentration",
  "opportunity",
  "data_quality",
];

export function SustainableTourismSection({ data }: { data: DashboardViewModel }) {
  const insights = data.insights
    .map(localizeDashboardInsight)
    .sort((left, right) => CATEGORY_ORDER.indexOf(left.category) - CATEGORY_ORDER.indexOf(right.category));
  const categoryCounts = CATEGORY_ORDER
    .map((category) => ({ category, count: insights.filter((insight) => insight.category === category).length }))
    .filter((item) => item.count > 0);

  return (
    <section aria-labelledby="sustainability-heading" className="space-y-5">
      <AnalyticsSectionHeader
        actions={<div className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"><CheckCircle aria-hidden="true" className="text-emerald-700" size={17} weight="fill" />ตรวจสอบหลักฐานย้อนหลังได้</div>}
        description="ข้อสังเกตสร้างจากกติกาและข้อมูลที่มี ไม่ใช่การคาดการณ์จาก AI หรือสถิติทางการ"
        headingId="sustainability-heading"
        title="ข้อสังเกตเพื่อการท่องเที่ยวยั่งยืน"
      />

      {insights.length === 0 ? (
        <NoDataState description="ยังไม่มีข้อมูลเพียงพอสำหรับสร้างข้อสังเกตเชิงวางแผน" />
      ) : (
        <>
          <dl aria-label="จำนวนข้อสังเกตแยกตามประเภท" className="flex flex-wrap gap-x-5 gap-y-2 border-y border-slate-200 bg-white px-4 py-3">
            <div className="flex items-baseline gap-2"><dt className="text-sm font-semibold text-slate-600">ข้อสังเกตทั้งหมด</dt><dd className="text-lg font-bold tabular-nums text-slate-950">{insights.length.toLocaleString("th-TH")}</dd></div>
            {categoryCounts.map(({ category, count }) => <div className="flex items-baseline gap-2" key={category}><dt className="text-sm text-slate-600">{CATEGORY[category].label}</dt><dd className="font-bold tabular-nums text-slate-900">{count.toLocaleString("th-TH")}</dd></div>)}
          </dl>

          <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
            <div className="hidden grid-cols-[170px_minmax(0,1fr)_minmax(260px,0.8fr)] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600 lg:grid"><span>ประเภทและความมั่นใจ</span><span>ข้อค้นพบและหลักฐาน</span><span>แนวทางดำเนินการ</span></div>
            <div className="divide-y divide-slate-200">
              {insights.map((insight, index) => {
                const presentation = CATEGORY[insight.category];
                const Icon = presentation.icon;
                return (
                  <article className="grid min-w-0 gap-4 p-4 lg:grid-cols-[170px_minmax(0,1fr)_minmax(260px,0.8fr)]" key={`${insight.category}-${insight.title}-${index}`}>
                    <div>
                      <span className={`inline-flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs font-bold ${presentation.className}`}><Icon aria-hidden="true" size={16} weight="bold" />{presentation.label}</span>
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600"><ShieldCheck aria-hidden="true" size={15} />{CONFIDENCE[insight.confidence]}</p>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-950">{insight.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{insight.description}</p>
                      <div className="mt-3 rounded-md bg-slate-50 p-3">
                        <p className="text-xs font-bold text-slate-700">หลักฐาน</p>
                        <p className="mt-1 text-sm leading-6 text-slate-700">{insight.evidence}</p>
                      </div>
                    </div>

                    <div className="min-w-0 border-t border-slate-100 pt-4 lg:border-t-0 lg:pt-0">
                      <p className="text-xs font-bold text-slate-700">แนวทางดำเนินการ</p>
                      <p className="mt-1 text-sm leading-6 text-slate-800">{insight.suggestedAction}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-md bg-sky-50 p-3 text-xs leading-5 text-sky-900"><Info aria-hidden="true" className="mt-0.5 shrink-0" size={16} weight="fill" /><p>ระดับความมั่นใจสะท้อนปริมาณและความครบถ้วนของข้อมูลในระบบ ข้อสังเกตทุกข้อควรใช้ร่วมกับบริบทพื้นที่ ข้อมูลทางการ และการตรวจสอบหน้างาน</p></div>
        </>
      )}
    </section>
  );
}
