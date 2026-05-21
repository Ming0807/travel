"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  ChartLineUp,
  MapPin,
  Image as ImageIcon,
  QrCode,
  ClipboardText,
  ChatCircleText,
  Gear,
} from "@phosphor-icons/react/dist/ssr";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: SquaresFour },
  { href: "/admin/attractions", label: "Destinations", icon: MapPin },
  { href: "/admin/stories", label: "Articles", icon: ClipboardText },
  { href: "/admin/photo-spots", label: "Media", icon: ImageIcon },
  { href: "/admin/surveys", label: "Reviews", icon: ChatCircleText },
  { href: "/admin/visits", label: "Bookings", icon: ChartLineUp },
  { href: "/admin/messages", label: "Messages", icon: ChatCircleText, badge: 4 },
  { href: "/admin/analytics", label: "Analytics", icon: ChartLineUp },
  { href: "/admin/settings", label: "Settings", icon: Gear },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200/60 bg-[#FCFAF8] lg:block">
      <div className="sticky top-0 min-h-screen px-4 py-6">
        <Link className="flex items-center gap-2 mb-8 px-2" href="/admin">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600">
            <MapPin size={20} weight="fill" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-800 uppercase">Globe Trekker</span>
        </Link>
        <nav aria-label="Admin navigation" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            
            return (
              <Link
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#FFEBE5] text-[#F3704C]"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }`}
                href={item.href}
                key={item.href}
              >
                <div className="flex items-center gap-3">
                  <Icon aria-hidden="true" size={20} weight={isActive ? "fill" : "regular"} />
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
        </nav>
      </div>
    </aside>
  );
}
