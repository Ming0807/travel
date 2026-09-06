"use client";

import { useId, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AttractionAnalyticsViewModel } from "@/lib/services/attraction-analytics.service";
import { DASHBOARD_CHART_AXIS_TICK, DASHBOARD_CHART_TOKENS as colors, DASHBOARD_CHART_TOOLTIP } from "./dashboard-chart-theme";

type Channels = AttractionAnalyticsViewModel["channels"];
const stateCopy = {
  tracking_not_activated: "ยังไม่เปิดเก็บช่องทาง QR / NFC",
  no_entries: "ยังไม่มีรอบเข้าใช้งานในช่วงวันที่เลือก",
  unclassified_only: "ข้อมูลช่องทางยังรอระบุขอบเขตการเก็บ",
  no_entries_in_scope: "ยังไม่มีรอบเข้าใช้งานในขอบเขตนี้",
} as const;
const display = (value: number | null, suffix = "") => value === null ? "ยังไม่แสดง" : `${value.toLocaleString("th-TH")}${suffix}`;

export function AttractionChannelPanel({ data, incomplete = false }: { data: Channels; incomplete?: boolean }) {
  const id = useId();
  const [view, setView] = useState<"trend" | "conversion">("trend");
  const ready = data.status === "ready" && !incomplete;
  const conversions = [
    { stage: "บันทึกเช็กอิน", qr: data.channels.find((row) => row.channel === "qr")?.visitConversion ?? null, nfc: data.channels.find((row) => row.channel === "nfc")?.visitConversion ?? null },
    { stage: "รับใบประกาศ", qr: data.channels.find((row) => row.channel === "qr")?.certificateConversion ?? null, nfc: data.channels.find((row) => row.channel === "nfc")?.certificateConversion ?? null },
    { stage: "ตอบแบบสำรวจ", qr: data.channels.find((row) => row.channel === "qr")?.surveyConversion ?? null, nfc: data.channels.find((row) => row.channel === "nfc")?.surveyConversion ?? null },
  ];
  const chartRows = view === "trend" ? data.daily : conversions;
  const hasValues = chartRows.some((row) => row.qr !== null || row.nfc !== null);

  return (
    <section aria-labelledby={id} className="min-w-0 border-y border-slate-200 bg-white px-4 py-5 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 id={id} className="text-xl font-black text-slate-950">ช่องทางเริ่มเข้าใช้งาน</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">QR Code และ NFC ตั้งแต่เปิดจุดเช็กอินจนถึงผลลัพธ์ของแต่ละรอบ</p>
        </div>
        {ready ? <div className="flex gap-1 rounded-md bg-slate-100 p-1" aria-label="มุมมองช่องทาง">
          <button type="button" aria-pressed={view === "trend"} onClick={() => setView("trend")} className={`min-h-11 rounded px-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-orange-600 ${view === "trend" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"}`}>แนวโน้ม</button>
          <button type="button" aria-pressed={view === "conversion"} onClick={() => setView("conversion")} className={`min-h-11 rounded px-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-orange-600 ${view === "conversion" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"}`}>ผลสำเร็จ</button>
        </div> : null}
      </div>

      {!ready ? <div className="mt-5 border-l-2 border-amber-500 bg-amber-50 px-4 py-4">
        <p className="font-bold text-amber-950">{incomplete ? "ข้อมูลยังอ่านไม่ครบ กรุณาลดช่วงวันที่" : data.status !== "ready" ? stateCopy[data.status] : "ยังไม่พร้อมแสดงผล"}</p>
        <p className="mt-1 text-sm leading-6 text-amber-900">{data.status === "unclassified_only" ? "ต้องระบุภาคสนาม, Pilot หรือสถานการณ์จำลองก่อนนำไปสรุปงานวิจัย" : "เมื่อมีข้อมูลครบตามขอบเขตที่เลือก จะแสดงแนวโน้มและอัตราทำขั้นตอนสำเร็จที่นี่"}</p>
      </div> : <>
        <div className="mt-5 grid grid-cols-2 gap-5 border-y border-slate-100 py-4">
          {data.channels.map((row) => <div key={row.channel}>
            <p className="flex items-center gap-2 text-sm font-bold text-slate-700"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: row.channel === "qr" ? colors.accent : colors.teal }} />{row.channel === "qr" ? "QR Code" : "NFC"}</p>
            <p className="mt-2 text-2xl font-black tabular-nums text-slate-950">{display(row.entries)} <span className="text-xs font-medium text-slate-500">รอบ</span></p>
          </div>)}
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">{view === "trend" ? "วันเริ่มเข้าใช้งานตามเวลาไทย · หน่วย: รอบ" : "ร้อยละจากรอบเริ่มเข้าใช้งานของช่องทางเดียวกัน · ฐาน QR และ NFC แสดงด้านบน"}</p>
        {hasValues ? <div className="mt-3 h-72 min-w-0 sm:h-80" role="img" aria-label={view === "trend" ? "แนวโน้มรายวัน QR และ NFC" : "อัตราทำขั้นตอนสำเร็จ QR และ NFC"}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            {view === "trend" ? <LineChart data={data.daily} margin={{ top: 12, right: 12, left: -15, bottom: 8 }}>
              <CartesianGrid stroke={colors.grid} vertical={false} />
              <XAxis dataKey="date" tick={DASHBOARD_CHART_AXIS_TICK} tickFormatter={(date: string) => date.slice(5)} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis tick={DASHBOARD_CHART_AXIS_TICK} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={DASHBOARD_CHART_TOOLTIP} /><Legend />
              <Line name="QR Code" dataKey="qr" stroke={colors.accent} strokeWidth={3} dot={{ r: 3 }} connectNulls={false} isAnimationActive={false} />
              <Line name="NFC" dataKey="nfc" stroke={colors.teal} strokeWidth={3} strokeDasharray="6 4" dot={{ r: 3 }} connectNulls={false} isAnimationActive={false} />
            </LineChart> : <BarChart data={conversions} margin={{ top: 12, right: 12, left: -15, bottom: 8 }}>
              <CartesianGrid stroke={colors.grid} vertical={false} />
              <XAxis dataKey="stage" tick={{ ...DASHBOARD_CHART_AXIS_TICK, fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis domain={[0, 100]} unit="%" tick={DASHBOARD_CHART_AXIS_TICK} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={DASHBOARD_CHART_TOOLTIP} /><Legend />
              <Bar name="QR Code" dataKey="qr" fill={colors.accent} radius={[4, 4, 0, 0]} maxBarSize={32} isAnimationActive={false} />
              <Bar name="NFC" dataKey="nfc" fill={colors.teal} radius={[4, 4, 0, 0]} maxBarSize={32} isAnimationActive={false} />
            </BarChart>}
          </ResponsiveContainer>
        </div> : <p className="my-5 border-l-2 border-amber-500 bg-amber-50 p-4 text-sm leading-6 text-amber-950">ฐานข้อมูลบางกลุ่มต่ำกว่าเกณฑ์ จึงยังไม่แสดงกราฟมุมมองนี้</p>}
        <details className="mt-4 border-t border-slate-100">
          <summary className="min-h-11 cursor-pointer py-3 text-sm font-bold text-orange-800">ตารางผลลัพธ์และตัวหาร</summary>
          <div className="overflow-x-auto"><table className="w-full min-w-[420px] text-left text-sm">
            <thead><tr className="border-b border-slate-200"><th className="py-3">ช่องทาง</th><th>เริ่มเข้า</th><th>เช็กอิน</th><th>ใบประกาศ</th><th>แบบสำรวจ</th></tr></thead>
            <tbody>{data.channels.map((row) => <tr key={row.channel} className="border-b border-slate-100"><th className="py-3">{row.channel.toUpperCase()}</th><td>{display(row.entries)}</td><td>{display(row.linkedVisits)} / {display(row.entries)}</td><td>{display(row.certificates)} / {display(row.entries)}</td><td>{display(row.surveys)} / {display(row.entries)}</td></tr>)}</tbody>
          </table></div>
        </details>
      </>}
      <p className="mt-4 text-xs leading-5 text-slate-500">{data.note}</p>
      <p className="mt-1 text-xs text-slate-500">ข้อมูลถึง {new Date(data.asOf).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}</p>
    </section>
  );
}
