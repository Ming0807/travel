"use client";

import { useState, useMemo } from "react";
import type { DashboardAlert } from "@/types/dashboard";
import { DashboardAlertBanner } from "@/components/dashboard/DashboardAlertBanner";
import {
  WarningCircle,
  WarningOctagon,
  Info,
  CaretDown,
  CaretUp,
  X,
} from "@phosphor-icons/react/dist/ssr";

/* ─── severity counters ─── */
function countBySeverity(alerts: DashboardAlert[]) {
  let critical = 0;
  let warning = 0;
  let info = 0;
  for (const a of alerts) {
    if (a.severity === "critical") critical++;
    else if (a.severity === "warning") warning++;
    else info++;
  }
  return { critical, warning, info };
}

/* ─── main component ─── */
export function DashboardAlertBar({
  alerts,
  filtersSig,
}: {
  alerts: DashboardAlert[];
  filtersSig?: string;
}) {
  const [expanded, setExpanded] = useState(true);

  const counts = useMemo(() => countBySeverity(alerts), [alerts]);

  if (alerts.length === 0) return null;

  const hasCritical = counts.critical > 0;
  const borderColor = hasCritical
    ? "border-rose-200"
    : counts.warning > 0
      ? "border-amber-200"
      : "border-sky-200";
  const bgColor = hasCritical
    ? "bg-rose-50/80"
    : counts.warning > 0
      ? "bg-amber-50/80"
      : "bg-sky-50/80";

  return (
    <div
      className={`rounded-2xl border ${borderColor} ${bgColor} overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all`}
    >
      {/* summary header */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/5"
      >
        {/* severity dots */}
        <div className="flex items-center gap-1">
          {counts.critical > 0 && (
            <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-rose-500">
              <WarningOctagon size={8} weight="fill" className="text-white" />
            </span>
          )}
          {counts.warning > 0 && (
            <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-500">
              <WarningCircle size={8} weight="fill" className="text-white" />
            </span>
          )}
          {counts.info > 0 && (
            <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-sky-500">
              <Info size={8} weight="fill" className="text-white" />
            </span>
          )}
        </div>

        {/* summary text */}
        <span className="text-sm font-bold text-slate-800">
          {alerts.length === 1
            ? "1 dashboard alert"
            : `${alerts.length} dashboard alerts`}
        </span>

        {/* breakdown */}
        <span className="hidden text-xs text-slate-500 sm:inline">
          {[
            counts.critical > 0 && `${counts.critical} critical`,
            counts.warning > 0 && `${counts.warning} warning`,
            counts.info > 0 && `${counts.info} info`,
          ]
            .filter(Boolean)
            .join(", ")}
        </span>

        <span className="ml-auto flex items-center gap-2 text-xs text-slate-400">
          {expanded ? (
            <>
              Hide <CaretUp size={14} weight="bold" />
            </>
          ) : (
            <>
              Show <CaretDown size={14} weight="bold" />
            </>
          )}
        </span>
      </button>

      {/* expanded alert list */}
      {expanded && (
        <div className="space-y-2 px-4 pb-4">
          {alerts.map((alertItem) => (
            <DashboardAlertBanner
              key={alertItem.id}
              alert={alertItem}
              filtersSig={filtersSig}
            />
          ))}
        </div>
      )}
    </div>
  );
}
