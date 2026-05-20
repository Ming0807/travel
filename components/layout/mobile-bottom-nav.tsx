"use client";

import Link from "next/link";
import {
  House,
  MagnifyingGlass,
  AddressBook,
  MapTrifold,
  UserCircle
} from "@phosphor-icons/react";

const items = [
  { href: "/", label: "Home", Icon: House, active: true },
  { href: "#attractions", label: "Explore", Icon: MagnifyingGlass, active: false },
  { href: "#passport", label: "Passport", Icon: AddressBook, active: false },
  { href: "#map", label: "Map", Icon: MapTrifold, active: false },
  { href: "#profile", label: "Profile", Icon: UserCircle, active: false }
];

export function MobileBottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/80 bg-white/92 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_35px_rgba(15,23,42,0.10)] backdrop-blur-xl lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 text-center">
        {items.map((item) => {
          const Icon = item.Icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 ${
                item.active ? "text-teal" : "text-muted"
              }`}
            >
              <Icon size={24} weight={item.active ? "fill" : "regular"} />
              <p className="mt-1 text-[11px] font-bold">{item.label}</p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
