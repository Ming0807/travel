"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X, MapPin, CaretDown } from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import { getVisibleNavGroups, navGroups, type NavGroup as NavGroupType, type NavItem } from "./admin-nav-items";
import { useAdminAccess } from "./AdminAccessContext";

export function MobileAdminNav() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const access = useAdminAccess();
  const visibleGroups = getVisibleNavGroups(navGroups, access.permissions, access.resolved);

  const closeDrawer = useCallback(() => {
    triggerRef.current?.focus({ preventScroll: true });
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDrawer, isOpen]);

  function handleFocusTrap(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], summary, [tabindex]:not([tabindex="-1"])'
      )
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  const drawer = isOpen && typeof document !== "undefined"
    ? createPortal(
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={closeDrawer}
          />
          <div
            id="mobile-admin-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="เมนูผู้ดูแลระบบ"
            onKeyDown={handleFocusTrap}
            className="relative h-dvh w-[min(18rem,calc(100vw-1.5rem))] overflow-y-auto bg-slate-50 shadow-2xl"
          >
            <div className="flex min-h-16 items-center gap-2 border-b border-slate-200/60 px-3 py-3">
              <Link className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1" href="/admin" onClick={closeDrawer}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <MapPin aria-hidden="true" size={20} weight="fill" />
                </span>
                <span className="truncate text-base font-black tracking-tight text-slate-800">ระบบจัดการท่องเที่ยว</span>
              </Link>
              <button
                ref={closeRef}
                type="button"
                onClick={closeDrawer}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
                aria-label="ปิดเมนูผู้ดูแลระบบ"
              >
                <X aria-hidden="true" size={24} weight="bold" />
              </button>
            </div>

            <nav className="space-y-6 p-4 pb-20" aria-label="เมนูผู้ดูแลระบบบนมือถือ">
              {visibleGroups.map((group) => (
                <MobileNavGroup key={`${group.group}-${pathname}`} group={group} pathname={pathname} closeDrawer={closeDrawer} />
              ))}
            </nav>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative z-10 -ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62] lg:hidden"
        aria-label="เปิดเมนูผู้ดูแลระบบ"
        aria-expanded={isOpen}
        aria-controls="mobile-admin-drawer"
      >
        <List aria-hidden="true" size={24} weight="bold" />
      </button>
      {drawer}
    </>
  );
}

function MobileNavGroup({ group, pathname, closeDrawer }: { group: NavGroupType; pathname: string; closeDrawer: () => void }) {
  const hasActiveItem = group.items.some((i: NavItem) => pathname === i.href || pathname.startsWith(i.href + "/"));
  const [isGroupOpen, setIsGroupOpen] = useState(hasActiveItem);

  return (
    <details className="group" open={isGroupOpen} onToggle={(e) => setIsGroupOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="flex cursor-pointer items-center justify-between px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 select-none hover:text-slate-600 transition-colors">
        {group.group}
        <CaretDown size={12} weight="bold" className="transition-transform group-open:-rotate-180" />
      </summary>
      <div className="space-y-1 pb-4">
        {group.items.map((item: NavItem) => {
          const Icon = item.icon as React.ComponentType<{ size?: number; weight?: "fill" | "regular" }>;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeDrawer}
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
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F3704C] text-xs font-bold text-white">
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
