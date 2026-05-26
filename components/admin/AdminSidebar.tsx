"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, CaretDown } from "@phosphor-icons/react/dist/ssr";
import { navGroups } from "./admin-nav-items";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200/60 bg-[#FCFAF8] lg:flex lg:flex-col">
      <div className="flex flex-col h-screen px-4 py-6">
        <Link className="flex items-center gap-2 mb-8 px-2 shrink-0" href="/admin">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600">
            <MapPin size={20} weight="fill" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-800 uppercase">Globe Trekker</span>
        </Link>
        <nav aria-label="Admin navigation" className="flex-1 space-y-6 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: "thin" }}>
          {navGroups.map((group) => (
            <NavGroup key={group.group} group={group} pathname={pathname} />
          ))}
        </nav>
      </div>
    </aside>
  );
}
function NavGroup({ group, pathname }: { group: any; pathname: string }) {
  const hasActiveItem = group.items.some((i: any) => pathname === i.href || pathname.startsWith(i.href + "/"));

  // Need useState and useEffect for this
  const [isOpen, setIsOpen] = require("react").useState(hasActiveItem);
  require("react").useEffect(() => {
    if (hasActiveItem) setIsOpen(true);
  }, [hasActiveItem]);

  return (
    <details className="group" open={isOpen} onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}>
      <summary className="flex cursor-pointer items-center justify-between px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 select-none hover:text-slate-600 transition-colors">
        {group.group}
        <CaretDown size={12} weight="bold" className="transition-transform group-open:-rotate-180" />
      </summary>
      <div className="space-y-1 pb-4">
        {group.items.map((item: any) => {
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
      </div>
    </details>
  );
}
