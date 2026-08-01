"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartLineUp,
  FunnelSimple,
  MapPinLine,
  Smiley,
  Star,
  TreeEvergreen,
  Users,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";

const tabs = [
  { name: "ภาพรวม", href: "/admin/dashboard", exact: true, icon: ChartLineUp },
  { name: "นักท่องเที่ยว", href: "/admin/dashboard/tourists", icon: Users },
  { name: "การเดินทาง", href: "/admin/dashboard/visits", icon: MapPinLine },
  { name: "สถานที่", href: "/admin/dashboard/attractions", icon: Star },
  { name: "ค่าใช้จ่าย", href: "/admin/dashboard/expenses", icon: Wallet },
  { name: "ความพึงพอใจ", href: "/admin/dashboard/satisfaction", icon: Smiley },
  { name: "เส้นทางผู้ใช้", href: "/admin/dashboard/funnel", icon: FunnelSimple },
  { name: "ความยั่งยืน", href: "/admin/dashboard/sustainability", icon: TreeEvergreen },
];

export function DashboardTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="หมวดการวิเคราะห์" className="min-w-0 border-b border-slate-200">
      <div className="hide-scrollbar flex max-w-full gap-1 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-h-11 shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-[#B94727] bg-[#FFF7F3] text-[#8F351F]"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" weight={isActive ? "fill" : "regular"} aria-hidden="true" />
              {tab.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
