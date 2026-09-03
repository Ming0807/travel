"use client";

import { ChartScatter, MapPin } from "@phosphor-icons/react/dist/ssr";
import { CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { NoDataState } from "@/components/dashboard/NoDataState";
import type { DashboardViewModel } from "@/types/dashboard";

type RankedAttraction = DashboardViewModel["executive"]["topAttractions"][number];

const POINT_COLORS = ["#D94717", "#0A6B62", "#D6A13D", "#3E7A4F", "#64748B", "#E78A6D"];

export function ExecutiveAttractionMatrix({ attractions }: { attractions: DashboardViewModel["executive"]["topAttractions"] }) {
  const visible = attractions.filter((attraction): attraction is RankedAttraction & { averageSatisfaction: number } => attraction.averageSatisfaction !== null).slice(0, 8);
  const chartData = visible.map((attraction, index) => ({
    ...attraction,
    name: attraction.attractionName,
    visits: attraction.visitCount,
    satisfaction: attraction.averageSatisfaction,
    respondents: Math.max(attraction.surveyResponseCount, 1),
    color: POINT_COLORS[index % POINT_COLORS.length],
  }));
  const averageSatisfaction = chartData.length > 0 ? chartData.reduce((sum, item) => sum + item.satisfaction, 0) / chartData.length : 0;
  const sortedVisits = chartData.map((item) => item.visits).sort((a, b) => a - b);
  const medianVisits = sortedVisits.length > 0 ? sortedVisits[Math.floor(sortedVisits.length / 2)] : 0;

  return (
    <section aria-labelledby="executive-attraction-matrix-heading" className="h-full min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-50 text-[#0A6B62]"><ChartScatter aria-hidden="true" size={18} weight="fill" /></span>
            <h2 id="executive-attraction-matrix-heading" className="text-lg font-black text-slate-950">ผลงานรายสถานที่</h2>
          </div>
          <p className="mt-1.5 text-xs leading-5 text-slate-600">แกนนอนคือรายการเยี่ยมชม แกนตั้งคือความพึงพอใจ และขนาดจุดสะท้อนจำนวนคำตอบ</p>
        </div>
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold tabular-nums text-slate-700">{visible.length.toLocaleString("th-TH")} สถานที่ที่มีคะแนน</span>
      </div>

      {visible.length === 0 ? (
        <div className="p-5"><NoDataState description="ยังไม่มีสถานที่ที่มีทั้งรายการเยี่ยมชมและคะแนนความพึงพอใจ" /></div>
      ) : (
        <>
          <div className="hidden grid-cols-[minmax(0,1.65fr)_minmax(190px,0.75fr)] gap-4 px-4 pb-4 pt-3 sm:grid sm:px-5">
            <div className="h-[19rem] min-w-0" data-chart-engine="recharts" role="img" aria-label="แผนภาพกระจายผลงานรายสถานที่">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 620, height: 304 }}>
                <ScatterChart margin={{ top: 14, right: 20, bottom: 18, left: 0 }}>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="visits" name="รายการเยี่ยมชม" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }} label={{ value: "รายการเยี่ยมชม", position: "insideBottom", offset: -10, fill: "#64748B", fontSize: 11, fontWeight: 700 }} />
                  <YAxis type="number" dataKey="satisfaction" name="ความพึงพอใจ" domain={[1, 5]} tickCount={5} axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }} width={34} />
                  <ZAxis type="number" dataKey="respondents" range={[90, 330]} name="จำนวนคำตอบ" />
                  <ReferenceLine x={medianVisits} stroke="#94A3B8" strokeDasharray="5 5" />
                  <ReferenceLine y={averageSatisfaction} stroke="#D6A13D" strokeDasharray="5 5" />
                  <Tooltip cursor={{ strokeDasharray: "4 4" }} contentStyle={{ background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 5, boxShadow: "0 4px 8px rgba(15,23,42,0.10)", fontSize: 12 }} formatter={(value, name) => {
                    if (name === "ความพึงพอใจ") return [`${Number(value).toFixed(1)} / 5`, name];
                    if (name === "จำนวนคำตอบ") return [`${Number(value).toLocaleString("th-TH")} คำตอบ`, name];
                    return [`${Number(value).toLocaleString("th-TH")} ครั้ง`, name];
                  }} />
                  <Scatter name="สถานที่" data={chartData} isAnimationActive={false}>
                    {chartData.map((item) => <Cell key={`point-${item.rank}-${item.attractionName}`} fill={item.color} stroke="#FFFFFF" strokeWidth={2} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <ol className="divide-y divide-slate-100 self-center" aria-label="คำอธิบายจุดผลงานรายสถานที่">
              {chartData.map((point, index) => <li key={`legend-${point.rank}-${point.attractionName}`} className="flex items-center gap-2.5 py-2"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ backgroundColor: point.color }}>{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-900">{point.attractionName}</p><p className="text-[11px] tabular-nums text-slate-500">{point.visitCount.toLocaleString("th-TH")} ครั้ง · {point.satisfaction.toFixed(1)} / 5</p></div></li>)}
            </ol>
          </div>
          <ol className="space-y-2 px-3 py-3 sm:hidden" aria-label="สรุปผลงานรายสถานที่บนมือถือ">
            {chartData.map((point, index) => <li key={`mobile-${point.rank}-${point.attractionName}`} className="flex items-center gap-3 rounded-[5px] bg-slate-50 px-3 py-2.5"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white" style={{ backgroundColor: point.color }}>{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-900">{point.attractionName}</p><p className="mt-0.5 text-[11px] text-slate-500">{point.provinceName}</p></div><div className="shrink-0 text-right"><strong className="block text-sm tabular-nums text-slate-950">{point.visitCount.toLocaleString("th-TH")} ครั้ง</strong><span className="text-[11px] font-semibold tabular-nums text-[#0A6B62]">{point.satisfaction.toFixed(1)} / 5</span></div></li>)}
          </ol>
          <table className="sr-only" aria-label="ข้อมูลผลงานรายสถานที่"><thead><tr><th>สถานที่</th><th>รายการเยี่ยมชม</th><th>ความพึงพอใจ</th><th>จำนวนคำตอบ</th></tr></thead><tbody>{visible.map((attraction) => <tr key={`matrix-${attraction.rank}-${attraction.attractionName}`}><td>{attraction.attractionName}</td><td>{attraction.visitCount}</td><td>{attraction.averageSatisfaction}</td><td>{attraction.surveyResponseCount}</td></tr>)}</tbody></table>
        </>
      )}
      <div className="grid gap-2 border-t border-slate-100 px-4 py-2.5 text-xs leading-5 text-slate-600 sm:grid-cols-2 sm:px-5"><span className="inline-flex items-center gap-2"><MapPin aria-hidden="true" className="shrink-0 text-[#D94717]" size={14} weight="fill" />คะแนนความพึงพอใจ</span><span className="font-semibold sm:text-right">รายการเยี่ยมชมที่บันทึก</span><p className="sm:col-span-2">เส้นประแบ่งด้วยค่ากลางของชุดข้อมูลที่แสดง ไม่ใช่เกณฑ์ตัดสินคุณภาพ</p></div>
    </section>
  );
}
