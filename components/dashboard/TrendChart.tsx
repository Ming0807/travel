"use client";

import { useState, useMemo } from "react";
import type { TrendPoint } from "@/types/dashboard";
import { NoDataState } from "@/components/dashboard/NoDataState";
import { ChartLineUp } from "@phosphor-icons/react/dist/ssr";

function formatDateLabel(raw: string): string {
  // Expects YYYY-MM-DD, shows "Jan 15" or "15 Jan" style
  const d = new Date(raw + "T00:00:00.000Z");
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(raw: string): string {
  const d = new Date(raw + "T00:00:00.000Z");
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-US", {
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

  if (points.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <h2 className="text-lg font-black text-slate-800">Visit Trend</h2>
        <p className="mt-1 text-sm text-slate-500">Visits over time.</p>
        <div className="mt-4">
          <NoDataState description="No visits in the selected date range." />
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

  // Y-axis ticks
  const yTicks = useMemo(() => {
    if (max <= 0) return [0];
    const niceMax = Math.ceil(max / 10) * 10 || 10;
    const step = Math.max(1, Math.round(niceMax / 4));
    const ticks: number[] = [];
    for (let v = 0; v <= niceMax; v += step) {
      ticks.push(v);
    }
    if (ticks[ticks.length - 1]! < niceMax) ticks.push(niceMax);
    return ticks;
  }, [max]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-800">Visit Trend</h2>
          <p className="mt-1 text-sm text-slate-500">
            Visits are visit records only. QR scans are tracked separately.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-tealSoft px-3 py-1.5 text-sm font-bold text-teal">
          <ChartLineUp size={18} weight="bold" />
          {points.reduce((s, p) => s + p.value, 0).toLocaleString("th-TH")} total
        </div>
      </div>

      <div className="relative mt-4">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Visit trend chart"
        >
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0A6B62" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#0A6B62" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0A6B62" />
              <stop offset="100%" stopColor="#F3704C" />
            </linearGradient>
            <filter id="dotGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#0A6B62" floodOpacity="0.3" />
            </filter>
          </defs>

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
                  className="fill-slate-400 text-[10px] font-bold"
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
              fill="url(#trendFill)"
            />
          )}

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#trendLine)"
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
                fill={hoveredIndex === i ? "#F3704C" : "#0A6B62"}
                stroke="white"
                strokeWidth="2"
                style={{ transition: "r 0.15s ease, fill 0.15s ease" }}
                filter={hoveredIndex === i ? "url(#dotGlow)" : undefined}
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
                    stroke="#F3704C"
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
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-card text-center">
                      <p className="text-[10px] font-bold text-slate-500">
                        {formatDateFull(pt.label)}
                      </p>
                      <p className="text-sm font-black text-[#073F37]">
                        {pt.value.toLocaleString("th-TH")} visits
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
                className="fill-slate-400 text-[10px] font-bold"
              >
                {formatDateLabel(pt.label)}
              </text>
            ))}
        </svg>
      </div>
    </section>
  );
}
