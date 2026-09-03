"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { buildDashboardNavigationHref, dashboardNavigation } from "@/components/dashboard/dashboard-navigation";

export function DashboardTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav aria-label="หมวดการวิเคราะห์" className="min-w-0 border-y border-slate-200 bg-[#F7F7F5] lg:hidden">
      <div className="hide-scrollbar flex max-w-full gap-1 overflow-x-auto px-2 py-1.5 sm:px-3">
        {dashboardNavigation.map((tab) => {
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.page}
              href={buildDashboardNavigationHref(tab.href, searchParams.toString())}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-[5px] border px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B94727] focus-visible:ring-offset-1 ${
                isActive
                  ? "border-[#171717] bg-[#171717] text-white"
                  : "border-transparent text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" weight={isActive ? "fill" : "regular"} aria-hidden="true" />
              {tab.shortLabel}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
