"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartLineUp, Users, MapPinLine, Wallet, Smiley, FunnelSimple, TreeEvergreen } from "@phosphor-icons/react";

const tabs = [
  { name: "Executive", href: "/admin/dashboard", exact: true, icon: ChartLineUp },
  { name: "Tourists", href: "/admin/dashboard/tourists", icon: Users },
  { name: "Visits & Behavior", href: "/admin/dashboard/visits", icon: MapPinLine },
  { name: "Expenses", href: "/admin/dashboard/expenses", icon: Wallet },
  { name: "Satisfaction", href: "/admin/dashboard/satisfaction", icon: Smiley },
  { name: "Funnel", href: "/admin/dashboard/funnel", icon: FunnelSimple },
  { name: "Sustainability", href: "/admin/dashboard/sustainability", icon: TreeEvergreen },
];

export function DashboardTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 flex space-x-2 overflow-x-auto border-b border-slate-200 pb-2">
      {tabs.map((tab) => {
        const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? "bg-[#0A6B62]/10 text-[#073F37]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <tab.icon className="h-5 w-5" weight={isActive ? "fill" : "regular"} />
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
