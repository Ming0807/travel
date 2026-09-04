"use client";

import { useSyncExternalStore } from "react";
import { Cell, Funnel, FunnelChart as RechartsFunnelChart, ResponsiveContainer, Tooltip } from "recharts";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { DASHBOARD_CHART_TOKENS, DASHBOARD_CHART_TOOLTIP, DASHBOARD_FUNNEL_COLORS as FUNNEL_COLORS } from "@/components/dashboard/dashboard-chart-theme";
import type { FunnelStage } from "@/types/dashboard";

const STAGE_LABELS: Record<string, string> = {
  qr_scanned: "สแกน QR",
  landing_viewed: "เปิดหน้าเช็กอิน",
  certificate_started: "เริ่มรับใบประกาศ",
  minimal_form_completed: "ส่งข้อมูลขั้นต่ำ",
  photo_uploaded: "อัปโหลดรูปสำเร็จ",
  certificate_generated: "สร้างใบประกาศสำเร็จ",
  survey_started: "เปิดแบบสำรวจ",
  survey_completed: "ส่งแบบสำรวจสำเร็จ",
  passport_saved: "บันทึกพาสปอร์ต",
};
const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeToDesktop(callback: () => void) {
  if (typeof window.matchMedia !== "function") return () => undefined;
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getDesktopSnapshot() {
  return typeof window.matchMedia === "function" && window.matchMedia(DESKTOP_QUERY).matches;
}

export function funnelStageLabel(stage: FunnelStage): string {
  return STAGE_LABELS[stage.key] ?? stage.label;
}

function validRate(value: number | null): number | null {
  return value !== null && Number.isFinite(value) && value >= 0 && value <= 1 ? value : null;
}

function formatRate(value: number | null): string {
  const safeValue = validRate(value);
  return safeValue === null ? "ยังคำนวณไม่ได้" : `${Math.round(safeValue * 100)}%`;
}

export function FunnelChart({ stages, selectedStageKey, onSelectStage }: { stages: FunnelStage[]; selectedStageKey?: string | null; onSelectStage?: (key: string) => void }) {
  const showDesktopChart = useSyncExternalStore(subscribeToDesktop, getDesktopSnapshot, () => false);
  const peakCount = Math.max(...stages.map((stage) => stage.count), 0);
  const chartData = stages.map((stage, index) => ({
    ...stage,
    name: funnelStageLabel(stage),
    value: stage.count,
    fill: FUNNEL_COLORS[index % FUNNEL_COLORS.length],
  }));

  return (
    <section aria-labelledby="funnel-chart-heading" className="min-w-0 rounded-md border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div><h3 className="text-base font-black text-slate-950" id="funnel-chart-heading">เหตุการณ์ตามลำดับการใช้งาน</h3><p className="mt-1 text-sm leading-6 text-slate-600">แต่ละขั้นเป็นจำนวนเหตุการณ์ ไม่ใช่จำนวนบุคคลหรือรายการเข้าชม</p></div>
        <MetricTooltip definition="อัตราผ่านและอัตราออกคำนวณเทียบกับขั้นก่อนหน้า เมื่อฐานเป็นศูนย์หรือข้อมูลผิดลำดับจะแสดงว่ายังคำนวณไม่ได้" />
      </div>

      {stages.length === 0 || peakCount === 0 ? (
        <div className="mt-4"><NoDataState description="ยังไม่มีเหตุการณ์เพียงพอสำหรับแสดงเส้นทางการใช้งาน" /></div>
      ) : (
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.2fr)]">
          {showDesktopChart ? <div className="h-[27rem] min-w-0" data-chart-engine="recharts" role="img" aria-label="แผนภูมิกรวยลำดับการใช้งาน">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 280, height: 432 }}>
              <RechartsFunnelChart>
                <Tooltip contentStyle={DASHBOARD_CHART_TOOLTIP} formatter={(value) => [`${Number(value).toLocaleString("th-TH")} เหตุการณ์`, "จำนวน"]} />
                <Funnel dataKey="value" data={chartData} isAnimationActive={false} cursor={onSelectStage ? "pointer" : undefined} onClick={(_entry, index) => onSelectStage?.(stages[index]?.key ?? "")}>
                  {chartData.map((stage) => <Cell key={`funnel-${stage.key}`} fill={stage.fill} stroke={DASHBOARD_CHART_TOKENS.surface} strokeWidth={2} />)}
                </Funnel>
              </RechartsFunnelChart>
            </ResponsiveContainer>
          </div> : null}
          <ol className="divide-y divide-slate-100 border-y border-slate-100">
            {stages.map((stage, index) => {
              const width = peakCount > 0 ? Math.max((stage.count / peakCount) * 100, stage.count > 0 ? 2 : 0) : 0;
              const conversion = index === 0 ? null : validRate(stage.conversionFromPrevious);
              const dropOff = index === 0 ? null : validRate(stage.dropOffFromPrevious);
              return (
                <li className={`py-1 ${selectedStageKey === stage.key ? "bg-orange-50" : ""}`} key={stage.key}>
                  <button className="grid min-h-11 w-full gap-2 px-2 py-2 text-left sm:grid-cols-[minmax(155px,0.8fr)_minmax(0,1.2fr)] sm:items-center" type="button" onClick={() => onSelectStage?.(stage.key)} aria-pressed={selectedStageKey === stage.key} aria-label={`ดูรายละเอียดเฉพาะ ${funnelStageLabel(stage)}`}>
                  <div className="flex items-start gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border-2 bg-white text-xs font-black text-slate-950" style={{ borderColor: FUNNEL_COLORS[index % FUNNEL_COLORS.length] }}>{index + 1}</span><div className="min-w-0"><p className="break-words text-sm font-bold text-slate-800">{funnelStageLabel(stage)}</p><p className="text-xs tabular-nums text-slate-600">{stage.count.toLocaleString("th-TH")} เหตุการณ์</p></div></div>
                  <div className="min-w-0"><div className="flex items-center gap-3"><div aria-label={`${funnelStageLabel(stage)} ${stage.count.toLocaleString("th-TH")} เหตุการณ์`} className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-sm bg-slate-100" role="img"><div className="h-full rounded-sm" style={{ width: `${width}%`, backgroundColor: FUNNEL_COLORS[index % FUNNEL_COLORS.length] }} /></div><span className="w-10 shrink-0 text-right text-xs font-bold tabular-nums text-slate-700">{Math.round(width)}%</span></div>{index > 0 ? <p className="mt-1.5 text-xs leading-5 text-slate-600">ผ่าน {formatRate(conversion)} · ออก {formatRate(dropOff)}</p> : <p className="mt-1.5 text-xs text-slate-500">ขั้นเริ่มต้นของชุดข้อมูล</p>}</div>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
