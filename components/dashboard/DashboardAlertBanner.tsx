"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Info, WarningCircle, WarningOctagon, X } from "@phosphor-icons/react/dist/ssr";
import { localizeDashboardAlert } from "@/components/dashboard/dashboard-localization";
import type { DashboardAlert } from "@/types/dashboard";

const SEVERITY = {
  critical: { container: "border-rose-200 bg-rose-50", icon: WarningOctagon, iconColor: "text-rose-700", title: "text-rose-950", body: "text-rose-800" },
  warning: { container: "border-amber-200 bg-amber-50", icon: WarningCircle, iconColor: "text-amber-700", title: "text-amber-950", body: "text-amber-800" },
  info: { container: "border-sky-200 bg-sky-50", icon: Info, iconColor: "text-sky-700", title: "text-sky-950", body: "text-sky-800" },
} as const;

function dismissKey(alertId: string, filtersSig: string): string {
  return `dash_alert_dismissed:${alertId}:${filtersSig}`;
}

export function DashboardAlertBanner({ alert, filtersSig = "" }: { alert: DashboardAlert; filtersSig?: string }) {
  const localized = localizeDashboardAlert(alert);
  const storageKey = dismissKey(alert.id, filtersSig);
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setDismissed(localStorage.getItem(storageKey) === "true");
      } catch {
        setDismissed(false);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [storageKey]);

  if (dismissed !== false) return null;

  const config = SEVERITY[alert.severity];
  const Icon = config.icon;

  function dismiss() {
    setDismissed(true);
    try { localStorage.setItem(storageKey, "true"); } catch { /* browser storage may be unavailable */ }
  }

  return (
    <article role="alert" className={`rounded-md border p-3 ${config.container}`}>
      <div className="flex items-start gap-3">
        <Icon data-severity-icon={alert.severity} aria-hidden="true" className={`mt-0.5 shrink-0 ${config.iconColor}`} size={19} weight="fill" />
        <div className="min-w-0 flex-1">
          <h3 className={`text-sm font-bold ${config.title}`}>{localized.title}</h3>
          <p className={`mt-1 text-sm leading-6 ${config.body}`}>{localized.message}</p>
          {localized.actionable && localized.actionHref ? (
            <Link href={localized.actionHref} className="alert-action-link mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-md border border-current/20 px-3 text-xs font-bold hover:bg-white/60">
              {localized.actionLabel}
              <ArrowRight aria-hidden="true" size={13} weight="bold" />
            </Link>
          ) : null}
        </div>
        <button type="button" onClick={dismiss} data-dismiss-id={alert.id} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-white/60 hover:text-slate-900" aria-label={`ซ่อนการแจ้งเตือน ${localized.title}`}>
          <X aria-hidden="true" size={15} weight="bold" />
        </button>
      </div>
    </article>
  );
}
