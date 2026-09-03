"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartLineUp } from "@phosphor-icons/react/dist/ssr";
import { NoDataState } from "@/components/dashboard/NoDataState";
import type { TrendPoint } from "@/types/dashboard";

function formatDateLabel(raw: string): string {
  const date = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("th-TH", { month: "short", day: "numeric" });
}

function formatDateFull(raw: string): string {
  const date = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("th-TH", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function TrendChart({ points }: { points: TrendPoint[] }) {
  const total = useMemo(() => points.reduce((sum, point) => sum + point.value, 0), [points]);
  const peak = useMemo(() => points.reduce<TrendPoint | null>((best, point) => (
    best === null || point.value > best.value ? point : best
  ), null), [points]);
  const chartData = useMemo(() => points.map((point) => ({
    ...point,
    dateLabel: formatDateLabel(point.label),
    fullDate: formatDateFull(point.label),
  })), [points]);

  if (points.length === 0) {
    return (
      <section className="h-full rounded-md border border-slate-200 bg-white p-4 sm:p-5">
        <h2 className="text-base font-bold text-slate-950">แนวโน้มรายการเข้าชม</h2>
        <p className="mt-1 text-xs leading-5 text-slate-600">นับรายการเยี่ยมชมที่ระบบบันทึกสำเร็จ ไม่ใช่ยอดเปิดหน้าเว็บสาธารณะ และไม่ใช่จำนวนสแกน QR</p>
        <div className="mt-4"><NoDataState description="ยังไม่มีรายการเข้าชมในช่วงวันที่ที่เลือก" /></div>
      </section>
    );
  }

  return (
    <section className="h-full min-w-0 rounded-md border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm bg-[#D94717]" />
            <h2 className="text-lg font-black text-slate-950">แนวโน้มรายการเข้าชม</h2>
          </div>
          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-600">นับรายการเยี่ยมชมที่ระบบบันทึกสำเร็จหลังส่งข้อมูลขั้นต่ำ ไม่ใช่ยอดเปิดหน้าเว็บสาธารณะ และไม่ใช่จำนวนสแกน QR</p>
        </div>
        <div className="flex divide-x divide-slate-200 rounded-[5px] border border-slate-200 bg-slate-50">
          <div className="flex min-h-12 items-center gap-2 px-3 text-[#0A6B62]">
            <ChartLineUp aria-hidden="true" size={18} weight="bold" />
            <span>
              <span className="block text-xs font-semibold">รวมในช่วงที่เลือก</span>
              <strong className="block text-base font-black tabular-nums">{total.toLocaleString("th-TH")} ครั้ง</strong>
            </span>
          </div>
          {peak ? (
            <div className="min-h-12 px-3 py-1.5">
              <span className="block text-xs font-semibold text-slate-600">สูงสุดต่อวัน</span>
              <strong className="block text-base font-black tabular-nums text-slate-950">{peak.value.toLocaleString("th-TH")} ครั้ง</strong>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="mt-3 h-52 min-w-0 sm:h-[18rem]"
        data-chart-engine="recharts"
        role="img"
        aria-label="กราฟแนวโน้มรายการเข้าชมตามวันที่"
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 800, height: 288 }}>
          <AreaChart data={chartData} margin={{ top: 12, right: 10, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="visitTrendFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#D94717" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#D94717" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }} minTickGap={24} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 600 }} width={42} />
            <Tooltip
              cursor={{ stroke: "#94A3B8", strokeDasharray: "4 4" }}
              contentStyle={{ background: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: 5, boxShadow: "0 4px 8px rgba(15,23,42,0.10)", fontSize: 12 }}
              formatter={(value) => [`${Number(value).toLocaleString("th-TH")} ครั้ง`, "รายการเข้าชม"]}
              labelFormatter={(_, payload) => payload[0]?.payload?.fullDate ?? ""}
            />
            <Area
              dataKey="value"
              fill="url(#visitTrendFill)"
              isAnimationActive={false}
              name="รายการเข้าชม"
              stroke="#D94717"
              strokeWidth={3}
              type="monotone"
              activeDot={{ r: 6, fill: "#0A6B62", stroke: "#FFFFFF", strokeWidth: 3 }}
              dot={{ r: 4, fill: "#D94717", stroke: "#FFFFFF", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-3 border-t border-slate-100 pt-3">
        <summary className="min-h-11 cursor-pointer py-2 text-xs font-semibold text-[#B94727]">ดูตารางแนวโน้ม</summary>
        <div className="max-h-56 overflow-auto">
          <table aria-label="ข้อมูลแนวโน้มรายการเข้าชม" className="w-full min-w-80 text-sm">
            <thead className="sticky top-0 bg-white text-left text-xs text-slate-600">
              <tr className="border-b border-slate-200"><th className="py-2 pr-4">วันที่</th><th className="py-2 text-right">รายการเข้าชม</th></tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={`trend-row-${point.label}`} className="border-b border-slate-100">
                  <td className="py-2 pr-4 text-slate-700">{formatDateFull(point.label)}</td>
                  <td className="py-2 text-right font-semibold tabular-nums text-slate-950">{point.value.toLocaleString("th-TH")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
