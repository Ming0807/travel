"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DistributionEvidenceStrip } from "@/components/dashboard/DistributionEvidenceStrip";
import type { DistributionItem } from "@/types/dashboard";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { SmallSampleWarning } from "@/components/dashboard/SmallSampleWarning";
import { DASHBOARD_MIN_SAMPLE_SIZE } from "@/constants/dashboard-metrics";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { localizeDashboardLabel } from "@/components/dashboard/dashboard-localization";

const DONUT_COLORS = ["#D94717", "#0A6B62", "#D6A13D", "#3E7A4F", "#64748B", "#E78A6D", "#4F8E88", "#A97B22", "#94A3B8", "#B7D9D5"];

type DonutChartCardProps = {
  title: string;
  definition: string;
  data: DistributionItem[];
  emptyDescription: string;
  sampleCount?: number;
  sampleLabel?: string;
  footerNote?: string;
  denominatorCount?: number;
  interpretation?: string;
};

export function DonutChartCard({ title, definition, data, emptyDescription, sampleCount, sampleLabel = "คำตอบ", footerNote, denominatorCount, interpretation }: DonutChartCardProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const segments = data.filter((item) => item.value > 0).map((item, index) => ({
    ...item,
    displayLabel: localizeDashboardLabel(item.label),
    share: total > 0 ? item.value / total : 0,
    color: DONUT_COLORS[index % DONUT_COLORS.length],
  })).sort((a, b) => b.value - a.value);
  const tableSegments = selectedLabel === null ? segments : segments.filter((segment) => segment.label === selectedLabel);

  if (segments.length === 0) {
    return (
      <section className="min-w-0 rounded-md border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3"><h2 className="text-base font-black text-slate-950">{title}</h2><MetricTooltip definition={definition} /></div>
        {sampleCount !== undefined && sampleCount < DASHBOARD_MIN_SAMPLE_SIZE ? <div className="mt-4"><SmallSampleWarning count={sampleCount} label={sampleLabel} /></div> : null}
        <div className="mt-4"><NoDataState description={emptyDescription} /></div>
      </section>
    );
  }

  return (
    <section className="min-w-0 rounded-md border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3"><h2 className="text-base font-black text-slate-950">{title}</h2><MetricTooltip definition={definition} /></div>
      {sampleCount !== undefined && denominatorCount !== undefined && interpretation ? (
        <DistributionEvidenceStrip answeredCount={sampleCount} denominatorCount={denominatorCount} interpretation={interpretation} />
      ) : sampleCount !== undefined && sampleCount < DASHBOARD_MIN_SAMPLE_SIZE ? <div className="mt-4"><SmallSampleWarning count={sampleCount} label={sampleLabel} /></div> : null}
      <div className="mt-4 grid items-center gap-5 sm:grid-cols-[minmax(180px,0.85fr)_minmax(0,1.15fr)]">
        <div className="relative mx-auto h-52 w-full max-w-60" data-chart-engine="recharts" role="img" aria-label={`แผนภูมิโดนัท ${title}`}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 240, height: 208 }}>
            <PieChart>
              <Pie data={segments} dataKey="value" nameKey="displayLabel" cx="50%" cy="50%" innerRadius="62%" outerRadius="88%" paddingAngle={2} cornerRadius={4} stroke="#FFFFFF" strokeWidth={2} isAnimationActive={false} cursor="pointer" onClick={(_entry, index) => setSelectedLabel(segments[index]?.label ?? null)}>
                {segments.map((segment) => <Cell key={`slice-${segment.label}`} fill={segment.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 5, boxShadow: "0 4px 8px rgba(15,23,42,0.10)", fontSize: 12 }} formatter={(value, _name, item) => {
                const payload = item.payload as (typeof segments)[number];
                return [`${Number(value).toLocaleString("th-TH")} รายการ (${(payload.share * 100).toFixed(1)}%)`, payload.displayLabel];
              }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="text-2xl font-black tabular-nums text-slate-950">{total.toLocaleString("th-TH")}</strong><span className="text-xs font-semibold text-slate-500">รวมทั้งหมด</span></div>
        </div>
        <ul className="min-w-0 divide-y divide-slate-100">
          {segments.map((segment) => <li key={segment.label} className="flex min-h-11 items-center gap-3 py-2"><span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: segment.color }} /><span className="min-w-0 flex-1 break-words text-sm font-bold leading-6 text-slate-700">{segment.displayLabel}</span><span className="shrink-0 text-right"><strong className="block text-sm font-black tabular-nums text-slate-950">{segment.value.toLocaleString("th-TH")}</strong><span className="block text-xs tabular-nums text-slate-500">{(segment.share * 100).toFixed(1)}%</span></span></li>)}
        </ul>
      </div>
      <details className="mt-3 border-t border-slate-100 pt-3" open={selectedLabel === null ? undefined : true}>
        <summary className="min-h-11 cursor-pointer py-2 text-xs font-semibold text-[#B94727]">ดูเป็นตารางข้อมูล</summary>
        {selectedLabel ? <div className="mb-2 flex flex-wrap items-center justify-between gap-2 bg-orange-50 px-3 py-2 text-xs text-orange-950"><strong>กำลังดูเฉพาะ {localizeDashboardLabel(selectedLabel)}</strong><button className="min-h-8 px-2 font-bold underline underline-offset-2" onClick={() => setSelectedLabel(null)} type="button">แสดงทั้งหมด</button></div> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-96 text-sm" aria-label={`ข้อมูล${title}`}><thead><tr className="border-b border-slate-200 text-left text-xs text-slate-500"><th className="py-2 pr-4">รายการ</th><th className="py-2 text-right">จำนวน</th><th className="py-2 text-right">สัดส่วน</th><th className="py-2 pl-3 text-right">ตรวจรายละเอียด</th></tr></thead><tbody>{tableSegments.map((segment) => <tr className="border-b border-slate-100" key={`table-${segment.label}`}><td className="py-2 pr-4">{segment.displayLabel}</td><td className="py-2 text-right tabular-nums">{segment.value.toLocaleString("th-TH")}</td><td className="py-2 text-right tabular-nums">{(segment.share * 100).toFixed(1)}%</td><td className="py-1 pl-3 text-right"><button aria-label={`ดูรายละเอียดเฉพาะ ${segment.label}`} className="min-h-9 whitespace-nowrap px-2 text-xs font-bold text-[#B94727] underline-offset-2 hover:underline" onClick={() => setSelectedLabel(segment.label)} type="button">ดูเฉพาะรายการนี้</button></td></tr>)}</tbody></table>
        </div>
      </details>
      {footerNote ? <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">{footerNote}</p> : null}
    </section>
  );
}
