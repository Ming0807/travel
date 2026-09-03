"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { PublicEvidenceDistributionGroup } from "@/types/public-dashboard";

const BAR_COLORS = ["#D94717", "#0A6B62", "#D6A13D", "#3E7A4F", "#64748B", "#E78A6D"];

export function PublicEvidenceDistributionChart({ group }: { group: PublicEvidenceDistributionGroup }) {
  const visibleItems = group.items.filter((item) => item.status === "available" && item.value !== null);
  const suppressedCount = group.items.filter((item) => item.status === "suppressed").length;
  const chartData = visibleItems.map((item) => ({ ...item, chartValue: item.value ?? 0 }));
  const chartHeight = Math.max(210, chartData.length * 46 + 40);

  return (
    <article className="min-w-0 rounded-md border border-ink/10 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-1 border-b border-ink/10 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div><h3 className="text-base font-black text-ink">{group.label}</h3><p className="mt-1 text-xs leading-5 text-muted">{group.definition}</p></div>
        <p className="shrink-0 text-xs font-bold text-teal">แหล่งข้อมูล: {group.source}</p>
      </div>

      {chartData.length > 0 ? (
        <div className="mt-4 min-w-0" data-chart-engine="recharts" role="img" aria-label={`กราฟ${group.label}`} style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 560, height: chartHeight }}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 72, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#E7E5E4" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11, fontWeight: 600 }} />
              <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} width={112} tick={{ fill: "#374151", fontSize: 11, fontWeight: 700 }} />
              <Tooltip cursor={{ fill: "#FAFAF9" }} contentStyle={{ background: "#FFFFFF", border: "1px solid #D6D3D1", borderRadius: 5, boxShadow: "0 4px 8px rgba(28,25,23,0.10)", fontSize: 12 }} formatter={(value) => [`${Number(value).toLocaleString("th-TH")} รายการ`, "จำนวน"]} />
              <Bar dataKey="chartValue" barSize={17} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                {chartData.map((item, index) => <Cell key={`public-distribution-${group.key}-${item.label}-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />)}
                <LabelList dataKey="displayValue" position="right" fill="#1C1917" fontSize={11} fontWeight={800} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="mt-4 border border-dashed border-ink/20 bg-background p-4 text-sm text-muted">ยังไม่มีข้อมูลที่ผ่านเกณฑ์สำหรับแสดงกราฟ</p>}

      {suppressedCount > 0 ? <p className="mt-3 border-l-2 border-coral pl-3 text-xs leading-5 text-muted">ไม่แสดง {suppressedCount.toLocaleString("th-TH")} กลุ่มบนกราฟ เพราะมีขนาดต่ำกว่าเกณฑ์เผยแพร่</p> : null}
      <details className="mt-3 border-t border-ink/10 pt-2"><summary className="min-h-11 cursor-pointer py-2 text-xs font-bold text-coral">ดูเป็นตารางข้อมูล</summary><div className="overflow-x-auto"><table className="w-full min-w-[420px] border-collapse text-left text-sm" aria-label={`ตาราง${group.label}`}><thead className="border-y border-ink/10 bg-background text-xs text-muted"><tr><th className="px-3 py-2.5 font-bold">กลุ่ม</th><th className="px-3 py-2.5 text-right font-bold">จำนวน</th><th className="px-3 py-2.5 text-right font-bold">สัดส่วน</th></tr></thead><tbody className="divide-y divide-ink/10">{group.items.map((item, index) => <tr key={`public-distribution-table-${group.key}-${item.label}-${index}`}><th scope="row" className="px-3 py-3 font-bold text-ink">{item.label}</th><td className="px-3 py-3 text-right tabular-nums text-ink">{item.displayValue}</td><td className="px-3 py-3 text-right tabular-nums text-muted">{item.percent === null ? "ไม่แสดง" : `${Math.round(item.percent * 100)}%`}</td></tr>)}</tbody></table></div></details>
    </article>
  );
}
