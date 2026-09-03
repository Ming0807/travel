"use client";

import { useId } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { AttractionAnalyticsViewModel } from "@/lib/services/attraction-analytics.service";

type ScoreMetric = AttractionAnalyticsViewModel["satisfaction"][number];

const SCORE_COLORS = ["#D94717", "#0A6B62", "#D6A13D", "#3E7A4F", "#64748B", "#E78A6D", "#4F8E88"];

export function AttractionScoreChart({ metrics }: { metrics: ScoreMetric[] }) {
  const headingId = useId();
  const chartData = metrics.filter((metric) => !metric.suppressed && metric.value !== null).map((metric) => ({ ...metric, score: metric.value ?? 0, displayValue: `${metric.value?.toFixed(2)} / 5` }));
  const chartHeight = Math.max(260, chartData.length * 48 + 44);

  return (
    <section className="min-w-0 rounded-md border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby={headingId}>
      <div className="border-b border-slate-100 pb-3">
        <p className="text-[11px] font-black uppercase text-[#B94727]">Experience quality</p>
        <h2 id={headingId} className="mt-1 text-lg font-black text-slate-950">คุณภาพประสบการณ์</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">แต่ละมิติใช้ตัวหารของตัวเอง และปกปิดค่าเฉลี่ยเมื่อฐานต่ำกว่าเกณฑ์</p>
      </div>

      {chartData.length === 0 ? (
        <p className="mt-4 border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">ยังไม่มีมิติที่มีฐานเพียงพอสำหรับแสดงค่าเฉลี่ย</p>
      ) : (
        <div className="mt-4 min-w-0" data-chart-engine="recharts" role="img" aria-label="กราฟคะแนนคุณภาพประสบการณ์" style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 620, height: chartHeight }}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 66, bottom: 4, left: 0 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }} />
              <YAxis type="category" dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#334155", fontSize: 11, fontWeight: 700 }} width={118} />
              <Tooltip cursor={{ fill: "#F8FAFC" }} contentStyle={{ background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 5, boxShadow: "0 4px 8px rgba(15,23,42,0.10)", fontSize: 12 }} formatter={(value) => [`${Number(value).toFixed(2)} / 5`, "คะแนนเฉลี่ย"]} />
              <Bar dataKey="score" barSize={18} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                {chartData.map((metric, index) => <Cell key={`score-${metric.key}-${index}`} fill={SCORE_COLORS[index % SCORE_COLORS.length]} />)}
                <LabelList dataKey="displayValue" position="right" fill="#0F172A" fontSize={11} fontWeight={800} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <details className="mt-3 border-t border-slate-100 pt-2">
        <summary className="min-h-11 cursor-pointer py-2 text-xs font-semibold text-[#B94727]">ดูฐานคำตอบรายมิติ</summary>
        <div className="overflow-x-auto">
          <table className="w-full min-w-96 text-sm"><thead><tr className="border-b border-slate-200 text-left text-xs text-slate-500"><th className="py-2 pr-4">มิติ</th><th className="py-2 text-right">ฐาน</th><th className="py-2 text-right">คะแนน</th></tr></thead><tbody>{metrics.map((metric) => <tr key={`score-table-${metric.key}`} className="border-b border-slate-100"><td className="py-2 pr-4">{metric.label}</td><td className="py-2 text-right tabular-nums">n={metric.sampleSize.toLocaleString("th-TH")}</td><td className="py-2 text-right font-bold tabular-nums">{metric.suppressed ? "ปกปิด" : metric.value === null ? "N/A" : `${metric.value.toFixed(2)} / 5`}</td></tr>)}</tbody></table>
        </div>
      </details>
    </section>
  );
}
