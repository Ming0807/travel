"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Buildings, CaretDown, MapPin } from "@phosphor-icons/react/dist/ssr";
import { getVisibleNavGroups, navGroups, type NavGroup as NavGroupType, type NavItem } from "./admin-nav-items";
import { useAdminAccess } from "./AdminAccessContext";
import { buildDashboardNavigationHref } from "@/components/dashboard/dashboard-navigation";

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const access = useAdminAccess();
  const visibleGroups = getVisibleNavGroups(navGroups, access.permissions, access.resolved);

  return (
    <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 border-r border-[var(--admin-border)] bg-[#FBFBFA] lg:flex lg:flex-col">
      <div className="flex h-full flex-col overflow-hidden">
        <Link className="flex min-h-16 shrink-0 items-center gap-3 border-b border-[var(--admin-border)] px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#E77455]" href="/admin">
          <div className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-[#D94717] bg-white text-[#D94717]">
            <Buildings size={21} weight="bold" />
          </div>
          <span className="min-w-0">
            <span className="block text-[13px] font-black leading-5 text-[#202020]">ท่องเที่ยวชายแดนใต้</span>
            <span className="block text-[10px] font-bold uppercase leading-4 text-slate-500">Data &amp; Intelligence</span>
          </span>
        </Link>
        <nav aria-label="เมนูผู้ดูแลระบบ" className="flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 py-4">
          {visibleGroups.map((group) => (
            <NavGroup key={`${group.group}-${pathname}`} group={group} pathname={pathname} queryString={searchParams.toString()} />
          ))}
        </nav>
        <div className="shrink-0 border-t border-[var(--admin-border)] px-4 py-4">
          <div className="flex items-start gap-2.5 rounded-[4px] border border-[var(--admin-border)] bg-white px-3 py-2.5">
            <MapPin className="mt-0.5 shrink-0 text-[#D94717]" size={16} weight="fill" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-slate-500">พื้นที่นำร่อง</p>
              <p className="truncate text-xs font-black text-[#202020]">ยะลา (Yala)</p>
            </div>
          </div>
          <p className="mt-3 text-[10px] font-semibold text-slate-400">Southern Border Platform</p>
        </div>
      </div>
    </aside>
  );
}
function NavGroup({ group, pathname, queryString }: { group: NavGroupType; pathname: string; queryString: string }) {
  const itemIsActive = (item: NavItem) => item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
  const hasActiveItem = group.items.some(itemIsActive);

  const [isOpen, setIsOpen] = useState(hasActiveItem);

  return (
    <details className="group" open={isOpen} onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="mb-1 flex min-h-8 cursor-pointer select-none items-center justify-between rounded-[4px] px-2 text-[11px] font-black text-slate-500 transition-colors hover:bg-white hover:text-slate-900">
        {group.group}
        <CaretDown size={12} weight="bold" className="transition-transform group-open:-rotate-180" />
      </summary>
      <div className="space-y-1 pb-2">
        {group.items.map((item: NavItem) => {
          const Icon = item.icon as React.ComponentType<{ size?: number; weight?: "fill" | "regular" }>;
          const isActive = itemIsActive(item);

          return (
            <Link
              className={`flex min-h-10 items-center justify-between rounded-[4px] border px-3 py-2 text-[13px] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#E77455] ${
                isActive
                  ? "border-[#F0C8BB] bg-[#FFF0EA] text-[#B94727] shadow-[0_2px_6px_rgba(217,71,23,0.08)]"
                  : "border-transparent text-slate-600 hover:bg-white hover:text-[#202020]"
              }`}
              href={buildDashboardNavigationHref(item.href, queryString)}
              key={item.href}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} weight={isActive ? "fill" : "regular"} />
                {item.label}
              </div>
              {item.badge && (
                <span className="flex min-h-5 min-w-5 items-center justify-center rounded-[4px] bg-[#C84F2D] px-1 text-xs font-bold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </details>
  );
}
