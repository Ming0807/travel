import type { ReactNode } from "react";
import { ChartDonut, Clock, CurrencyCircleDollar, Star } from "@phosphor-icons/react/dist/ssr";
import type { DashboardViewModel } from "@/types/dashboard";

type QualityStripProps = {
  expense: Pick<DashboardViewModel["expense"], "responseCount" | "spendingRangeResponseCount">;
  generatedAt: string;
  satisfaction: Pick<DashboardViewModel["satisfaction"], "averageOverall" | "responseCount">;
  surveyCompletionRate: number | null;
};

function percent(value: number | null): string {
  return value === null ? "ยังไม่มีข้อมูล" : `${Math.round(value * 100)}%`;
}

function safeRate(numerator: number, denominator: number): number | null {
  if (denominator <= 0 || numerator < 0 || numerator > denominator) return null;
  return numerator / denominator;
}

export function ExecutiveQualityStrip({
  expense,
  generatedAt,
  satisfaction,
  surveyCompletionRate,
}: QualityStripProps) {
  const expenseCoverage = safeRate(expense.spendingRangeResponseCount, expense.responseCount);
  const satisfactionLabel = satisfaction.averageOverall === null
    ? "ยังไม่มีข้อมูล"
    : `${satisfaction.averageOverall.toFixed(1)} / 5`;

  return (
    <section
      aria-label="คุณภาพและความครอบคลุมข้อมูล"
      className="grid overflow-hidden rounded-md border border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-4"
    >
      <QualityMetric
        icon={<ChartDonut aria-hidden="true" size={18} weight="fill" />}
        label="ความครอบคลุมแบบสำรวจ"
        note={`${satisfaction.responseCount.toLocaleString("th-TH")} คำตอบ`}
        tone="teal"
        value={percent(surveyCompletionRate)}
      />
      <QualityMetric
        icon={<CurrencyCircleDollar aria-hidden="true" size={18} weight="fill" />}
        label="ความครบถ้วนข้อมูลค่าใช้จ่าย"
        note={`${expense.spendingRangeResponseCount.toLocaleString("th-TH")} จาก ${expense.responseCount.toLocaleString("th-TH")} คำตอบ`}
        tone="gold"
        value={percent(expenseCoverage)}
      />
      <QualityMetric
        icon={<Star aria-hidden="true" size={18} weight="fill" />}
        label="คะแนนความพึงพอใจเฉลี่ย"
        note={`ฐาน ${satisfaction.responseCount.toLocaleString("th-TH")} คำตอบ`}
        tone="coral"
        value={satisfactionLabel}
      />
      <QualityMetric
        icon={<Clock aria-hidden="true" size={18} weight="fill" />}
        label="ประมวลผลล่าสุด"
        note="เวลาที่สร้างข้อมูลบนหน้านี้"
        tone="slate"
        value={new Date(generatedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
      />
    </section>
  );
}

function QualityMetric({
  icon,
  label,
  note,
  tone,
  value,
}: {
  icon: ReactNode;
  label: string;
  note: string;
  tone: "coral" | "gold" | "slate" | "teal";
  value: string;
}) {
  const toneClass = {
    coral: "bg-[#FFF0EA] text-[#B94727]",
    gold: "bg-[#FFF7DF] text-[#8B6515]",
    slate: "bg-slate-100 text-slate-700",
    teal: "bg-[#EAF6F4] text-[#0A6B62]",
  }[tone];

  return (
    <div className="flex min-w-0 items-center gap-3 border-b border-slate-200 px-4 py-3 last:border-b-0 sm:[&:nth-child(3)]:border-b-0 sm:[&:nth-child(4)]:border-b-0 xl:border-b-0 xl:border-r xl:last:border-r-0">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${toneClass}`}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold text-slate-500">{label}</p>
        <div className="mt-0.5 flex min-w-0 items-baseline gap-2">
          <strong className="shrink-0 text-base font-black tabular-nums text-slate-950">{value}</strong>
          <span className="truncate text-[10px] text-slate-500">{note}</span>
        </div>
      </div>
    </div>
  );
}
