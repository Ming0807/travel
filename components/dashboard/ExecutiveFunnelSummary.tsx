"use client";

import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle, QrCode, TrendDown } from "@phosphor-icons/react/dist/ssr";
import { useWideDashboardChart } from "@/components/dashboard/useWideDashboardChart";
import { DASHBOARD_CHART_AXIS_TICK, DASHBOARD_CHART_CATEGORY_TICK, DASHBOARD_CHART_TOKENS, DASHBOARD_CHART_TOOLTIP, DASHBOARD_FUNNEL_COLORS as FUNNEL_TONES, formatChartAxisLabel } from "@/components/dashboard/dashboard-chart-theme";
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

const EXECUTIVE_STAGE_KEYS = [
  "qr_scanned",
  "landing_viewed",
  "minimal_form_completed",
  "photo_uploaded",
  "certificate_generated",
  "survey_completed",
];


function countFor(stages: FunnelStage[], key: string): number | null {
  return stages.find((stage) => stage.key === key)?.count ?? null;
}

function safeRate(numerator: number | null, denominator: number | null): number | null {
  if (numerator === null || denominator === null || !Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0 || numerator < 0 || numerator > denominator) return null;
  return numerator / denominator;
}

function percentLabel(value: number | null): string {
  return value === null ? "ยังคำนวณไม่ได้" : `${Math.round(value * 100)}%`;
}

function stageLabel(stage: FunnelStage): string {
  return STAGE_LABELS[stage.key] ?? stage.label;
}

export function ExecutiveFunnelSummary({ stages }: { stages: FunnelStage[] }) {
  const showWideChart = useWideDashboardChart();
  const qrScans = countFor(stages, "qr_scanned");
  const certificates = countFor(stages, "certificate_generated");
  const surveys = countFor(stages, "survey_completed");
  const certificateRate = safeRate(certificates, qrScans);
  const surveyRate = safeRate(surveys, certificates);
  const keyStages = EXECUTIVE_STAGE_KEYS.map((key) => stages.find((stage) => stage.key === key)).filter((stage): stage is FunnelStage => Boolean(stage));
  const displayStages = keyStages.length >= 3 ? keyStages : stages.slice(0, 6);
  const maximum = Math.max(...displayStages.map((stage) => stage.count), 0);
  const chartData = displayStages.map((stage, index) => ({ ...stage, name: stageLabel(stage), fill: FUNNEL_TONES[index % FUNNEL_TONES.length] }));
  return (
    <section
      aria-labelledby="executive-funnel-heading"
      className="h-full min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white"
    >
      <div className="space-y-4 border-b border-slate-200 px-4 py-4 sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#FFF0EA] text-[#B94727]"><TrendDown aria-hidden="true" size={18} weight="bold" /></span>
            <h2 id="executive-funnel-heading" className="text-lg font-black text-slate-950">เส้นทางการมีส่วนร่วม</h2>
          </div>
          <p className="mt-1.5 text-xs leading-5 text-slate-600">แต่ละขั้นคือจำนวนเหตุการณ์ใน Funnel ไม่ใช่จำนวนบุคคลหรือรายการเยี่ยมชม</p>
        </div>
        <div role="group" aria-label="อัตราสรุปเส้นทาง" className="grid grid-cols-2 divide-x divide-slate-200">
          <ConversionSummary
            icon={<QrCode aria-hidden="true" size={16} weight="bold" />}
            label="QR ถึงใบประกาศ"
            value={certificateRate}
          />
          <ConversionSummary
            icon={<CheckCircle aria-hidden="true" size={16} weight="bold" />}
            label="ใบประกาศถึงแบบสำรวจ"
            value={surveyRate}
          />
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5">
        {displayStages.length === 0 ? (
          <p className="py-8 text-center text-sm font-semibold text-slate-600">
            ยังไม่มีเหตุการณ์เพียงพอสำหรับแสดงเส้นทาง
          </p>
        ) : (
          <>
          {showWideChart ? <div className="hidden h-72 min-w-0 sm:block" data-chart-engine="recharts" role="img" aria-label="จำนวนเหตุการณ์ตามขั้นตอนหลัก">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 600, height: 288 }}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 50, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={DASHBOARD_CHART_TOKENS.grid} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={DASHBOARD_CHART_AXIS_TICK} />
                <YAxis type="category" dataKey="name" width={128} tickFormatter={formatChartAxisLabel} axisLine={false} tickLine={false} tick={DASHBOARD_CHART_CATEGORY_TICK} />
                <Tooltip contentStyle={DASHBOARD_CHART_TOOLTIP} cursor={{ fill: DASHBOARD_CHART_TOKENS.cursor }} formatter={(value) => [`${Number(value).toLocaleString("th-TH")} เหตุการณ์`, "จำนวน"]} />
                <Bar dataKey="count" barSize={18} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                  {chartData.map((stage) => <Cell key={stage.key} fill={stage.fill} />)}
                  <LabelList dataKey="count" position="right" fill={DASHBOARD_CHART_TOKENS.value} fontSize={12} fontWeight={700} formatter={(value) => Number(value).toLocaleString("th-TH")} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div> : null}
          <ol className={showWideChart ? "sr-only" : "divide-y divide-slate-100"} aria-label="ลำดับขั้นของเส้นทางผู้ใช้">
            {displayStages.map((stage, index) => {
              const previous = displayStages[index - 1];
              const conversion = previous ? safeRate(stage.count, previous.count) : null;
              return (
                <li
                  key={stage.key}
                  className="min-w-0 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-start gap-2 text-sm font-semibold text-slate-800"><span aria-hidden="true" className="text-slate-500">{index + 1}.</span><span>{stageLabel(stage)}</span></span>
                    <strong className="text-lg font-black tabular-nums text-slate-950">{stage.count.toLocaleString("th-TH")}</strong>
                  </div>
                  <div className="my-2 h-2 overflow-hidden rounded-sm bg-slate-100" aria-hidden="true"><div className="h-full rounded-sm" style={{ width: `${maximum > 0 ? stage.count / maximum * 100 : 0}%`, backgroundColor: FUNNEL_TONES[index % FUNNEL_TONES.length] }} /></div>
                  <span className="block text-xs tabular-nums text-slate-600">{index === 0 ? "จุดเริ่มต้น" : `${percentLabel(conversion)} จากขั้นที่แสดงก่อนหน้า`}</span>
                </li>
              );
            })}
          </ol>
          </>
        )}
      </div>

      <p className="border-t border-slate-100 px-4 py-2.5 text-xs leading-5 text-slate-600 sm:px-5">จำนวนเหตุการณ์อาจมาจากคนละเซสชัน อัตราส่วนนี้ไม่ใช่อัตราสำเร็จรายบุคคล</p>

      <div className="sr-only">
        <table aria-label="ข้อมูลประสิทธิภาพเส้นทางผู้ใช้">
          <thead>
            <tr><th>ขั้นตอน</th><th>จำนวนเหตุการณ์</th><th>อัตราจากขั้นก่อนหน้า</th></tr>
          </thead>
          <tbody>
            {stages.map((stage, index) => (
              <tr key={`funnel-table-${stage.key}`}>
                <td>{stageLabel(stage)}</td>
                <td>{stage.count}</td>
                <td>{index === 0 ? "จุดเริ่มต้น" : percentLabel(safeRate(stage.count, stages[index - 1].count))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ConversionSummary({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number | null;
}) {
  return (
    <div className="min-w-0 px-3 py-2.5 sm:px-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold leading-4 text-slate-600">
        {icon}
        <span>{label}</span>
      </p>
      <strong className={`mt-1 block tabular-nums ${value === null ? "text-xs text-slate-600" : "text-lg text-slate-950"}`}>
        {percentLabel(value)}
      </strong>
    </div>
  );
}
