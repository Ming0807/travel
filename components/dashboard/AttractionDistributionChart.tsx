"use client";

import { useId } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { AttractionAnalyticsViewModel } from "@/lib/services/attraction-analytics.service";
import { CompactBarList } from "@/components/dashboard/CompactBarList";
import { useWideDashboardChart } from "@/components/dashboard/useWideDashboardChart";
import { DASHBOARD_CHART_COLORS as BAR_COLORS, DASHBOARD_CHART_TOOLTIP, formatChartAxisLabel } from "@/components/dashboard/dashboard-chart-theme";

type DistributionRow = AttractionAnalyticsViewModel["audience"]["ageGroups"][number];


export function AttractionDistributionChart({ title, description, rows }: { title: string; description: string; rows: DistributionRow[] }) {
  const headingId = useId();
  const showWideChart = useWideDashboardChart();
  const denominator = rows[0]?.denominator ?? 0;
  const visibleRows = rows.filter((row) => !row.suppressed && row.count !== null);
  const suppressedRows = rows.filter((row) => row.suppressed);
  const chartData = visibleRows.map((row) => ({
    ...row,
    value: row.count ?? 0,
    displayValue: row.percent === null ? `${row.count?.toLocaleString("th-TH")}` : `${row.count?.toLocaleString("th-TH")} (${row.percent}%)`,
  }));
  const chartHeight = Math.max(216, chartData.length * 48 + 44);

  return (
    <section aria-labelledby={headingId} className="min-w-0 rounded-md border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="min-w-0">
          <h3 id={headingId} className="font-black text-slate-950">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <span className="shrink-0 rounded-sm bg-orange-50 px-2 py-1 text-xs font-black tabular-nums text-[#9A3412]">n={denominator.toLocaleString("th-TH")}</span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">ยังไม่มีคำตอบในมิตินี้</p>
      ) : chartData.length === 0 ? (
        <p className="mt-4 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">ข้อมูลทุกหมวดมีขนาดต่ำกว่าเกณฑ์ จึงไม่สร้างกราฟเพื่อป้องกันการอนุมานกลับถึงกลุ่มย่อย</p>
      ) : (
        <>
        <div className="mt-4 sm:hidden"><CompactBarList items={chartData.map((row, index) => ({ key: `${row.label}-${index}`, label: row.label, value: row.value, displayValue: row.displayValue, color: BAR_COLORS[index % BAR_COLORS.length] }))} /></div>
        <div className="mt-4 hidden min-w-0 sm:block" data-chart-engine="recharts" role="img" aria-label={`กราฟแจกแจง ${title}`} style={{ height: chartHeight }}>
          {showWideChart ? <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 620, height: chartHeight }}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 74, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }} />
              <YAxis type="category" dataKey="label" tickFormatter={formatChartAxisLabel} axisLine={false} tickLine={false} tick={{ fill: "#334155", fontSize: 11, fontWeight: 700 }} width={118} />
              <Tooltip cursor={{ fill: "#F8FAFC" }} contentStyle={DASHBOARD_CHART_TOOLTIP} formatter={(value) => [`${Number(value).toLocaleString("th-TH")} คำตอบ`, "จำนวน"]} />
              <Bar dataKey="value" barSize={18} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                {chartData.map((row, index) => <Cell key={`distribution-${row.label}-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />)}
                <LabelList dataKey="displayValue" position="right" fill="#0F172A" fontSize={11} fontWeight={800} />
              </Bar>
            </BarChart>
          </ResponsiveContainer> : null}
        </div>
        </>
      )}

      {suppressedRows.length > 0 ? <p className="mt-3 border-l-2 border-amber-400 pl-3 text-xs leading-5 text-slate-600">มี {suppressedRows.length.toLocaleString("th-TH")} กลุ่มที่ไม่แสดงบนกราฟ เนื่องจากมีขนาดต่ำกว่าเกณฑ์ความเป็นส่วนตัว</p> : null}

      {rows.length > 0 ? (
        <details className="mt-3 border-t border-slate-100 pt-2">
          <summary className="min-h-11 cursor-pointer py-2 text-xs font-semibold text-[#B94727]">ดูเป็นตารางข้อมูล</summary>
          <div className="overflow-x-auto">
            <table className="w-full min-w-80 text-sm">
              <thead><tr className="border-b border-slate-200 text-left text-xs text-slate-500"><th className="py-2 pr-4">รายการ</th><th className="py-2 text-right">จำนวนและสัดส่วน</th></tr></thead>
              <tbody>{rows.map((row, index) => <tr key={`distribution-table-${row.label}-${index}`} className="border-b border-slate-100"><td className="py-2 pr-4">{row.label}</td><td className="py-2 text-right font-bold tabular-nums">{row.suppressed ? "ปกปิด" : `${row.count?.toLocaleString("th-TH")} (${row.percent}%)`}</td></tr>)}</tbody>
            </table>
          </div>
        </details>
      ) : null}
    </section>
  );
}
