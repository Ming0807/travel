"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, CaretDown } from "@phosphor-icons/react/dist/ssr";
import { getVisibleNavGroups, navGroups, type NavGroup as NavGroupType, type NavItem } from "./admin-nav-items";
import { useAdminAccess } from "./AdminAccessContext";

export function AdminSidebar() {
  const pathname = usePathname();
  const access = useAdminAccess();
  const visibleGroups = getVisibleNavGroups(navGroups, access.permissions, access.resolved);

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-full flex-col overflow-hidden px-3 py-5">
        <Link className="mb-6 flex shrink-0 items-center gap-3 rounded-[4px] px-2 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E77455]" href="/admin">
          <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-[#202020] text-[#E77455]">
            <MapPin size={20} weight="fill" />
          </div>
          <span className="text-sm font-black leading-5 text-[#202020]">ท่องเที่ยวชายแดนใต้</span>
        </Link>
        <nav aria-label="เมนูผู้ดูแลระบบ" className="flex-1 space-y-4 overflow-y-auto overscroll-contain pb-16">
          {visibleGroups.map((group) => (
            <NavGroup key={`${group.group}-${pathname}`} group={group} pathname={pathname} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
function NavGroup({ group, pathname }: { group: NavGroupType; pathname: string }) {
  const hasActiveItem = group.items.some((i: NavItem) => pathname === i.href || pathname.startsWith(i.href + "/"));

  const [isOpen, setIsOpen] = useState(hasActiveItem);

  return (
    <details className="group" open={isOpen} onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="mb-1.5 flex min-h-8 cursor-pointer select-none items-center justify-between rounded-[4px] px-3 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800">
        {group.group}
        <CaretDown size={12} weight="bold" className="transition-transform group-open:-rotate-180" />
      </summary>
      <div className="space-y-1 pb-4">
        {group.items.map((item: NavItem) => {
          const Icon = item.icon as React.ComponentType<{ size?: number; weight?: "fill" | "regular" }>;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              className={`flex min-h-10 items-center justify-between rounded-[4px] px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#E77455] ${
                isActive
                  ? "bg-[#FFF0EA] text-[#B94727]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#202020]"
              }`}
              href={item.href}
              key={item.href}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} weight={isActive ? "fill" : "regular"} />
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
