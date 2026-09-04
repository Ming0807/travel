import {
  ArrowRight,
  ChartLineUp,
  Lightbulb,
  Megaphone,
  ShieldWarning,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { localizeDashboardInsight } from "@/components/dashboard/dashboard-localization";
import type { DashboardComparison, DashboardKpi, InsightCardData } from "@/types/dashboard";

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

const CHANGE_COPY: Record<string, { label: string; meaning: string; action: string }> = {
  tourist_profiles: {
    label: "โปรไฟล์ที่เชื่อมกับการเข้าชม",
    meaning: "สะท้อนจำนวนโปรไฟล์ในระบบ ไม่ใช่จำนวนคนที่ผ่านการยืนยันตัวตน และไม่ได้ยืนยันว่าเกิดจากมาตรการใด",
    action: "เปิดดูกลุ่มนักท่องเที่ยวเพื่อตรวจว่าการเปลี่ยนแปลงเกิดในกลุ่มใด",
  },
  total_visits: {
    label: "การเข้าชมที่บันทึก",
    meaning: "สะท้อนรายการที่ผ่านขั้นข้อมูลขั้นต่ำ ไม่ใช่ยอดเปิดหน้าเว็บหรือสแกน QR และไม่ได้ยืนยันว่าเกิดจากมาตรการใด",
    action: "เปิดดูพฤติกรรมการเดินทางและรายสถานที่เพื่อหาจุดที่การเปลี่ยนแปลงกระจุกตัว",
  },
  certificates_generated: {
    label: "ใบประกาศที่สร้างสำเร็จ",
    meaning: "สะท้อนการจบขั้นรับรางวัลในระบบ และไม่ได้ยืนยันว่าใบประกาศเป็นสาเหตุของพฤติกรรมถัดไป",
    action: "เปิดดูเส้นทางผู้ใช้เพื่อตรวจ conversion ก่อนและหลังขั้นสร้างใบประกาศ",
  },
  survey_completion_rate: {
    label: "อัตราตอบแบบสำรวจ",
    meaning: "สะท้อนความครอบคลุมของคำตอบเมื่อเทียบกับใบประกาศ ไม่ได้ยืนยันว่าแรงจูงใจใดเป็นสาเหตุ",
    action: "ตรวจจำนวนคำตอบและจุดหลุดในเส้นทางผู้ใช้ก่อนนำผลสำรวจไปตัดสินใจ",
  },
  average_satisfaction: {
    label: "คะแนนความพึงพอใจเฉลี่ย",
    meaning: "สะท้อนเฉพาะผู้ตอบแบบสำรวจในขอบเขตนี้ ไม่ใช่ความคิดเห็นของผู้เยี่ยมชมทั้งหมด และไม่ได้ยืนยันสาเหตุของการเปลี่ยนแปลง",
    action: "เปิดดูคุณภาพประสบการณ์และรายสถานที่ พร้อมตรวจฐานคำตอบของแต่ละมิติ",
  },
};

function formatChange(metric: DashboardKpi, change: NonNullable<DashboardComparison>["metrics"][string]) {
  if (change.direction === "flat") return `${CHANGE_COPY[metric.key]?.label ?? metric.label}คงที่จากช่วงก่อน`;
  const direction = change.direction === "up" ? "เพิ่มขึ้น" : "ลดลง";
  if (metric.valueType === "percentage" && change.absoluteChange !== null) {
    return `${CHANGE_COPY[metric.key]?.label ?? metric.label}${direction} ${Math.abs(change.absoluteChange * 100).toLocaleString("th-TH", { maximumFractionDigits: 1 })} จุดร้อยละ`;
  }
  if (metric.valueType === "rating" && change.absoluteChange !== null) {
    return `${CHANGE_COPY[metric.key]?.label ?? metric.label}${direction} ${Math.abs(change.absoluteChange).toLocaleString("th-TH", { maximumFractionDigits: 1 })} คะแนน`;
  }
  return `${CHANGE_COPY[metric.key]?.label ?? metric.label}${direction} ${Math.abs(change.percentChange ?? 0).toLocaleString("th-TH", { maximumFractionDigits: 1 })}%`;
}

function buildChangeBrief(comparison: DashboardComparison | null | undefined, kpis: DashboardKpi[]) {
  if (comparison?.status !== "ready") return null;
  const candidates = kpis.flatMap((metric) => {
    const change = comparison.metrics[metric.key];
    if (!CHANGE_COPY[metric.key] || !change || !["up", "down", "flat"].includes(change.direction)) return [];
    const changeValue = metric.valueType === "count" ? change.percentChange : change.absoluteChange;
    if (change.currentValue === null || change.previousValue === null || changeValue === null || !Number.isFinite(changeValue)) return [];
    const magnitude = metric.valueType === "count"
      ? Math.abs(change.percentChange ?? -1)
      : Math.abs(change.absoluteChange ?? -1) * 100;
    return [{ metric, change, magnitude }];
  });
  const selected = candidates.sort((left, right) => right.magnitude - left.magnitude)[0];
  if (!selected) return null;
  const copy = CHANGE_COPY[selected.metric.key];
  return { ...copy, title: formatChange(selected.metric, selected.change) };
}

export function ExecutiveDecisionSummary({ comparison, insights, kpis = [] }: {
  comparison?: DashboardComparison | null;
  insights: InsightCardData[];
  kpis?: DashboardKpi[];
}) {
  const visible = insights.slice(0, 3).map(localizeDashboardInsight);
  const changeBrief = buildChangeBrief(comparison, kpis);

  return (
    <section
      aria-labelledby="executive-decision-heading"
      className="h-full min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
        <div>
          <h2 id="executive-decision-heading" className="text-lg font-black text-slate-950">
            ประเด็นเพื่อการตัดสินใจ
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">สรุปจากหลักฐานในช่วงและตัวกรองเดียวกับทั้งหน้า</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-teal-50 text-[#0A6B62]">
          <Lightbulb aria-hidden="true" size={20} weight="fill" />
        </span>
      </div>

      {changeBrief ? (
        <article className="border-b border-slate-200 bg-[#FFF7F3] px-4 py-3.5 sm:px-5">
          <p className="text-[11px] font-black uppercase text-[#B94727]">สิ่งที่เปลี่ยนจากช่วงก่อน</p>
          <h3 className="mt-1 text-sm font-black leading-5 text-slate-950">{changeBrief.title}</h3>
          <details className="mt-1 text-xs leading-5 text-slate-600"><summary className="min-h-8 cursor-pointer py-1 font-semibold">ขอบเขตการตีความ</summary><p>{changeBrief.meaning}</p></details>
          <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-5 text-[#0A6B62]"><ArrowRight aria-hidden="true" className="mt-0.5 shrink-0" size={14} weight="bold" />{changeBrief.action}</p>
        </article>
      ) : null}

      {visible.length === 0 && !changeBrief ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm font-bold text-slate-800">ยังไม่มีประเด็นสรุป</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">ระบบต้องมีข้อมูลเพียงพอก่อนจึงจะแสดงข้อสังเกตสำหรับวางแผน</p>
        </div>
      ) : visible.length > 0 ? (
        <ol className="divide-y divide-slate-100 px-4 sm:px-5">
          {visible.map((insight, index) => {
            const meta = CATEGORY_META[insight.category];
            const Icon = meta.icon;
            return (
              <li key={`${insight.category}-${insight.title}-${index}`} className="flex min-w-0 items-start gap-3 py-4">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${meta.iconClass}`}>
                  <Icon aria-hidden="true" size={18} weight="fill" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[11px] font-bold text-[#8F351F]">{meta.label}</span>
                      <span className="text-[11px] font-semibold text-slate-500">{CONFIDENCE_LABELS[insight.confidence]}</span>
                    </div>
                    <h3 className="mt-1 text-sm font-black leading-5 text-slate-900">{insight.title}</h3>
                    <details className="mt-1 text-xs leading-5 text-slate-600"><summary className="min-h-8 cursor-pointer py-1 font-semibold">หลักฐานประกอบ</summary><p>{insight.evidence}</p></details>
                    <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold leading-5 text-[#0A6B62]">
                      <ArrowRight aria-hidden="true" className="mt-0.5 shrink-0" size={14} weight="bold" />
                      <span>{insight.suggestedAction}</span>
                    </p>
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}
