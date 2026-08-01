"use client";

import { useState, useMemo } from "react";
import type { TrendPoint } from "@/types/dashboard";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { ChartLineUp } from "@phosphor-icons/react/dist/ssr";

function formatDateLabel(raw: string): string {
  const d = new Date(raw + "T00:00:00.000Z");
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("th-TH", { month: "short", day: "numeric" });
}

function formatDateFull(raw: string): string {
  const d = new Date(raw + "T00:00:00.000Z");
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("th-TH", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Build a smooth SVG path through points
function buildSmoothPath(
  points: { x: number; y: number }[]
): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    return `M ${points[0].x},${points[0].y} L ${points[0].x},${points[0].y}`;
  }
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx1 = prev.x + (curr.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = curr.x - (curr.x - prev.x) / 2;
    const cpy2 = curr.y;
    d += ` C ${cpx1},${cpy1} ${cpx2},${cpy2} ${curr.x},${curr.y}`;
  }
  return d;
}

export function TrendChart({ points }: { points: TrendPoint[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (points.length === 0) return { max: 0 };
    const max = Math.max(...points.map((p) => p.value), 0);
    return { max };
  }, [points]);

  const yTicks = useMemo(() => {
    if (chartData.max <= 0) return [0];
    const niceMax = Math.ceil(chartData.max / 10) * 10 || 10;
    const step = Math.max(1, Math.round(niceMax / 4));
    const ticks: number[] = [];
    for (let v = 0; v <= niceMax; v += step) {
      ticks.push(v);
    }
    if (ticks[ticks.length - 1]! < niceMax) ticks.push(niceMax);
    return ticks;
  }, [chartData.max]);

  if (points.length === 0) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-[0_4px_8px_rgba(15,23,42,0.05)]">
        <h2 className="text-base font-bold text-slate-900">แนวโน้มการเข้าชม</h2>
        <p className="mt-1 text-sm text-slate-500">การเข้าชมที่บันทึกตามช่วงเวลา</p>
        <div className="mt-4">
          <NoDataState description="ยังไม่มีรายการเข้าชมในช่วงวันที่ที่เลือก" />
        </div>
      </section>
    );
  }

  const { max } = chartData;
  const PADDING = { top: 24, right: 24, bottom: 40, left: 48 };
  const WIDTH = 800;
  const HEIGHT = 260;
  const innerW = WIDTH - PADDING.left - PADDING.right;
  const innerH = HEIGHT - PADDING.top - PADDING.bottom;
  const yBase = PADDING.top + innerH;

  // Build mapped points
  const mapped = points.map((p, i) => ({
    ...p,
    x:
      PADDING.left +
      (points.length > 1 ? (i / (points.length - 1)) * innerW : innerW / 2),
    y:
      max > 0
        ? PADDING.top + innerH - (p.value / max) * innerH
        : yBase,
  }));

  const areaPath = buildSmoothPath(mapped);
  const linePath = areaPath;

  return (
    <section className="min-w-0 rounded-md border border-slate-200 bg-white p-4 shadow-[0_4px_8px_rgba(15,23,42,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">แนวโน้มการเข้าชม</h2>
          <p className="mt-1 text-sm text-slate-500">
            นับเฉพาะรายการเข้าชมที่บันทึกสำเร็จ ไม่รวมการสแกน QR
          </p>
        </div>
        <div className="flex min-h-9 items-center gap-2 rounded-md border border-[#E8B8A8] bg-[#FFF7F3] px-3 text-sm font-bold text-[#8F351F]">
          <ChartLineUp size={18} weight="bold" />
          รวม {points.reduce((s, p) => s + p.value, 0).toLocaleString("th-TH")} ครั้ง
        </div>
      </div>

      <div className="relative mt-4">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="กราฟแนวโน้มการเข้าชม"
        >
          {/* Grid lines */}
          {yTicks.map((tick) => {
            const y = PADDING.top + innerH - (tick / (yTicks[yTicks.length - 1] || 1)) * innerH;
            return (
              <g key={`grid-${tick}`}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={WIDTH - PADDING.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
                <text
                  x={PADDING.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-xs font-bold"
                >
                  {tick.toLocaleString("th-TH")}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {mapped.length > 1 && (
            <path
              d={`${areaPath} L ${mapped[mapped.length - 1].x},${yBase} L ${mapped[0].x},${yBase} Z`}
              fill="#FFF0EA"
            />
          )}

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#B94727"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Invisible hover capture area — detects nearest point */}
          <rect
            x={PADDING.left}
            y={PADDING.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            className="cursor-crosshair"
            onMouseLeave={() => setHoveredIndex(null)}
            onMouseMove={(e) => {
              const svgEl = (e.target as Element).closest("svg");
              if (!svgEl) return;
              const rect = svgEl.getBoundingClientRect();
              const svgX = ((e.clientX - rect.left) / rect.width) * WIDTH;
              let nearest = 0;
              let nearestDist = Infinity;
              for (let i = 0; i < mapped.length; i++) {
                const dist = Math.abs(mapped[i].x - svgX);
                if (dist < nearestDist) {
                  nearestDist = dist;
                  nearest = i;
                }
              }
              setHoveredIndex(nearest);
            }}
          />

          {/* Data points */}
          {mapped.map((pt, i) => (
            <g key={pt.label}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === i ? 6 : 3.5}
                fill={hoveredIndex === i ? "#171717" : "#B94727"}
                stroke="white"
                strokeWidth="2"
                style={{ transition: "r 0.15s ease, fill 0.15s ease" }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />
              {hoveredIndex === i && (
                <>
                  {/* Vertical guide line */}
                  <line
                    x1={pt.x}
                    y1={PADDING.top}
                    x2={pt.x}
                    y2={yBase}
                    stroke="#B94727"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                    opacity={0.5}
                  />
                  {/* Tooltip */}
                  <foreignObject
                    x={Math.max(4, Math.min(pt.x - 72, WIDTH - 152))}
                    y={Math.max(2, pt.y - 60)}
                    width="150"
                    height="52"
                  >
                    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-center shadow-card">
                      <p className="text-xs font-bold text-slate-500">
                        {formatDateFull(pt.label)}
                      </p>
                      <p className="text-sm font-black text-[#B94727]">
                        {pt.value.toLocaleString("th-TH")} ครั้ง
                      </p>
                    </div>
                  </foreignObject>
                </>
              )}
            </g>
          ))}

          {/* X-axis labels (show a subset to avoid clutter) */}
          {mapped
            .filter(
              (_, i) =>
                i === 0 ||
                i === mapped.length - 1 ||
                (points.length > 6 && i % Math.max(1, Math.floor(points.length / 6)) === 0)
            )
            .map((pt) => (
              <text
                key={`xlabel-${pt.label}`}
                x={pt.x}
                y={HEIGHT - 8}
                textAnchor="middle"
                className="fill-slate-500 text-xs font-bold"
              >
                {formatDateLabel(pt.label)}
              </text>
            ))}
        </svg>
      </div>

      <details className="mt-3 border-t border-slate-100 pt-3">
        <summary className="cursor-pointer text-xs font-semibold text-[#B94727]">ดูตารางแนวโน้ม</summary>
        <div className="mt-2 max-h-56 overflow-auto">
          <table aria-label="ข้อมูลแนวโน้มการเข้าชม" className="w-full min-w-80 text-sm">
            <thead className="sticky top-0 bg-white text-left text-xs text-slate-500">
              <tr className="border-b border-slate-200"><th className="py-2 pr-4">วันที่</th><th className="py-2 text-right">การเข้าชม</th></tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={`trend-row-${point.label}`} className="border-b border-slate-100">
                  <td className="py-2 pr-4 text-slate-700">{formatDateFull(point.label)}</td>
                  <td className="py-2 text-right font-semibold tabular-nums text-slate-900">{point.value.toLocaleString("th-TH")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
