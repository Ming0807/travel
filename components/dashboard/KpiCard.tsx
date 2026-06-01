"use client";

import { useState, useEffect, useId, type ReactNode } from "react";
import type { DashboardKpi, TrendPoint } from "@/types/dashboard";
import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { SmallSampleWarning } from "@/components/dashboard/SmallSampleWarning";
import {
  Users,
  MapPin,
  Files,
  Star,
  CurrencyCircleDollar,
  ChartBar,
  ArrowUp,
  ArrowDown,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";

/* ──────────────────────────────────────────────
   colour palette per valueType
   ────────────────────────────────────────────── */
type Accent = {
  border: string;
  bg: string;
  icon: string;
  dot: string;
  sparkline: string;
};

const ACCENTS: Record<string, Accent> = {
  count: {
    border: "bg-teal-500",
    bg: "bg-teal-50 dark:bg-teal-950/30",
    icon: "text-teal-600 dark:text-teal-400",
    dot: "bg-teal-500",
    sparkline: "#14b8a6",
  },
  percentage: {
    border: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    icon: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    sparkline: "#10b981",
  },
  rating: {
    border: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    icon: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    sparkline: "#f59e0b",
  },
  currency_range: {
    border: "bg-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    icon: "text-violet-600 dark:text-violet-400",
    dot: "bg-violet-500",
    sparkline: "#8b5cf6",
  },
};

const DEFAULT_ACCENT: Accent = ACCENTS.count;

/* ──────────────────────────────────────────────
   icon picker
   ────────────────────────────────────────────── */
function getIcon(key: string, label: string, accent: Accent): ReactNode {
  const k = (key + label).toLowerCase();
  const cls = `h-5 w-5 shrink-0 ${accent.icon}`;
  if (k.includes("tourist") || k.includes("user") || k.includes("visitor"))
    return <Users className={cls} weight="fill" />;
  if (k.includes("visit") || k.includes("checkin") || k.includes("attraction") || k.includes("destination"))
    return <MapPin className={cls} weight="fill" />;
  if (k.includes("certificate") || k.includes("article") || k.includes("message") || k.includes("stamp"))
    return <Files className={cls} weight="fill" />;
  if (k.includes("satisfaction") || k.includes("review") || k.includes("rating") || k.includes("score"))
    return <Star className={cls} weight="fill" />;
  if (k.includes("expense") || k.includes("spending") || k.includes("revenue") || k.includes("cost"))
    return <CurrencyCircleDollar className={cls} weight="fill" />;
  return <ChartBar className={cls} weight="fill" />;
}

/* ──────────────────────────────────────────────
   extract raw number from a display string
   ────────────────────────────────────────────── */
function extractNumber(value: string): number | null {
  if (value === "No data" || value === "N/A") return null;
  const cleaned = value.replace(/[,%฿$€£¥]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/* ──────────────────────────────────────────────
   animated counter hook – ease-out cubic
   ────────────────────────────────────────────── */
function useCountUp(target: number | null, duration = 900) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === null) {
      setCurrent(0);
      return;
    }

    const finalTarget = target;
    const startTime = performance.now();
    let rafId: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      /* ease-out cubic */
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(finalTarget * eased);
      if (progress < 1) rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return current;
}

/* ──────────────────────────────────────────────
   format the animated raw number back to display
   ────────────────────────────────────────────── */
function formatAnimated(raw: number, valueType: string, original: string): string {
  if (valueType === "count") return Math.round(raw).toLocaleString();
  if (valueType === "percentage") return `${Math.round(raw)}%`;
  if (valueType === "rating") return raw.toFixed(1);
  return original;
}

/* ──────────────────────────────────────────────
   sparkline mini SVG
   ────────────────────────────────────────────── */
function Sparkline({ data, color }: { data: TrendPoint[]; color: string }) {
  const id = useId();

  if (!data || data.length < 2) return null;

  const W = 200;
  const H = 36;
  const PAD = 2;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pts = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - 2 * PAD);
    const y = H - PAD - ((d.value - min) / range) * (H - 2 * PAD);
    return { x, y };
  });

  const lineD = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaD = `${lineD} L${pts[pts.length - 1].x.toFixed(1)},${H} L${pts[0].x.toFixed(1)},${H} Z`;
  const gradId = `spk-grad-${id.replace(/:/g, '')}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-9 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Sparkline"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} className="transition-opacity" />
      <path
        d={lineD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-[stroke]"
      />
      {/* last-point dot */}
      <circle
        cx={pts[pts.length - 1].x}
        cy={pts[pts.length - 1].y}
        r={2.5}
        fill={color}
        className="transition-[r,fill]"
      />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   main KpiCard component
   ────────────────────────────────────────────── */
export function KpiCard({
  metric,
  sparklineData,
  index = 0,
  sampleCount,
  sampleLabel = "responses",
}: {
  metric: DashboardKpi;
  sparklineData?: TrendPoint[];
  index?: number;
  sampleCount?: number;
  sampleLabel?: string;
}) {
  const rawNumber = extractNumber(metric.value);
  const animated = useCountUp(rawNumber, 900);
  const accent = ACCENTS[metric.valueType] ?? DEFAULT_ACCENT;

  const isNoData = metric.value === "No data" || metric.value === "N/A";
  const displayValue = isNoData
    ? metric.value
    : rawNumber !== null
      ? formatAnimated(animated, metric.valueType, metric.value)
      : metric.value;

  const noteIsPositive = metric.note
    ? !metric.note.startsWith("-") &&
      !metric.note.startsWith("−") &&
      !metric.note.startsWith("↓")
    : false;

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800 dark:hover:border-slate-600 ${
        isNoData
          ? "border-dashed border-slate-300 dark:border-slate-600"
          : "border-slate-200/70"
      }`}
      style={{
        animation: `kpi-fade-in-up 0.5s ease-out ${index * 0.07}s both`,
      }}
    >
      {/* ── keyframe animation ── */}
      <style>{`
        @keyframes kpi-fade-in-up {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          article {
            animation: none !important;
          }
        }
      `}</style>

      {/* coloured top accent bar */}
      <div
        className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl opacity-90 ${accent.border}`}
      />

      {/* ── row: icon + label + value ── */}
      <div className="flex items-start gap-3.5">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.bg} ring-1 ring-inset ring-black/5 dark:ring-white/10`}
        >
          {getIcon(metric.key, metric.label, accent)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 dark:text-slate-500">
              {metric.label}
            </h3>
            <span className="shrink-0">
              <MetricTooltip definition={metric.definition} />
            </span>
          </div>

          {isNoData ? (
            <div className="mt-1 flex items-center gap-2">
              <WarningCircle
                size={18}
                weight="fill"
                className="shrink-0 text-slate-300 dark:text-slate-600"
                aria-hidden
              />
              <div>
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500">
                  No data
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-slate-400/70 dark:text-slate-500/70">
                  {metric.definition}
                </p>
              </div>
            </div>
          ) : (
            <p
              className={`mt-0.5 truncate text-2xl font-black tracking-tight tabular-nums transition-colors duration-300 text-slate-800 dark:text-slate-100`}
            >
              {displayValue}
            </p>
          )}
        </div>
      </div>

      {/* ── small sample warning ── */}
      {sampleCount !== undefined && sampleCount < 10 && !isNoData ? (
        <div className="mt-3">
          <SmallSampleWarning count={sampleCount} label={sampleLabel} />
        </div>
      ) : null}

      {/* ── note / change indicator ── */}
      {metric.note && !isNoData ? (
        <div className="mt-3 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none ${
              noteIsPositive
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
            }`}
          >
            {noteIsPositive ? <ArrowUp size={12} weight="bold" /> : <ArrowDown size={12} weight="bold" />}
            {metric.note}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">vs expected</span>
        </div>
      ) : !isNoData ? (
        <div className="mt-3 h-[22px]" aria-hidden />
      ) : null}

      {/* ── sparkline ── */}
      {!isNoData && sparklineData && sparklineData.length >= 2 && (
        <div className="mt-2.5 border-t border-slate-100 pt-2.5 dark:border-slate-700/50">
          <Sparkline data={sparklineData} color={accent.sparkline} />
        </div>
      )}

      {/* ── hover glow overlay ── */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(300px circle at 50% 0%, ${accent.sparkline}0a, transparent 70%)`,
        }}
      />
    </article>
  );
}
