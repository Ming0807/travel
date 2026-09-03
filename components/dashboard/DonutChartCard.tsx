"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
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
};

export function DonutChartCard({ title, definition, data, emptyDescription, sampleCount, sampleLabel = "คำตอบ", footerNote }: DonutChartCardProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const segments = data.filter((item) => item.value > 0).map((item, index) => ({
    ...item,
    displayLabel: localizeDashboardLabel(item.label),
    share: total > 0 ? item.value / total : 0,
    color: DONUT_COLORS[index % DONUT_COLORS.length],
  })).sort((a, b) => b.value - a.value);

  if (segments.length === 0) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3"><h2 className="text-base font-black text-slate-950">{title}</h2><MetricTooltip definition={definition} /></div>
        {sampleCount !== undefined && sampleCount < DASHBOARD_MIN_SAMPLE_SIZE ? <div className="mt-4"><SmallSampleWarning count={sampleCount} label={sampleLabel} /></div> : null}
        <div className="mt-4"><NoDataState description={emptyDescription} /></div>
      </section>
    );
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3"><h2 className="text-base font-black text-slate-950">{title}</h2><MetricTooltip definition={definition} /></div>
      {sampleCount !== undefined && sampleCount < DASHBOARD_MIN_SAMPLE_SIZE ? <div className="mt-4"><SmallSampleWarning count={sampleCount} label={sampleLabel} /></div> : null}
      <div className="mt-4 grid items-center gap-5 sm:grid-cols-[minmax(180px,0.85fr)_minmax(0,1.15fr)]">
        <div className="relative mx-auto h-52 w-full max-w-60" data-chart-engine="recharts" role="img" aria-label={`แผนภูมิโดนัท ${title}`}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 240, height: 208 }}>
            <PieChart>
              <Pie data={segments} dataKey="value" nameKey="displayLabel" cx="50%" cy="50%" innerRadius="62%" outerRadius="88%" paddingAngle={2} cornerRadius={4} stroke="#FFFFFF" strokeWidth={2} isAnimationActive={false}>
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
        <ul className="divide-y divide-slate-100">
          {segments.map((segment) => <li key={segment.label} className="flex min-h-11 items-center gap-3 py-2"><span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: segment.color }} /><span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700">{segment.displayLabel}</span><span className="shrink-0 text-right"><strong className="block text-sm font-black tabular-nums text-slate-950">{segment.value.toLocaleString("th-TH")}</strong><span className="block text-xs tabular-nums text-slate-500">{(segment.share * 100).toFixed(1)}%</span></span></li>)}
        </ul>
      </div>
      <table className="sr-only" aria-label={`ข้อมูล${title}`}><thead><tr><th>รายการ</th><th>จำนวน</th><th>สัดส่วน</th></tr></thead><tbody>{segments.map((segment) => <tr key={`table-${segment.label}`}><td>{segment.displayLabel}</td><td>{segment.value}</td><td>{(segment.share * 100).toFixed(1)}%</td></tr>)}</tbody></table>
      {footerNote ? <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">{footerNote}</p> : null}
    </section>
  );
}
