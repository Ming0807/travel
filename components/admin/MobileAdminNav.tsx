"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X, MapPin, CaretDown } from "@phosphor-icons/react";
import { navGroups } from "./admin-nav-items";

export function MobileAdminNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -ml-2 text-slate-500 hover:text-slate-800 lg:hidden"
        aria-label="Open navigation menu"
      >
        <List size={24} weight="bold" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#FCFAF8] shadow-2xl transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-6 border-b border-slate-200/60">
          <Link className="flex items-center gap-2 px-2" href="/admin" onClick={() => setIsOpen(false)}>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600">
              <MapPin size={20} weight="fill" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-800 uppercase">Globe Trekker</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        <nav className="p-4 space-y-6">
          {navGroups.map((group) => {
            const hasActiveItem = group.items.some(i => pathname === i.href || pathname.startsWith(i.href + "/"));
            
            return (
              <details key={group.group} className="group" open={hasActiveItem}>
                <summary className="flex cursor-pointer items-center justify-between px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 select-none hover:text-slate-600 transition-colors">
                  {group.group}
                  <CaretDown size={12} weight="bold" className="transition-transform group-open:-rotate-180" />
                </summary>
                <div className="space-y-1 pb-4">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-[#FFEBE5] text-[#F3704C]"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} weight={isActive ? "fill" : "regular"} />
                        {item.label}
                      </div>
                      {item.badge && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F3704C] text-[10px] font-bold text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
                </div>
              </details>
            );
          })}
        </nav>
      </div>
    </>
  );
}
