"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DistributionEvidenceStrip } from "@/components/dashboard/DistributionEvidenceStrip";
import { CompactBarList } from "@/components/dashboard/CompactBarList";
import { useWideDashboardChart } from "@/components/dashboard/useWideDashboardChart";
import { DASHBOARD_CHART_AXIS_TICK, DASHBOARD_CHART_CATEGORY_TICK, DASHBOARD_CHART_COLORS as BAR_COLORS, DASHBOARD_CHART_TOKENS, DASHBOARD_CHART_TOOLTIP, formatChartAxisLabel } from "@/components/dashboard/dashboard-chart-theme";
import { localizeDashboardLabel } from "@/components/dashboard/dashboard-localization";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { SmallSampleWarning } from "@/components/dashboard/SmallSampleWarning";
import { DASHBOARD_MIN_SAMPLE_SIZE } from "@/constants/dashboard-metrics";
import type { DistributionItem } from "@/types/dashboard";


type BarChartCardProps = {
  title: string;
  definition: string;
  data: DistributionItem[];
  emptyDescription: string;
  sampleCount?: number;
  sampleLabel?: string;
  denominatorCount?: number;
  interpretation?: string;
};

export function BarChartCard({
  title,
  definition,
  data,
  emptyDescription,
  sampleCount,
  sampleLabel = "คำตอบ",
  denominatorCount,
  interpretation,
}: BarChartCardProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const showWideChart = useWideDashboardChart();
  const visible = data.slice(0, 8);
  const chartData = visible.map((item) => ({
    ...item,
    displayLabel: localizeDashboardLabel(item.label),
    displayValue: item.percent !== null
      ? `${item.value.toLocaleString("th-TH")} (${Math.round(item.percent * 100)}%)`
      : item.value.toLocaleString("th-TH"),
  }));
  const tableData = selectedLabel === null
    ? visible
    : visible.filter((item) => item.label === selectedLabel);
  const chartHeight = Math.max(220, visible.length * 48 + 36);

  return (
    <section className="min-w-0 rounded-md border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <h2 className="text-base font-black text-slate-950">{title}</h2>
        <MetricTooltip definition={definition} />
      </div>
      {visible.length === 0 ? (
        <div className="mt-4"><NoDataState description={emptyDescription} /></div>
      ) : (
        <>
          {sampleCount !== undefined && denominatorCount !== undefined && interpretation ? (
            <DistributionEvidenceStrip answeredCount={sampleCount} denominatorCount={denominatorCount} interpretation={interpretation} />
          ) : sampleCount !== undefined && sampleCount < DASHBOARD_MIN_SAMPLE_SIZE ? <div className="mt-3"><SmallSampleWarning count={sampleCount} label={sampleLabel} /></div> : null}
          <div className="mt-4 sm:hidden"><CompactBarList items={chartData.map((item, index) => ({ key: item.label, label: item.displayLabel, value: item.value, displayValue: item.displayValue, color: BAR_COLORS[index % BAR_COLORS.length] }))} onSelect={setSelectedLabel} /></div>
          <div className="mt-4 hidden min-w-0 sm:block" data-chart-engine="recharts" role="img" aria-label={`กราฟแท่ง ${title}`} style={{ height: chartHeight }}>
            {showWideChart ? <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 600, height: chartHeight }}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 58, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={DASHBOARD_CHART_TOKENS.grid} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={DASHBOARD_CHART_AXIS_TICK} />
                <YAxis type="category" dataKey="displayLabel" tickFormatter={formatChartAxisLabel} axisLine={false} tickLine={false} tick={DASHBOARD_CHART_CATEGORY_TICK} width={112} />
                <Tooltip cursor={{ fill: DASHBOARD_CHART_TOKENS.cursor }} contentStyle={DASHBOARD_CHART_TOOLTIP} formatter={(value) => [`${Number(value).toLocaleString("th-TH")} รายการ`, "จำนวน"]} />
                <Bar
                  dataKey="value"
                  barSize={18}
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={false}
                  cursor="pointer"
                  onClick={(_entry, index) => setSelectedLabel(visible[index]?.label ?? null)}
                >
                  {chartData.map((item, index) => <Cell key={`bar-${item.label}-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />)}
                  <LabelList dataKey="displayValue" position="right" fill={DASHBOARD_CHART_TOKENS.value} fontSize={11} fontWeight={800} />
                </Bar>
              </BarChart>
            </ResponsiveContainer> : null}
          </div>
          <details className="mt-3 border-t border-slate-100 pt-3" open={selectedLabel === null ? undefined : true}>
            <summary className="min-h-11 cursor-pointer py-2 text-xs font-semibold text-[#B94727]">ดูเป็นตารางข้อมูล</summary>
            {selectedLabel ? (
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 bg-orange-50 px-3 py-2 text-xs text-orange-950">
                <strong>กำลังดูเฉพาะ {localizeDashboardLabel(selectedLabel)}</strong>
                <button className="min-h-8 px-2 font-bold underline underline-offset-2" onClick={() => setSelectedLabel(null)} type="button">แสดงทั้งหมด</button>
              </div>
            ) : null}
            <div className="overflow-x-auto">
              <table className="w-full min-w-80 text-sm">
                <thead><tr className="border-b border-slate-200 text-left text-xs text-slate-500"><th className="py-2 pr-4">รายการ</th><th className="py-2 pr-4">ฐานข้อมูล</th><th className="py-2 text-right">จำนวน</th><th className="py-2 pl-3 text-right">ตรวจรายละเอียด</th></tr></thead>
                <tbody>{tableData.map((item, index) => <tr key={`table-${item.label}-${index}`} className="border-b border-slate-100"><td className="py-2 pr-4">{localizeDashboardLabel(item.label)}</td><td className="py-2 pr-4 text-xs text-slate-500">{item.note ?? "-"}</td><td className="py-2 text-right tabular-nums">{item.value.toLocaleString("th-TH")}</td><td className="py-1 pl-3 text-right"><button type="button" className="min-h-9 whitespace-nowrap px-2 text-xs font-bold text-[#B94727] underline-offset-2 hover:underline" onClick={() => setSelectedLabel(item.label)} aria-label={`ดูรายละเอียดเฉพาะ ${item.label}`}>ดูเฉพาะรายการนี้</button></td></tr>)}</tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
