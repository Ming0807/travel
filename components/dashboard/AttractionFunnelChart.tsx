"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { Cell, Funnel, FunnelChart as RechartsFunnelChart, ResponsiveContainer, Tooltip } from "recharts";

import { buildAttractionImprovementHref, type AttractionImprovementContext } from "@/lib/dashboard/attraction-improvement-links";
import type { AttractionAnalyticsViewModel } from "@/lib/services/attraction-analytics.service";
import { DASHBOARD_CHART_TOKENS, DASHBOARD_CHART_TOOLTIP, DASHBOARD_FUNNEL_COLORS as FUNNEL_COLORS } from "@/components/dashboard/dashboard-chart-theme";

type FunnelStages = AttractionAnalyticsViewModel["funnel"];

const DESKTOP_QUERY = "(min-width: 1280px)";

function subscribeToDesktop(callback: () => void) {
  if (typeof window.matchMedia !== "function") return () => undefined;
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getDesktopSnapshot() {
  return typeof window.matchMedia === "function" && window.matchMedia(DESKTOP_QUERY).matches;
}

function percentage(value: number | null) {
  return value === null ? "ยังคำนวณไม่ได้" : `${value.toLocaleString("th-TH")}%`;
}

export function AttractionFunnelChart({ stages, improvementContext }: { stages: FunnelStages; improvementContext?: AttractionImprovementContext }) {
  const showDesktopChart = useSyncExternalStore(subscribeToDesktop, getDesktopSnapshot, () => false);
  const availableStages = stages.filter((stage) => stage.available);
  const peakCount = Math.max(...availableStages.map((stage) => stage.count), 0);
  const chartData = availableStages.map((stage) => {
    const stageIndex = stages.findIndex((item) => item.key === stage.key);
    return { ...stage, value: stage.count, name: stage.label, fill: FUNNEL_COLORS[stageIndex % FUNNEL_COLORS.length] };
  });

  return (
    <section className="min-w-0 rounded-md border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="attraction-funnel-heading">
      <div className="border-b border-slate-100 pb-3">
        <p className="text-[11px] font-black uppercase text-[#B94727]">Conversion evidence</p>
        <h2 id="attraction-funnel-heading" className="mt-1 text-lg font-black text-slate-950">เส้นทางจากจุดเข้าไปถึงเสียงตอบรับ</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">ทุกขั้นนับ Visit หรือ entry session ไม่ซ้ำ ขั้นที่เชื่อมข้อมูลไม่ครบจะไม่ถูกนำไปวาดหรือคำนวณ Conversion</p>
      </div>

      {peakCount === 0 ? (
        <p className="mt-4 border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">ยังไม่มีข้อมูลเพียงพอสำหรับแสดงเส้นทางการใช้งาน</p>
      ) : (
        <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(250px,.7fr)_minmax(0,1.3fr)]">
          {showDesktopChart ? <div className="h-[23rem] min-w-0" data-chart-engine="recharts" role="img" aria-label="กราฟ Funnel รายสถานที่">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 300, height: 368 }}>
              <RechartsFunnelChart>
                <Tooltip contentStyle={DASHBOARD_CHART_TOOLTIP} formatter={(value) => [`${Number(value).toLocaleString("th-TH")} Visits`, "จำนวน"]} />
                <Funnel dataKey="value" data={chartData} isAnimationActive={false}>
                  {chartData.map((stage) => <Cell key={`attraction-funnel-${stage.key}`} fill={stage.fill} stroke={DASHBOARD_CHART_TOKENS.surface} strokeWidth={2} />)}
                </Funnel>
              </RechartsFunnelChart>
            </ResponsiveContainer>
          </div> : null}

          <ol className="divide-y divide-slate-100 border-y border-slate-100">
            {stages.map((stage, index) => {
              const width = stage.available && peakCount > 0 ? Math.max((stage.count / peakCount) * 100, stage.count > 0 ? 2 : 0) : 0;
              return (
                <li key={stage.key} className="grid gap-2 py-3 sm:grid-cols-[minmax(170px,.8fr)_minmax(0,1.2fr)] sm:items-center">
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 bg-white text-xs font-black text-slate-950" style={{ borderColor: stage.available ? FUNNEL_COLORS[index % FUNNEL_COLORS.length] : DASHBOARD_CHART_TOKENS.reference }}>{index + 1}</span>
                    <div className="min-w-0"><p className="text-sm font-bold text-slate-800">{stage.label}</p><p className="text-xs tabular-nums text-slate-600">{stage.available ? `${stage.count.toLocaleString("th-TH")} Visits` : "ข้อมูลเชื่อมโยงไม่ครบ"}</p></div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3"><div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-sm bg-slate-100" aria-label={`${stage.label} ${stage.available ? stage.count.toLocaleString("th-TH") : "ไม่พร้อมแสดง"}`} role="img"><div className="h-full rounded-sm" style={{ width: `${width}%`, backgroundColor: stage.available ? FUNNEL_COLORS[index % FUNNEL_COLORS.length] : DASHBOARD_CHART_TOKENS.reference }} /></div><span className="w-12 shrink-0 text-right text-xs font-bold tabular-nums text-slate-700">{stage.available ? `${Math.round(width)}%` : "N/A"}</span></div>
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs leading-5 text-slate-600">{index === 0 || stage.conversionFromPrevious === null ? stage.note ?? "จุดเริ่มต้นของฐานที่คำนวณได้" : `ผ่าน ${percentage(stage.conversionFromPrevious)} · หลุด ${percentage(stage.dropOffFromPrevious)}`}</p>
                      {improvementContext && stage.dropOffFromPrevious !== null && stage.dropOffFromPrevious > 0 ? <Link aria-label={`เปิดร่างประเด็นจากขั้น ${stage.label}`} href={buildAttractionImprovementHref(improvementContext, { source: "funnel_dropoff", dimension: "overall", metric: stage.key, value: stage.dropOffFromPrevious })} className="inline-flex min-h-11 items-center gap-1 text-xs font-bold text-[#B94727] underline underline-offset-4"><ArrowSquareOut aria-hidden="true" /> เปิดร่าง</Link> : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
