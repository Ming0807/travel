"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { DashboardAlert } from "@/types/dashboard";
import {
  WarningCircle,
  WarningOctagon,
  Info,
  X,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";

/* ─── severity config ─── */
const SEVERITY_CONFIG = {
  critical: {
    container:
      "border-rose-200/70 bg-rose-50",
    icon: WarningOctagon,
    iconColor: "text-rose-600",
    title: "text-rose-900",
    message: "text-rose-800/80",
    action:
      "bg-rose-100 text-rose-700 hover:bg-rose-200 active:bg-rose-300",
    dismiss:
      "text-rose-400 hover:text-rose-600 hover:bg-rose-100/50",
  },
  warning: {
    container:
      "border-amber-200/70 bg-amber-50",
    icon: WarningCircle,
    iconColor: "text-amber-600",
    title: "text-amber-900",
    message: "text-amber-800/80",
    action:
      "bg-amber-100 text-amber-700 hover:bg-amber-200 active:bg-amber-300",
    dismiss:
      "text-amber-400 hover:text-amber-600 hover:bg-amber-100/50",
  },
  info: {
    container:
      "border-sky-200/70 bg-sky-50",
    icon: Info,
    iconColor: "text-sky-600",
    title: "text-sky-900",
    message: "text-sky-800/80",
    action:
      "bg-sky-100 text-sky-700 hover:bg-sky-200 active:bg-sky-300",
    dismiss:
      "text-sky-400 hover:text-sky-600 hover:bg-sky-100/50",
  },
} as const;

/* ─── dismiss storage key ─── */
function dismissKey(alertId: string, filtersSig: string): string {
  return `dash_alert_dismissed:${alertId}:${filtersSig}`;
}

/* ─── main component ─── */
export function DashboardAlertBanner({
  alert: alertData,
  filtersSig,
}: {
  alert: DashboardAlert;
  filtersSig?: string;
}) {
  const sig = filtersSig ?? "";
  const storageKey = dismissKey(alertData.id, sig);
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === "true") setDismissed(true);
    } catch {
      // localStorage unavailable
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // localStorage unavailable
    }
  };

  if (!mounted || dismissed) return null;

  const cfg = SEVERITY_CONFIG[alertData.severity];
  const Icon = cfg.icon;

  return (
    <div
      role="alert"
      className={`group relative rounded-2xl border p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 ${cfg.container}`}
      style={{
        animation: `alert-slide-in 0.35s ease-out both`,
      }}
    >
      <style>{`
        @keyframes alert-slide-in {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="alert"] { animation: none !important; }
        }
      `}</style>

      <div className="flex items-start gap-3.5">
        {/* icon */}
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${cfg.iconColor}`}
          weight="fill"
          aria-hidden
        />

        {/* content */}
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-black ${cfg.title}`}>
            {alertData.title}
          </p>
          <p className={`mt-1 text-sm leading-6 ${cfg.message}`}>
            {alertData.message}
          </p>

          {/* action link */}
          {alertData.actionable && alertData.actionHref ? (
            <Link
              href={alertData.actionHref}
              className={`mt-3 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${cfg.action}`}
            >
              {alertData.actionLabel ?? "View details"}
              <ArrowRight size={14} weight="bold" />
            </Link>
          ) : null}
        </div>

        {/* dismiss */}
        <button
          type="button"
          onClick={handleDismiss}
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${cfg.dismiss}`}
          aria-label="Dismiss alert"
        >
          <X size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
}
