"use client";

import { useState, type ReactNode } from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";

import { useWideDashboardChart } from "@/components/dashboard/useWideDashboardChart";

export function ResponsiveAnalyticsGroup({
  children,
  group,
  label,
}: {
  children: ReactNode;
  group: string;
  label: string;
}) {
  const isWide = useWideDashboardChart();
  const [isOpen, setIsOpen] = useState(false);
  const shouldRender = isWide || isOpen;

  return (
    <details
      className="group min-w-0 rounded-md border border-slate-200 bg-white sm:border-0 sm:bg-transparent"
      data-detail-group={group}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      open={shouldRender}
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-bold text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94717] sm:hidden">
        <span>{label}</span>
        <CaretDown aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" size={18} />
      </summary>
      <div className="border-t border-slate-200 p-3 sm:block sm:border-0 sm:p-0" data-detail-content>
        {shouldRender ? children : null}
      </div>
    </details>
  );
}
