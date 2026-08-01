"use client";

import { useState } from "react";
import type { DistributionItem } from "@/types/dashboard";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { SmallSampleWarning } from "@/components/dashboard/SmallSampleWarning";
import { DASHBOARD_MIN_SAMPLE_SIZE } from "@/constants/dashboard-metrics";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";

const DONUT_COLORS = [
  "#B94727", // brand orange
  "#171717", // ink
  "#D6A13D", // gold
  "#0A6B62", // teal
  "#3B82F6", // blue
  "#3E7A4F", // leaf
  "#6B7280", // muted
  "#94A3B8", // slate-400
  "#A8D5BA", // light green
  "#F0DFC8", // sand
];

type DonutChartCardProps = {
  title: string;
  definition: string;
  data: DistributionItem[];
  emptyDescription: string;
  sampleCount?: number;
  sampleLabel?: string;
};

const SIZE = 220;
const STROKE_WIDTH = 40;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

export function DonutChartCard({
  title,
  definition,
  data,
  emptyDescription,
  sampleCount,
  sampleLabel = "คำตอบ",
}: DonutChartCardProps) {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-black text-slate-800">{title}</h2>
          <MetricTooltip definition={definition} />
        </div>
        {sampleCount !== undefined && sampleCount < DASHBOARD_MIN_SAMPLE_SIZE ? (
          <div className="mt-4">
            <SmallSampleWarning count={sampleCount} label={sampleLabel} />
          </div>
        ) : null}
        <div className="mt-4">
          <NoDataState description={emptyDescription} />
        </div>
      </section>
    );
  }

  const visibleData = total > 0 ? data : [];
  const segments = visibleData.map((item, i) => {
    const percent = item.value / total;
    const offset = visibleData
      .slice(0, i)
      .reduce((sum, d) => sum + (d.value / total) * CIRCUMFERENCE, 0);
    const length = percent * CIRCUMFERENCE;
    return {
      ...item,
      percent,
      offset,
      length,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    };
  });

  const hoveredSegment = segments.find((s) => s.label === hoveredLabel);
  const sorted = [...segments].sort((a, b) => b.value - a.value);

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-black text-slate-800">{title}</h2>
        <MetricTooltip definition={definition} />
      </div>

      {sampleCount !== undefined && sampleCount < DASHBOARD_MIN_SAMPLE_SIZE ? (
        <div className="mt-4">
          <SmallSampleWarning count={sampleCount} label={sampleLabel} />
        </div>
      ) : null}
      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
        {/* Donut */}
        <div className="relative shrink-0">
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="img"
            aria-label={`${title} donut chart`}
          >
            {/* Background ring */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth={STROKE_WIDTH}
            />

            {/* Segments */}
            {segments.map((seg) => {
              const isHovered = hoveredLabel === seg.label;
              const isEmpty = seg.length < 0.5;
              // For very small segments, draw at least a tiny visible arc
              const adjustedLength = isEmpty && seg.value > 0 ? 2 : seg.length;

              return (
                <circle
                  key={seg.label}
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? STROKE_WIDTH + 6 : STROKE_WIDTH}
                  strokeDasharray={`${adjustedLength} ${CIRCUMFERENCE - adjustedLength}`}
                  strokeDashoffset={-seg.offset}
                  opacity={hoveredLabel === null || isHovered ? 1 : 0.25}
                  onMouseEnter={() => setHoveredLabel(seg.label)}
                  onMouseLeave={() => setHoveredLabel(null)}
                  style={{
                    transition:
                      "stroke-width 0.2s ease, opacity 0.2s ease",
                    cursor: "pointer",
                  }}
                />
              );
            })}

            {/* Center text */}
            <text
              x={CENTER}
              y={CENTER - 6}
              textAnchor="middle"
              className="fill-slate-800 text-2xl font-black"
            >
              {hoveredSegment
                ? hoveredSegment.value.toLocaleString("th-TH")
                : total.toLocaleString("th-TH")}
            </text>
            <text
              x={CENTER}
              y={CENTER + 16}
              textAnchor="middle"
              className="fill-slate-500 text-xs font-bold"
            >
              {hoveredSegment
                ? `${(hoveredSegment.percent * 100).toFixed(1)}%`
                : "รวมทั้งหมด"}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 self-center sm:self-start">
          {sorted.map((seg) => {
            const isHovered = hoveredLabel === seg.label;
            return (
              <div
                key={seg.label}
                className={`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                  isHovered ? "bg-slate-50" : ""
                }`}
                onMouseEnter={() => setHoveredLabel(seg.label)}
                onMouseLeave={() => setHoveredLabel(null)}
                style={{ cursor: "pointer" }}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold text-slate-700">
                    {seg.label}
                  </p>
                  <p className="text-xs text-slate-400">
                    {seg.value.toLocaleString("th-TH")} &middot;{" "}
                    {(seg.percent * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
