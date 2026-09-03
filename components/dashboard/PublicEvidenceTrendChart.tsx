"use client";

import { useId } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { PublicEvidenceTrendPoint } from "@/types/public-dashboard";

export function PublicEvidenceTrendChart({ points }: { points: PublicEvidenceTrendPoint[] }) {
  const gradientId = `public-trend-${useId().replaceAll(":", "")}`;
  const chartData = points.map((point) => ({ ...point, chartValue: point.status === "available" ? point.value : null }));
  const visiblePointCount = chartData.filter((point) => point.chartValue !== null).length;
  const hasVisibleData = visiblePointCount > 0;

  return (
    <article className="min-w-0 rounded-md border border-ink/10 bg-white p-5 sm:p-7">
      <div className="border-b border-ink/10 pb-4">
        <p className="text-xs font-black uppercase text-teal">Recorded visits</p>
        <h2 id="visit-trend-heading" className="mt-2 text-2xl font-black">แนวโน้มรายการเข้าชมที่บันทึก</h2>
        <p className="mt-2 text-sm leading-6 text-muted">หน่วยคือรายการ visit ที่เกิดหลังผู้ใช้กรอกข้อมูลขั้นต่ำและยินยอม ไม่ใช่ยอดเข้าหน้าเว็บ</p>
      </div>

      {points.length === 0 ? (
        <div className="mt-5 border border-dashed border-ink/20 bg-background px-5 py-10 text-center"><p className="font-black">ยังไม่มีรายการเข้าชมในช่วงข้อมูลนี้</p><p className="mt-2 text-sm text-muted">ระบบจะเริ่มแสดงแนวโน้มเมื่อมี visit ที่บันทึกสำเร็จ</p></div>
      ) : (
        <>
          {hasVisibleData ? (
            <div className="mt-5 h-72 min-w-0" data-chart-engine="recharts" role="img" aria-label="กราฟแนวโน้มรายการเข้าชมที่บันทึก">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 760, height: 288 }}>
                <AreaChart data={chartData} margin={{ top: 12, right: 12, bottom: 4, left: -14 }}>
                  <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0A6B62" stopOpacity={0.34} /><stop offset="100%" stopColor="#0A6B62" stopOpacity={0.03} /></linearGradient></defs>
                  <CartesianGrid stroke="#E7E5E4" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={22} tick={{ fill: "#6B7280", fontSize: 11, fontWeight: 600 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 11, fontWeight: 600 }} />
                  <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #D6D3D1", borderRadius: 5, boxShadow: "0 4px 8px rgba(28,25,23,0.10)", fontSize: 12 }} formatter={(value) => [`${Number(value).toLocaleString("th-TH")} รายการ`, "รายการเข้าชม"]} />
                  <Area type="monotone" dataKey="chartValue" stroke="#0A6B62" strokeWidth={3} fill={`url(#${gradientId})`} dot={{ r: 4, fill: "#FFFFFF", stroke: "#D94717", strokeWidth: 2 }} activeDot={{ r: 5, fill: "#D94717", stroke: "#FFFFFF", strokeWidth: 2 }} connectNulls={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="mt-5 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">ข้อมูลในช่วงนี้มีเฉพาะกลุ่มย่อยที่ต่ำกว่าเกณฑ์ จึงไม่วาดค่าลงบนกราฟ</p>}

          {visiblePointCount === 1 ? <p className="mt-3 border-l-2 border-amber-400 pl-3 text-xs leading-5 text-muted">มีจุดข้อมูลที่เปิดเผยได้เพียง 1 วัน จึงแสดงเพื่อยืนยันจำนวนเท่านั้น และยังไม่ควรตีความเป็นแนวโน้ม</p> : null}

          <details className="mt-4 border-t border-ink/10 pt-2" open={!hasVisibleData}>
            <summary className="min-h-11 cursor-pointer py-2 text-xs font-bold text-coral">ดูตารางและสถานะข้อมูล</summary>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-left text-sm" aria-label="แนวโน้มรายการเข้าชมที่บันทึก">
                <thead className="border-y border-ink/10 bg-background text-xs text-muted"><tr><th className="px-3 py-2.5 font-bold">วันที่</th><th className="px-3 py-2.5 text-right font-bold">รายการเข้าชม</th><th className="px-3 py-2.5 text-right font-bold">สถานะข้อมูล</th></tr></thead>
                <tbody className="divide-y divide-ink/10">{points.map((point) => <tr key={point.isoDate}><th scope="row" className="px-3 py-3 font-bold">{point.label}</th><td className="px-3 py-3 text-right tabular-nums">{point.displayValue}</td><td className="px-3 py-3 text-right text-muted">{point.status === "suppressed" ? "ปกปิด cell เล็ก" : point.status === "no_data" ? "ไม่มีรายการ" : "แสดงได้"}</td></tr>)}</tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </article>
  );
}
