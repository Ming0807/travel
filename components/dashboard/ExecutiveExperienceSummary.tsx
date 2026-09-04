"use client";

import type { ReactNode } from "react";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { ArrowClockwise, ChatCircleText, Star } from "@phosphor-icons/react/dist/ssr";
import { SmallSampleWarning } from "@/components/dashboard/SmallSampleWarning";
import { DASHBOARD_MIN_SAMPLE_SIZE } from "@/constants/dashboard-metrics";
import type { DashboardViewModel } from "@/types/dashboard";

const SCORE_COLORS: Record<number, string> = {
  1: "#BE123C",
  2: "#B94727",
  3: "#D6A13D",
  4: "#3E7A4F",
  5: "#0A6B62",
};

type Satisfaction = DashboardViewModel["satisfaction"];

type ExperienceDimension = {
  label: string;
  average: number | null;
  responses: number;
};

function rateLabel(value: number | null): string {
  return value === null ? "ยังไม่มีข้อมูล" : `${Math.round(value * 100)}%`;
}

function validScore(value: number | null): number | null {
  if (value === null || !Number.isFinite(value) || value < 1 || value > 5) return null;
  return value;
}

function scoreFromLabel(label: string): number {
  const score = Number.parseInt(label, 10);
  return score >= 1 && score <= 5 ? score : 3;
}

function dimensionsFor(satisfaction: Satisfaction): ExperienceDimension[] {
  return [
    { label: "ความปลอดภัย", average: validScore(satisfaction.safetyAverage), responses: satisfaction.safetyResponseCount },
    { label: "ความสะอาด", average: validScore(satisfaction.cleanlinessAverage), responses: satisfaction.cleanlinessResponseCount },
    { label: "การเข้าถึง", average: validScore(satisfaction.accessibilityAverage), responses: satisfaction.accessibilityResponseCount },
    { label: "ข้อมูลและป้าย", average: validScore(satisfaction.informationAverage), responses: satisfaction.informationResponseCount },
    { label: "ความคุ้มค่า", average: validScore(satisfaction.valueAverage), responses: satisfaction.valueResponseCount },
  ];
}

export function ExecutiveExperienceSummary({ satisfaction }: { satisfaction: Satisfaction }) {
  const average = validScore(satisfaction.averageOverall);
  const dimensions = dimensionsFor(satisfaction);
  const distribution = satisfaction.distribution.filter((item) => item.value > 0);
  const total = distribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <section
      aria-labelledby="executive-experience-heading"
      className="h-full min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3.5 sm:px-5">
        <div>
          <h2 id="executive-experience-heading" className="text-lg font-black text-slate-950">
            คุณภาพประสบการณ์
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">คะแนนจากแบบสำรวจที่นักท่องเที่ยวตอบโดยสมัครใจ</p>
        </div>
        <span className="shrink-0 rounded-sm bg-slate-100 px-2 py-1 text-xs font-bold tabular-nums text-slate-700">
          {satisfaction.responseCount.toLocaleString("th-TH")} คำตอบ
        </span>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <div className="flex items-center justify-center gap-5 border-b border-slate-100 pb-4">
          <ScoreRing value={average} />
          <div className="text-sm text-slate-600"><p className="font-semibold text-slate-900">คะแนนเฉลี่ยรวม</p><p className="mt-1 text-xs">จากผู้ตอบ {satisfaction.responseCount.toLocaleString("th-TH")} รายการ</p><p className="mt-1 text-xs">ระดับคะแนน 1 ถึง 5</p></div>
        </div>
        <div className="min-w-0 pt-4">
          <h3 className="text-xs font-bold text-slate-700">คะแนนรายมิติ</h3>
          <div role="group" aria-label="แผนภูมิคะแนนประสบการณ์รายมิติ" className="mt-2.5 space-y-2.5">
            {dimensions.map((dimension) => (
              <DimensionRow key={dimension.label} dimension={dimension} />
            ))}
          </div>

          {total > 0 ? (
            <div className="mt-3 border-t border-slate-100 pt-2.5">
              <p className="text-xs font-semibold text-slate-600">การกระจายคะแนนรวม</p>
              <div
                className="mt-1.5 flex h-2 overflow-hidden rounded-sm bg-slate-100"
                role="img"
                aria-label="การกระจายคะแนนความพึงพอใจ"
              >
                {distribution.map((item) => (
                  <span
                    key={item.label}
                    style={{
                      width: `${(item.value / total) * 100}%`,
                      backgroundColor: SCORE_COLORS[scoreFromLabel(item.label)],
                    }}
                  />
                ))}
              </div>
              <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600" aria-label="คำอธิบายการกระจายคะแนน">{distribution.map((item) => <li key={item.label} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm" style={{ backgroundColor: SCORE_COLORS[scoreFromLabel(item.label)] }} /><span>{item.label}: {item.value.toLocaleString("th-TH")}</span></li>)}</ul>
            </div>
          ) : (
            <p className="mt-3 border-t border-slate-100 pt-2.5 text-sm font-semibold text-slate-600">ยังไม่มีข้อมูล</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-slate-200 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
        <IntentMetric
          icon={<ArrowClockwise aria-hidden="true" size={15} />}
          label="กลับมาเที่ยวซ้ำ"
          responses={satisfaction.revisitAnsweredCount}
          value={satisfaction.revisitIntentionRate}
        />
        <IntentMetric
          icon={<ChatCircleText aria-hidden="true" size={15} />}
          label="แนะนำต่อ"
          responses={satisfaction.recommendAnsweredCount}
          value={satisfaction.recommendIntentionRate}
        />
      </div>

      {satisfaction.responseCount > 0 && satisfaction.responseCount < DASHBOARD_MIN_SAMPLE_SIZE ? (
        <div className="border-t border-slate-200 px-4 py-3 sm:px-5">
          <SmallSampleWarning count={satisfaction.responseCount} label="คำตอบความพึงพอใจ" />
        </div>
      ) : null}

      <div className="sr-only">
        <table aria-label="คะแนนประสบการณ์รายมิติ">
          <thead><tr><th>มิติ</th><th>คะแนนเฉลี่ย</th><th>จำนวนคำตอบ</th></tr></thead>
          <tbody>
            {dimensions.map((dimension) => (
              <tr key={`dimension-table-${dimension.label}`}>
                <td>{dimension.label}</td>
                <td>{dimension.average === null ? "ยังไม่มีข้อมูล" : dimension.average.toFixed(1)}</td>
                <td>{dimension.responses}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <table aria-label="การกระจายคะแนนความพึงพอใจ">
          <thead><tr><th>คะแนน</th><th>จำนวนคำตอบ</th></tr></thead>
          <tbody>
            {distribution.map((item) => (
              <tr key={`score-${item.label}`}><td>{item.label}</td><td>{item.value}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ScoreRing({ value }: { value: number | null }) {
  return (
    <div className="relative h-28 w-28 shrink-0" data-chart-engine="recharts" role="img" aria-label={value === null ? "ยังไม่มีคะแนนเฉลี่ย" : `คะแนนเฉลี่ย ${value.toFixed(1)} จาก 5`}>
      {value === null ? <div className="absolute inset-2 rounded-full border-[8px] border-slate-100" /> : <RadialBarChart width={112} height={112} innerRadius={43} outerRadius={53} startAngle={90} endAngle={-270} barSize={9} data={[{ value, fill: "#0A6B62" }]} accessibilityLayer={false}>
        <PolarAngleAxis type="number" domain={[0, 5]} tick={false} />
        <RadialBar dataKey="value" background={{ fill: "#E9EFED" }} cornerRadius={6} isAnimationActive={false} />
      </RadialBarChart>}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <Star aria-hidden="true" className="text-[#D6A13D]" size={16} weight="fill" />
        <strong className={`mt-1 tabular-nums ${value === null ? "max-w-20 text-xs leading-4 text-slate-600" : "text-xl text-slate-950"}`}>
          {value === null ? "ยังไม่มีข้อมูล" : `${value.toFixed(1)} / 5`}
        </strong>
      </div>
    </div>
  );
}

function IntentMetric({
  icon,
  label,
  responses,
  value,
}: {
  icon: ReactNode;
  label: string;
  responses: number;
  value: number | null;
}) {
  return (
    <div className="min-w-0 px-3 first:pl-0 last:pr-0">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">{icon}{label}</p>
      <strong className={`mt-1 block tabular-nums ${value === null ? "text-sm text-slate-600" : "text-lg text-slate-950"}`}>
        {rateLabel(value)}
      </strong>
      <span className="mt-1 block text-xs tabular-nums text-slate-600">ฐาน {responses.toLocaleString("th-TH")} คำตอบ</span>
    </div>
  );
}

function DimensionRow({ dimension }: { dimension: ExperienceDimension }) {
  const width = dimension.average === null ? 0 : (dimension.average / 5) * 100;

  return (
    <div className="grid grid-cols-[minmax(6rem,1fr)_2.5rem] items-center gap-x-2 gap-y-1">
      <div className="flex min-w-0 items-center justify-between gap-2 text-xs">
        <span className="break-words font-semibold text-slate-700">{dimension.label}</span>
        <span
          className="shrink-0 tabular-nums text-slate-500"
          title="จำนวนคำตอบที่ใช้คำนวณมิตินี้"
        >
          {dimension.responses.toLocaleString("th-TH")} คำตอบ
        </span>
      </div>
      <strong className="row-span-2 text-right text-sm tabular-nums text-slate-900">
        {dimension.average === null ? "—" : dimension.average.toFixed(1)}
      </strong>
      <div className="h-1.5 overflow-hidden rounded-sm bg-slate-100" aria-hidden="true">
        <div className="h-full rounded-sm bg-[#0A6B62]" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
