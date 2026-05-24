"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  MagnifyingGlass,
  MapTrifold,
  Info,
  UserCircle
} from "@phosphor-icons/react/dist/ssr";

const items = [
  { href: "/", label: "หน้าแรก", Icon: House },
  { href: "/attractions", label: "สถานที่", Icon: MagnifyingGlass },
  { href: "/stories", label: "เรื่องราว", Icon: MapTrifold },
  { href: "/about", label: "เกี่ยวกับ", Icon: Info },
  { href: "/passport", label: "โปรไฟล์", Icon: UserCircle }
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const activeIndex = items.findIndex((item) => pathname === item.href);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: "0%", width: "20%" });
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const el = itemRefs.current[activeIndex >= 0 ? activeIndex : 0];
    if (el) {
      const parent = el.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const left = ((elRect.left - parentRect.left) / parentRect.width) * 100;
        const width = (elRect.width / parentRect.width) * 100;
        setIndicatorStyle({ left: `${left}%`, width: `${width}%` });
      }
    }
  }, [pathname, activeIndex]);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/80 bg-white/92 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_35px_rgba(15,23,42,0.10)] backdrop-blur-xl lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="relative mx-auto grid max-w-md grid-cols-5 text-center">
        {/* Sliding Indicator */}
        <div
          className="absolute -top-3 h-0.5 rounded-full bg-coral transition-all duration-300 ease-out"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />

        {items.map((item, i) => {
          const Icon = item.Icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              ref={(el) => { itemRefs.current[i] = el; }}
              className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
                isActive ? "text-coral scale-105" : "text-muted hover:text-ink"
              }`}
            >
              <Icon size={24} weight={isActive ? "fill" : "regular"} />
              <p className="mt-1 text-[11px] font-bold transition-colors duration-200">{item.label}</p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
