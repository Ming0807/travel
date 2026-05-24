"use client";

import { useState, useEffect, useMemo } from "react";
import type { FunnelStage } from "@/types/dashboard";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";

/* ─── helpers ─── */
function pct(value: number | null): string {
  if (value === null) return "—";
  return `${Math.round(value * 100)}%`;
}

/* ─── main component ─── */
export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const [mounted, setMounted] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(id);
  }, []);

  /* funnel dimensions */
  const STAGE_H = 56;
  const GAP = 28;
  const totalH = stages.length * STAGE_H + (stages.length - 1) * GAP;
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  /* colours: teal gradient dark → light */
  const funnelColors = useMemo(() => {
    if (stages.length <= 1) return ["#073F37"];
    return stages.map((_, i) => {
      const t = stages.length > 1 ? i / (stages.length - 1) : 0;
      const r = Math.round(7 + t * (20 - 7));       // 7 → 20
      const g = Math.round(63 + t * (107 - 63));     // 63 → 107
      const b = Math.round(55 + t * (98 - 55));      // 55 → 98
      return `rgb(${r},${g},${b})`;
    });
  }, [stages.length]);

  /* positions */
  const stageLayout = stages.map((stage, i) => {
    const topW = maxCount > 0 ? (stages[i].count / maxCount) : 0.1;
    const bottomW =
      i < stages.length - 1 && maxCount > 0
        ? stages[i + 1].count / maxCount
        : topW * 0.7;

    const y = i * (STAGE_H + GAP);
    const midY = y + STAGE_H / 2;

    /* SVG coordinates (viewBox 0 0 1000 totalH) */
    const centerX = 500;
    const topLeft = centerX - (topW * 400) / 2;
    const topRight = centerX + (topW * 400) / 2;
    const botLeft = centerX - (bottomW * 400) / 2;
    const botRight = centerX + (bottomW * 400) / 2;

    /* drop-off connector */
    const prevCount = i > 0 ? stages[i - 1].count : null;
    const dropPct =
      i > 0 && prevCount && prevCount > 0
        ? ((prevCount - stage.count) / prevCount) * 100
        : null;

    return {
      stage,
      topW,
      bottomW,
      y,
      midY,
      topLeft,
      topRight,
      botLeft,
      botRight,
      dropPct,
      color: funnelColors[i],
    };
  });

  if (stages.length === 0) return null;

  return (
    <section className="relative rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:border-slate-700/60 dark:bg-slate-800 dark:hover:border-slate-600">
      <style>{`
        @keyframes funnel-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes funnel-svg-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes funnel-drop-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.8); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .funnel-stage { animation: none !important; }
          .funnel-drop  { animation: none !important; }
          .funnel-svg   { transition: none !important; }
        }
      `}</style>

      {/* header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">QR-to-certificate funnel</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Event counts are not visits or unique people.
          </p>
        </div>
        <MetricTooltip definition="Funnel conversion uses current event count divided by previous event count. Zero denominator returns No data." />
      </div>

      {/* funnel SVG */}
      <div className="relative mx-auto max-w-3xl">
        <svg
          viewBox={`0 0 1000 ${totalH}`}
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Funnel chart"
        >
          {stageLayout.map((l, i) => (
            <g key={l.stage.key}>
              {/* trapezoid */}
              <polygon
                points={`${l.topLeft},${l.y} ${l.topRight},${l.y} ${l.botRight},${l.y + STAGE_H} ${l.botLeft},${l.y + STAGE_H}`}
                fill={l.color}
                opacity={
                  hoveredIdx === null || hoveredIdx === i ? 0.92 : 0.35
                }
                className="funnel-svg cursor-pointer transition-all duration-300"
                style={{
                  transitionProperty: "opacity, fill",
                  animation: mounted
                    ? `funnel-svg-in 0.5s ease-out ${i * 0.08}s both`
                    : "none",
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* hover glow */}
              {hoveredIdx === i && (
                <polygon
                  points={`${l.topLeft},${l.y} ${l.topRight},${l.y} ${l.botRight},${l.y + STAGE_H} ${l.botLeft},${l.y + STAGE_H}`}
                  fill="none"
                  stroke={l.color}
                  strokeWidth={2}
                  opacity={0.5}
                  rx={4}
                />
              )}
            </g>
          ))}

          {/* drop-off arrows between stages */}
          {stageLayout.slice(0, -1).map((l, i) => (
            <g
              key={`drop-${i}`}
              className="funnel-drop"
              style={{
                animation: mounted
                  ? `funnel-drop-in 0.4s ease-out ${(i + 1) * 0.1 + 0.3}s both`
                  : "none",
              }}
            >
              <line
                x1={500}
                y1={l.y + STAGE_H + 2}
                x2={500}
                y2={l.y + STAGE_H + GAP - 2}
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              <polygon
                points="495,14 500,22 505,14"
                fill="#94a3b8"
                transform={`translate(0, ${l.y + STAGE_H + GAP - 22})`}
              />
            </g>
          ))}
        </svg>

        {/* overlay labels */}
        <div
          className="absolute inset-0"
          style={{ pointerEvents: "none" }}
        >
          {stageLayout.map((l, i) => {
            const topPx = (l.y / totalH) * 100;
            const hPx = (STAGE_H / totalH) * 100;

            return (
              <div
                key={l.stage.key}
                className="funnel-stage absolute left-0 right-0 flex items-center justify-between px-2"
                style={{
                  top: `${topPx}%`,
                  height: `${hPx}%`,
                  animation: mounted
                    ? `funnel-fade-in 0.4s ease-out ${i * 0.08 + 0.15}s both`
                    : "none",
                }}
              >
                {/* label */}
                <span className="truncate text-sm font-bold text-white drop-shadow-sm">
                  {l.stage.label}
                </span>

                {/* count + conversion */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-white drop-shadow-sm tabular-nums">
                    {l.stage.count.toLocaleString("th-TH")}
                  </span>
                  {i > 0 && (
                    <span className="text-[11px] font-semibold text-white/70 drop-shadow-sm">
                      {pct(l.stage.conversionFromPrevious)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* drop-off details below funnel */}
      {stageLayout.length > 1 && (
        <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 dark:border-slate-700/50">
          {stageLayout.slice(1).map((l, i) => (
            <div
              key={`drop-detail-${i}`}
              className="flex items-center gap-2 text-xs"
              style={{
                animation: mounted
                  ? `funnel-fade-in 0.3s ease-out ${i * 0.06 + 0.5}s both`
                  : "none",
              }}
            >
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                {stages[i].label}
                <span className="mx-1">→</span>
                {l.stage.label}:
              </span>
              {l.dropPct !== null ? (
                <span className="font-black text-rose-500">
                  −{Math.round(l.dropPct)}% drop-off
                </span>
              ) : (
                <span className="text-slate-400">No data</span>
              )}
              <span className="text-slate-400">
                ({l.stage.count.toLocaleString("th-TH")} of{" "}
                {stages[i].count.toLocaleString("th-TH")})
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
