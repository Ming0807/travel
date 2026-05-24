"use client";

import { useState, useEffect } from "react";
import type { DistributionItem } from "@/types/dashboard";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { NoDataState } from "@/components/dashboard/NoDataState";

/* ─── 10-color palette from project theme ─── */
const BAR_COLORS = [
  "#F3704C", "#0A6B62", "#14b8a6", "#D6A13D",
  "#8b5cf6", "#e11d48", "#10b981", "#6366f1",
  "#f59e0b", "#073F37",
];

/* ─── types ─── */
type BarChartCardProps = {
  title: string;
  definition: string;
  data: DistributionItem[];
  emptyDescription: string;
};

/* ─── main component ─── */
export function BarChartCard({ title, definition, data, emptyDescription }: BarChartCardProps) {
  const [mounted, setMounted] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(id);
  }, []);

  /* single animated ratio for all counters — avoids hooks-in-loop */
  useEffect(() => {
    const start = performance.now();
    const duration = 600;
    let raf: number;
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      setAnimProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const max = Math.max(...data.map((item) => item.value), 0);

  return (
    <section className="group/card rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:border-slate-700/60 dark:bg-slate-800 dark:hover:border-slate-600">
      {/* ── keyframes ── */}
      <style>{`
        @keyframes bar-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .bar-grow { transition: none !important; }
          .bar-item  { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">{title}</h2>
        <MetricTooltip definition={definition} />
      </div>

      {/* body */}
      {data.length === 0 ? (
        <div className="mt-4">
          <NoDataState description={emptyDescription} />
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {data.slice(0, 8).map((item, i) => {
            const width = max > 0 ? Math.max((item.value / max) * 100, 2) : 0;
            const color = BAR_COLORS[i % BAR_COLORS.length];
            const animatedValue = item.value * animProgress;

            return (
              <div
                key={item.label}
                className="bar-item"
                style={{
                  animation: `bar-fade-in 0.4s ease-out ${i * 0.06}s both`,
                }}
              >
                {/* label row */}
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 truncate font-bold text-slate-600 dark:text-slate-300">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {item.label}
                  </span>
                  <span className="shrink-0 font-black tabular-nums text-slate-800 dark:text-slate-100">
                    {Math.round(animatedValue).toLocaleString("th-TH")}
                  </span>
                </div>

                {/* bar track */}
                <div className="group/bar relative h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/50">
                  <div
                    className="bar-grow h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: mounted ? `${width}%` : "0%",
                      backgroundColor: color,
                    }}
                  />
                  {/* hover glow */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover/bar:opacity-30"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
                    }}
                  />
                </div>

                {/* percent label */}
                {item.percent !== null && (
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {Math.round(item.percent * 100)}% of selected data
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* hover glow overlay */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{
          background: `radial-gradient(400px circle at 50% 0%, #0A6B62 0%, transparent 70%)`,
          opacity: 0.03,
        }}
      />
    </section>
  );
}
