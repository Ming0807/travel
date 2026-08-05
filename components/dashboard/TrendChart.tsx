"use client";

import { useMemo, useState } from "react";
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

function linePath(points: { x: number; y: number }[]): string {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x},${point.y}`).join(" ");
}

export function TrendChart({ points }: { points: TrendPoint[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = useMemo(() => points.reduce((sum, point) => sum + point.value, 0), [points]);
  const rawMax = useMemo(() => Math.max(...points.map((point) => point.value), 0), [points]);
  const tickStep = rawMax <= 0 ? 0 : Math.max(1, Math.ceil(rawMax / 4));
  const scaleMax = tickStep * 4;
  const yTicks = scaleMax === 0 ? [0] : [0, 1, 2, 3, 4].map((step) => step * tickStep);

  if (points.length === 0) {
    return (
      <section className="h-full rounded-md border border-slate-200 bg-white p-4 shadow-[0_4px_8px_rgba(15,23,42,0.05)] sm:p-5">
        <h2 className="text-base font-bold text-slate-950">แนวโน้มรายการเข้าชม</h2>
        <p className="mt-1 text-xs leading-5 text-slate-600">นับเฉพาะรายการเข้าชมที่บันทึกสำเร็จ ไม่รวมการสแกน QR</p>
        <div className="mt-4"><NoDataState description="ยังไม่มีรายการเข้าชมในช่วงวันที่ที่เลือก" /></div>
      </section>
    );
  }

  const padding = { top: 24, right: 20, bottom: 42, left: 50 };
  const width = 800;
  const height = 300;
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const yBase = padding.top + innerHeight;
  const mapped = points.map((point, index) => ({
    ...point,
    x: padding.left + (points.length > 1 ? (index / (points.length - 1)) * innerWidth : innerWidth / 2),
    y: scaleMax > 0 ? padding.top + innerHeight - (point.value / scaleMax) * innerHeight : yBase,
  }));
  const path = linePath(mapped);

  return (
    <section className="h-full min-w-0 rounded-md border border-slate-200 bg-white p-4 shadow-[0_4px_8px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-950">แนวโน้มรายการเข้าชม</h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">นับเฉพาะรายการเข้าชมที่บันทึกสำเร็จ ไม่รวมการสแกน QR</p>
        </div>
        <div className="flex min-h-10 items-center gap-2 rounded-sm bg-[#FFF0EA] px-3 text-sm font-bold text-[#8F351F]">
          <ChartLineUp aria-hidden="true" size={18} weight="bold" />
          รวม {total.toLocaleString("th-TH")} ครั้ง
        </div>
      </div>

      <div className="mt-4 hidden sm:block">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="กราฟแนวโน้มรายการเข้าชมตามวันที่"
        >
          {yTicks.map((tick) => {
            const y = padding.top + innerHeight - (tick / (scaleMax || 1)) * innerHeight;
            return (
              <g key={`grid-${tick}`}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#E2E8F0" strokeWidth="1" />
                <text x={padding.left - 9} y={y + 4} textAnchor="end" className="fill-slate-500 text-xs font-semibold">
                  {tick.toLocaleString("th-TH")}
                </text>
              </g>
            );
          })}

          {mapped.length > 1 ? (
            <path d={`${path} L ${mapped[mapped.length - 1].x},${yBase} L ${mapped[0].x},${yBase} Z`} fill="#FFF0EA" />
          ) : null}
          <path d={path} fill="none" stroke="#B94727" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />

          <rect
            x={padding.left}
            y={padding.top}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            className="cursor-crosshair"
            onMouseLeave={() => setActiveIndex(null)}
            onMouseMove={(event) => {
              const svg = (event.target as Element).closest("svg");
              if (!svg) return;
              const bounds = svg.getBoundingClientRect();
              const svgX = ((event.clientX - bounds.left) / bounds.width) * width;
              const nearest = mapped.reduce((best, point, index) => (
                Math.abs(point.x - svgX) < Math.abs(mapped[best].x - svgX) ? index : best
              ), 0);
              setActiveIndex(nearest);
            }}
          />

          {mapped.map((point, index) => (
            <g key={point.label}>
              {activeIndex === index ? (
                <line x1={point.x} y1={padding.top} x2={point.x} y2={yBase} stroke="#B94727" strokeDasharray="4 3" strokeWidth="1" />
              ) : null}
              <circle
                cx={point.x}
                cy={point.y}
                r={activeIndex === index ? 6 : 4}
                fill={activeIndex === index ? "#202020" : "#B94727"}
                stroke="white"
                strokeWidth="2"
                tabIndex={0}
                aria-label={`${formatDateFull(point.label)} ${point.value.toLocaleString("th-TH")} ครั้ง`}
                onBlur={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
              />
              {activeIndex === index ? (
                <foreignObject
                  x={Math.max(4, Math.min(point.x - 72, width - 152))}
                  y={Math.max(2, point.y - 62)}
                  width="150"
                  height="54"
                >
                  <div className="rounded-sm border border-slate-200 bg-white px-3 py-2 text-center shadow-[0_4px_8px_rgba(15,23,42,0.08)]">
                    <p className="text-xs font-semibold text-slate-600">{formatDateFull(point.label)}</p>
                    <p className="text-sm font-black text-[#B94727]">{point.value.toLocaleString("th-TH")} ครั้ง</p>
                  </div>
                </foreignObject>
              ) : null}
            </g>
          ))}

          {mapped.filter((_, index) => (
            index === 0
            || index === mapped.length - 1
            || (points.length > 6 && index % Math.max(1, Math.floor(points.length / 6)) === 0)
          )).map((point) => (
            <text key={`x-${point.label}`} x={point.x} y={height - 10} textAnchor="middle" className="fill-slate-500 text-xs font-semibold">
              {formatDateLabel(point.label)}
            </text>
          ))}
        </svg>
      </div>

      <MobileTrend points={points.slice(-7)} max={rawMax} />

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

function MobileTrend({ points, max }: { points: TrendPoint[]; max: number }) {
  return (
    <div className="mt-5 sm:hidden" aria-label="แนวโน้มรายการเข้าชมเจ็ดช่วงล่าสุด">
      <div className="flex h-36 items-end gap-2 border-b border-slate-200">
        {points.map((point) => {
          const height = max > 0 ? Math.max((point.value / max) * 100, point.value > 0 ? 4 : 0) : 0;
          return (
            <div key={`mobile-${point.label}`} className="flex h-full min-w-0 flex-1 flex-col justify-end">
              <span className="mb-1 text-center text-xs font-bold tabular-nums text-slate-700">{point.value}</span>
              <span className="w-full rounded-t-sm bg-[#B94727]" style={{ height: `${height}%` }} />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {points.map((point) => (
          <span key={`mobile-label-${point.label}`} className="min-w-0 flex-1 truncate text-center text-xs font-semibold text-slate-600">
            {formatDateLabel(point.label)}
          </span>
        ))}
      </div>
    </div>
  );
}
