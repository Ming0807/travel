import {
  ArrowRight,
  ChartLineUp,
  Lightbulb,
  Megaphone,
  ShieldWarning,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { localizeDashboardInsight } from "@/components/dashboard/dashboard-localization";
import type { InsightCardData } from "@/types/dashboard";

const CATEGORY_META: Record<
  InsightCardData["category"],
  { label: string; icon: typeof Lightbulb; iconClass: string }
> = {
  improvement: { label: "ควรปรับปรุง", icon: WarningCircle, iconClass: "bg-rose-50 text-rose-700" },
  promotion: { label: "โอกาสประชาสัมพันธ์", icon: Megaphone, iconClass: "bg-emerald-50 text-emerald-700" },
  concentration: { label: "การกระจุกตัว", icon: ChartLineUp, iconClass: "bg-amber-50 text-amber-800" },
  data_quality: { label: "คุณภาพข้อมูล", icon: ShieldWarning, iconClass: "bg-slate-100 text-slate-700" },
  opportunity: { label: "โอกาส", icon: Lightbulb, iconClass: "bg-teal-50 text-teal-800" },
};

const CONFIDENCE_LABELS: Record<InsightCardData["confidence"], string> = {
  high: "ความเชื่อมั่นสูง",
  medium: "ความเชื่อมั่นปานกลาง",
  low: "ความเชื่อมั่นต่ำ",
};

export function ExecutiveDecisionSummary({ insights }: { insights: InsightCardData[] }) {
  const visible = insights.slice(0, 3).map(localizeDashboardInsight);

  return (
    <section
      aria-labelledby="executive-decision-heading"
      className="h-full min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
        <div>
          <p className="text-xs font-bold text-[#0A6B62]">DECISION SUPPORT</p>
          <h2 id="executive-decision-heading" className="mt-1 text-lg font-black text-slate-950">
            ประเด็นเพื่อการตัดสินใจ
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">สรุปจากหลักฐานในช่วงและตัวกรองเดียวกับทั้งหน้า</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-teal-50 text-[#0A6B62]">
          <Lightbulb aria-hidden="true" size={20} weight="fill" />
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm font-bold text-slate-800">ยังไม่มีประเด็นสรุป</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">ระบบต้องมีข้อมูลเพียงพอก่อนจึงจะแสดงข้อสังเกตสำหรับวางแผน</p>
        </div>
      ) : (
        <ol className="space-y-2.5 p-3.5">
          {visible.map((insight, index) => {
            const meta = CATEGORY_META[insight.category];
            const Icon = meta.icon;
            return (
              <li key={`${insight.category}-${insight.title}`} className="grid min-w-0 grid-cols-[2.6rem_minmax(0,1fr)] overflow-hidden rounded-[5px] border border-slate-200 bg-slate-50/60">
                <div className={`flex min-h-full flex-col items-center justify-center gap-1 ${meta.iconClass}`}>
                  <span className="text-base font-black tabular-nums">{index + 1}</span>
                  <Icon aria-hidden="true" size={15} weight="fill" />
                </div>
                <div className="min-w-0 px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[11px] font-bold text-[#8F351F]">{meta.label}</span>
                      <span className="text-[11px] font-semibold text-slate-500">{CONFIDENCE_LABELS[insight.confidence]}</span>
                    </div>
                    <h3 className="mt-1 text-sm font-black leading-5 text-slate-900">{insight.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{insight.evidence}</p>
                    <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-5 text-[#0A6B62]">
                      <ArrowRight aria-hidden="true" className="mt-0.5 shrink-0" size={14} weight="bold" />
                      <span>{insight.suggestedAction}</span>
                    </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
