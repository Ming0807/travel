"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartLineUp,
  Users,
  MapPinLine,
  Wallet,
  Smiley,
  FunnelSimple,
  TreeEvergreen,
  Star,
} from "@phosphor-icons/react/dist/ssr";

const tabs = [
  { name: "Executive", href: "/admin/dashboard", exact: true, icon: ChartLineUp },
  { name: "Tourists", href: "/admin/dashboard/tourists", icon: Users },
  { name: "Visits & Behavior", href: "/admin/dashboard/visits", icon: MapPinLine },
  { name: "Attractions", href: "/admin/dashboard/attractions", icon: Star },
  { name: "Expenses", href: "/admin/dashboard/expenses", icon: Wallet },
  { name: "Satisfaction", href: "/admin/dashboard/satisfaction", icon: Smiley },
  { name: "Funnel", href: "/admin/dashboard/funnel", icon: FunnelSimple },
  { name: "Sustainability", href: "/admin/dashboard/sustainability", icon: TreeEvergreen },
];

export function DashboardTabs() {
  const pathname = usePathname();
  const [activeStyle, setActiveStyle] = useState<{ left: number; width: number } | null>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const activeIdx = tabs.findIndex((tab) =>
    tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
  );
  const activeIndex = activeIdx === -1 ? 0 : activeIdx;

  useEffect(() => {
    const el = tabRefs.current[activeIndex];
    if (el) {
      const rect = el.getBoundingClientRect();
      const parentRect = el.parentElement?.getBoundingClientRect();
      if (parentRect) {
        setActiveStyle({
          left: rect.left - parentRect.left,
          width: rect.width,
        });
      }
    }
  }, [activeIndex, pathname]);

  return (
    <div className="relative mb-6">
      {/* scroll container */}
      <div className="flex space-x-1 overflow-x-auto border-b border-slate-200 pb-0 dark:border-slate-700">
        {/* animated indicator */}
        {activeStyle && (
          <div
            className="absolute bottom-0 h-0.5 rounded-full bg-[#0A6B62] transition-all duration-300 ease-out"
            style={{
              left: activeStyle.left,
              width: activeStyle.width,
            }}
          />
        )}

        {tabs.map((tab, i) => {
          const isActive = i === activeIndex;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              ref={(el) => { tabRefs.current[i] = el; }}
              className={`relative flex shrink-0 items-center gap-1.5 rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "text-[#073F37] dark:text-teal-300"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <tab.icon
                className="h-4 w-4"
                weight={isActive ? "fill" : "regular"}
              />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
