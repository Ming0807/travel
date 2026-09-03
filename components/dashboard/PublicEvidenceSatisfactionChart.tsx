"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { PublicEvidenceSatisfaction } from "@/types/public-dashboard";

const SCORE_COLORS = ["#D94717", "#0A6B62", "#D6A13D", "#3E7A4F", "#64748B", "#E78A6D", "#4F8E88"];

export function PublicEvidenceSatisfactionChart({ items, minimum }: { items: PublicEvidenceSatisfaction[]; minimum: number }) {
  const chartData = items.filter((item) => item.status === "available" && item.value !== null).map((item) => ({ ...item, score: item.value ?? 0 }));
  const chartHeight = Math.max(230, chartData.length * 46 + 40);

  return (
    <article className="min-w-0 rounded-md border border-ink/10 bg-white p-5 sm:p-6">
      <p className="text-xs font-black uppercase text-teal">Experience quality</p>
      <h2 className="mt-2 text-2xl font-black">คุณภาพประสบการณ์</h2>
      <p className="mt-2 text-sm leading-6 text-muted">คะแนน 1-5 จากแบบสำรวจโดยสมัครใจ Missing data ไม่ถูกนับเป็นศูนย์</p>

      {chartData.length > 0 ? (
        <div className="mt-5 min-w-0" data-chart-engine="recharts" role="img" aria-label="กราฟคุณภาพประสบการณ์" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 440, height: chartHeight }}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 62, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#E7E5E4" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11, fontWeight: 600 }} />
              <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} width={106} tick={{ fill: "#374151", fontSize: 11, fontWeight: 700 }} />
              <Tooltip cursor={{ fill: "#FAFAF9" }} contentStyle={{ background: "#FFFFFF", border: "1px solid #D6D3D1", borderRadius: 5, boxShadow: "0 4px 8px rgba(28,25,23,0.10)", fontSize: 12 }} formatter={(value) => [`${Number(value).toFixed(2)} / 5`, "คะแนนเฉลี่ย"]} />
              <Bar dataKey="score" barSize={17} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                {chartData.map((item, index) => <Cell key={`public-score-${item.key}-${index}`} fill={SCORE_COLORS[index % SCORE_COLORS.length]} />)}
                <LabelList dataKey="displayValue" position="right" fill="#1C1917" fontSize={11} fontWeight={800} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : <p className="mt-5 border border-dashed border-ink/20 bg-background p-4 text-sm text-muted">ยังไม่มีคะแนนที่ผ่านเกณฑ์ขั้นต่ำ n ≥ {minimum.toLocaleString("th-TH")} สำหรับแสดงกราฟ</p>}

      <details className="mt-3 border-t border-ink/10 pt-2"><summary className="min-h-11 cursor-pointer py-2 text-xs font-bold text-coral">ดูฐานคำตอบรายมิติ</summary><div className="overflow-x-auto"><table className="w-full min-w-96 text-sm" aria-label="ตารางคุณภาพประสบการณ์"><thead><tr className="border-b border-ink/10 text-left text-xs text-muted"><th className="py-2 pr-4">มิติ</th><th className="py-2 text-right">ฐาน</th><th className="py-2 text-right">คะแนน</th></tr></thead><tbody>{items.map((item) => <tr key={`public-score-table-${item.key}`} className="border-b border-ink/10"><td className="py-2 pr-4 font-bold">{item.label}</td><td className="py-2 text-right tabular-nums">{item.sampleSize === null ? "ไม่แสดง" : `n=${item.sampleSize.toLocaleString("th-TH")}`}</td><td className="py-2 text-right font-black tabular-nums">{item.displayValue}</td></tr>)}</tbody></table></div></details>
    </article>
  );
}
