"use client";

import type { InsightCardData } from "@/types/dashboard";
import {
  ArrowCircleUp,
  Megaphone,
  MapPin,
  WarningCircle,
  Lightbulb,
} from "@phosphor-icons/react/dist/ssr";

/* ─── category config ─── */
const CATEGORY_CONFIG: Record<
  InsightCardData["category"],
  { label: string; border: string; bg: string; badge: string; icon: typeof ArrowCircleUp; text: string }
> = {
  improvement: {
    label: "Improvement",
    border: "border-l-rose-500",
    bg: "bg-rose-50/50 dark:bg-rose-950/20",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    icon: ArrowCircleUp,
    text: "text-rose-700 dark:text-rose-300",
  },
  promotion: {
    label: "Promotion",
    border: "border-l-emerald-500",
    bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: Megaphone,
    text: "text-emerald-700 dark:text-emerald-300",
  },
  concentration: {
    label: "Concentration",
    border: "border-l-amber-500",
    bg: "bg-amber-50/50 dark:bg-amber-950/20",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    icon: MapPin,
    text: "text-amber-700 dark:text-amber-300",
  },
  data_quality: {
    label: "Data Quality",
    border: "border-l-slate-400",
    bg: "bg-slate-50/50 dark:bg-slate-800/30",
    badge: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    icon: WarningCircle,
    text: "text-slate-600 dark:text-slate-400",
  },
  opportunity: {
    label: "Opportunity",
    border: "border-l-teal-500",
    bg: "bg-teal-50/50 dark:bg-teal-950/20",
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
    icon: Lightbulb,
    text: "text-teal-700 dark:text-teal-300",
  },
};

/* ─── confidence color ─── */
const CONFIDENCE_TONES: Record<string, string> = {
  high: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  low: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

/* ─── main ─── */
export function InsightCard({ insight, index = 0 }: { insight: InsightCardData; index?: number }) {
  const cat = CATEGORY_CONFIG[insight.category];
  const Icon = cat.icon;

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:border-slate-700/60 dark:bg-slate-800 dark:hover:border-slate-600"
      style={{
        animation: `insight-fade-in 0.5s ease-out ${index * 0.08}s both`,
      }}
    >
      <style>{`
        @keyframes insight-fade-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          article { animation: none !important; }
        }
      `}</style>

      {/* coloured left accent bar */}
      <div
        className={`absolute inset-y-2 left-0 w-1 rounded-r-full ${cat.border.replace("border-l-", "bg-")}`}
      />

      {/* header row */}
      <div className="flex items-start gap-3 pl-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cat.bg} ring-1 ring-inset ring-black/5 dark:ring-white/10`}>
          <Icon className={`h-5 w-5 ${cat.text}`} weight="fill" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-black text-slate-800 dark:text-slate-100">
              {insight.title}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide ${
                CONFIDENCE_TONES[insight.confidence] ?? CONFIDENCE_TONES.medium
              }`}
            >
              {insight.confidence}
            </span>
          </div>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${cat.text}`}>
            {cat.label}
          </span>
        </div>
      </div>

      {/* description */}
      <p className="mt-3 pl-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {insight.description}
      </p>

      {/* evidence callout */}
      <div
        className={`mt-3 ml-3 rounded-xl border p-3 ${cat.bg} ${cat.border.replace("border-l-", "border ")}`}
      >
        <p className="text-sm font-bold leading-6 text-slate-700 dark:text-slate-300">
          {insight.evidence}
        </p>
      </div>

      {/* suggested action */}
      <div className="mt-3 flex items-start gap-2 pl-3">
        <span className="mt-0.5 text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Action:
        </span>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          {insight.suggestedAction}
        </p>
      </div>

      {/* hover glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(300px circle at 50% 0%, rgba(10,107,98,0.04), transparent 70%)`,
        }}
      />
    </article>
  );
}
