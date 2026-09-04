"use client";

import { ChartScatter, MapPin } from "@phosphor-icons/react/dist/ssr";
import { CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { useWideDashboardChart } from "@/components/dashboard/useWideDashboardChart";
import { DASHBOARD_CHART_COLORS as POINT_COLORS, DASHBOARD_CHART_TOOLTIP } from "@/components/dashboard/dashboard-chart-theme";
import { DASHBOARD_MIN_SAMPLE_SIZE } from "@/constants/dashboard-metrics";
import type { DashboardViewModel } from "@/types/dashboard";

type RankedAttraction = DashboardViewModel["executive"]["topAttractions"][number];

export function ExecutiveAttractionMatrix({ attractions }: { attractions: DashboardViewModel["executive"]["topAttractions"] }) {
  const showWideChart = useWideDashboardChart();
  const visible = attractions.filter((attraction): attraction is RankedAttraction & { averageSatisfaction: number } => attraction.averageSatisfaction !== null && Number.isFinite(attraction.averageSatisfaction) && attraction.averageSatisfaction >= 1 && attraction.averageSatisfaction <= 5 && attraction.surveyResponseCount >= DASHBOARD_MIN_SAMPLE_SIZE).slice(0, 8);
  const eligible = new Set<RankedAttraction>(visible);
  const pending = attractions.filter((attraction) => !eligible.has(attraction)).slice(0, 8);
  const chartData = visible.map((attraction, index) => ({
    ...attraction,
    name: attraction.attractionName,
    visits: attraction.visitCount,
    satisfaction: attraction.averageSatisfaction,
    respondents: attraction.surveyResponseCount,
    color: POINT_COLORS[index % POINT_COLORS.length],
  }));
  const averageSatisfaction = chartData.length > 0 ? chartData.reduce((sum, item) => sum + item.satisfaction, 0) / chartData.length : 0;
  const sortedVisits = chartData.map((item) => item.visits).sort((a, b) => a - b);
  const middle = Math.floor(sortedVisits.length / 2);
  const medianVisits = sortedVisits.length === 0 ? 0 : sortedVisits.length % 2 === 0 ? (sortedVisits[middle - 1] + sortedVisits[middle]) / 2 : sortedVisits[middle];
  const canCompare = visible.length >= 2;

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
        <div className="p-5"><NoDataState description="ยังไม่มีสถานที่ที่มีฐานคำตอบเพียงพอสำหรับเปรียบเทียบคะแนน" /></div>
      ) : (
        <>
          <div className="hidden px-4 pb-2 pt-3 sm:block sm:px-5">
            <div className="h-[19rem] min-w-0" data-chart-engine="recharts" role="img" aria-label="แผนภาพกระจายผลงานรายสถานที่">
              {showWideChart ? <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 620, height: 304 }}>
                <ScatterChart margin={{ top: 14, right: 20, bottom: 18, left: 0 }}>
                  <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="visits" name="รายการเยี่ยมชม" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }} label={{ value: "รายการเยี่ยมชม", position: "insideBottom", offset: -10, fill: "#64748B", fontSize: 11, fontWeight: 700 }} />
                  <YAxis type="number" dataKey="satisfaction" name="ความพึงพอใจ" domain={[1, 5]} tickCount={5} axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }} width={34} />
                  <ZAxis type="number" dataKey="respondents" range={[90, 330]} name="จำนวนคำตอบ" />
                  {canCompare ? <ReferenceLine x={medianVisits} stroke="#94A3B8" strokeDasharray="5 5" /> : null}
                  {canCompare ? <ReferenceLine y={averageSatisfaction} stroke="#D6A13D" strokeDasharray="5 5" /> : null}
                  <Tooltip cursor={{ strokeDasharray: "4 4" }} content={({ active, payload }) => {
                    const point = chartData.find((item) => item === payload?.[0]?.payload);
                    if (!active || !point) return null;
                    return <div className="max-w-64 p-3 text-slate-900" style={DASHBOARD_CHART_TOOLTIP}><p className="break-words font-bold">{point.attractionName}</p><dl className="mt-2 space-y-1"><div className="flex justify-between gap-4"><dt>รายการเยี่ยมชม</dt><dd>{point.visits.toLocaleString("th-TH")} ครั้ง</dd></div><div className="flex justify-between gap-4"><dt>ความพึงพอใจ</dt><dd>{point.satisfaction.toFixed(1)} / 5</dd></div><div className="flex justify-between gap-4"><dt>จำนวนคำตอบ</dt><dd>{point.respondents.toLocaleString("th-TH")}</dd></div></dl></div>;
                  }} />
                  <Scatter name="สถานที่" data={chartData} isAnimationActive={false}>
                    {chartData.map((item) => <Cell key={`point-${item.rank}-${item.attractionName}`} fill={item.color} stroke="#FFFFFF" strokeWidth={2} />)}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer> : null}
            </div>
          </div>
          <ol className="divide-y divide-slate-100 px-4 pb-3 sm:px-5" aria-label="สรุปผลงานรายสถานที่">
            {chartData.map((point, index) => <li key={`legend-${point.rank}-${point.attractionName}`} className="flex items-start gap-3 py-2.5"><span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: point.color }} /><div className="min-w-0 flex-1"><p className="break-words text-sm font-semibold text-slate-900">{index + 1}. {point.attractionName}</p><p className="mt-0.5 text-xs text-slate-600">{point.surveyResponseCount.toLocaleString("th-TH")} คำตอบ</p></div><div className="shrink-0 text-right"><strong className="block text-sm tabular-nums text-slate-950">{point.visitCount.toLocaleString("th-TH")} ครั้ง</strong><span className="text-xs font-semibold tabular-nums text-[#0A6B62]">{point.satisfaction.toFixed(1)} / 5</span></div></li>)}
          </ol>
          <div className="sr-only"><table aria-label="ข้อมูลผลงานรายสถานที่"><thead><tr><th>สถานที่</th><th>รายการเยี่ยมชม</th><th>ความพึงพอใจ</th><th>จำนวนคำตอบ</th></tr></thead><tbody>{visible.map((attraction) => <tr key={`matrix-${attraction.rank}-${attraction.attractionName}`}><td>{attraction.attractionName}</td><td>{attraction.visitCount}</td><td>{attraction.averageSatisfaction}</td><td>{attraction.surveyResponseCount}</td></tr>)}</tbody></table></div>
        </>
      )}
      {pending.length > 0 ? <div className="border-t border-slate-100 px-4 py-3 sm:px-5"><h3 className="text-xs font-bold text-slate-700">ยังไม่มีคะแนนที่ใช้เปรียบเทียบได้</h3><ul className="mt-2 space-y-2 text-xs text-slate-600">{pending.map((item) => <li key={`pending-${item.rank}-${item.attractionName}`} className="flex justify-between gap-3"><span className="min-w-0 break-words">{item.attractionName}</span><span className="shrink-0 tabular-nums">{item.visitCount.toLocaleString("th-TH")} ครั้ง</span></li>)}</ul></div> : null}
      <div className="grid gap-2 border-t border-slate-100 px-4 py-2.5 text-xs leading-5 text-slate-600 sm:grid-cols-2 sm:px-5"><span className="inline-flex items-center gap-2"><MapPin aria-hidden="true" className="shrink-0 text-[#D94717]" size={14} weight="fill" />คะแนนความพึงพอใจ</span><span className="font-semibold sm:text-right">รายการเยี่ยมชมที่บันทึก</span><p className="sm:col-span-2">{canCompare ? `เส้นประ: มัธยฐานการเยี่ยมชม ${medianVisits.toLocaleString("th-TH")} ครั้ง และค่าเฉลี่ยคะแนนรายสถานที่ ${averageSatisfaction.toFixed(2)} / 5 เฉพาะ ${visible.length} สถานที่ที่แสดง ไม่ใช่เกณฑ์ตัดสินคุณภาพ` : "ยังไม่แสดงเส้นเปรียบเทียบ ต้องมีสถานที่ที่มีฐานคะแนนเพียงพออย่างน้อย 2 แห่ง"}</p><p className="sm:col-span-2">แสดงจุดเมื่อมีคำตอบอย่างน้อย {DASHBOARD_MIN_SAMPLE_SIZE} รายการต่อสถานที่</p></div>
    </section>
  );
}
