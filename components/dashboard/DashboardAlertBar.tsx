"use client";

import { useMemo, useState } from "react";
import { CaretDown, CaretUp, Info, WarningCircle, WarningOctagon } from "@phosphor-icons/react/dist/ssr";
import { DashboardAlertBanner } from "@/components/dashboard/DashboardAlertBanner";
import type { DashboardAlert } from "@/types/dashboard";

function countBySeverity(alerts: DashboardAlert[]) {
  return alerts.reduce(
    (counts, alert) => ({ ...counts, [alert.severity]: counts[alert.severity] + 1 }),
    { critical: 0, warning: 0, info: 0 },
  );
}

export function DashboardAlertBar({ alerts, filtersSig }: { alerts: DashboardAlert[]; filtersSig?: string }) {
  const [expanded, setExpanded] = useState(false);
  const counts = useMemo(() => countBySeverity(alerts), [alerts]);
  const visibleAlerts = alerts.slice(0, 3);

  if (alerts.length === 0) return null;

  return (
    <section className="dashboard-alert-bar overflow-hidden rounded-md border border-slate-200 bg-white" aria-labelledby="dashboard-alert-heading">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="alert-bar-toggle flex min-h-12 w-full items-center gap-3 px-4 text-left hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B94727]"
        aria-expanded={expanded}
        aria-controls="dashboard-alert-list"
      >
        <span className="flex items-center gap-1" aria-hidden="true">
          {counts.critical > 0 ? <WarningOctagon data-severity-dot="critical" className="text-rose-600" size={17} weight="fill" /> : null}
          {counts.warning > 0 ? <WarningCircle data-severity-dot="warning" className="text-amber-600" size={17} weight="fill" /> : null}
          {counts.info > 0 ? <Info data-severity-dot="info" className="text-sky-600" size={17} weight="fill" /> : null}
        </span>
        <span id="dashboard-alert-heading" className="alert-bar-text text-sm font-bold text-slate-800">สิ่งที่ควรตรวจสอบ {alerts.length} รายการ</span>
        <span className="alert-bar-breakdown hidden text-xs text-slate-500 sm:inline">
          {[counts.critical > 0 && `เร่งด่วน ${counts.critical}`, counts.warning > 0 && `เฝ้าระวัง ${counts.warning}`, counts.info > 0 && `ข้อมูล ${counts.info}`].filter(Boolean).join(" · ")}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#B94727]">
          <span className="alert-bar-action-label">{expanded ? "ยุบ" : "ดูรายการ"}</span>
          {expanded ? <CaretUp aria-hidden="true" size={14} /> : <CaretDown aria-hidden="true" size={14} />}
        </span>
      </button>

      {expanded ? (
        <div id="dashboard-alert-list" className="alert-bar-body space-y-2 border-t border-slate-200 p-3">
          {visibleAlerts.map((alert) => <DashboardAlertBanner key={alert.id} alert={alert} filtersSig={filtersSig} />)}
          {alerts.length > visibleAlerts.length ? (
            <p className="px-1 text-xs text-slate-500">แสดง 3 รายการที่สำคัญที่สุด จากทั้งหมด {alerts.length} รายการ</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
