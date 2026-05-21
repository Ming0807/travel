"use client";

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

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/80 bg-white/92 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_35px_rgba(15,23,42,0.10)] backdrop-blur-xl lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 text-center">
        {items.map((item) => {
          const Icon = item.Icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 ${
                isActive ? "text-coral" : "text-muted hover:text-ink"
              }`}
            >
              <Icon size={24} weight={isActive ? "fill" : "regular"} />
              <p className="mt-1 text-[11px] font-bold">{item.label}</p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
