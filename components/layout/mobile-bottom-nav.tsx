import Link from "next/link";
import { Compass, Gauge, Map, QrCode, Stamp } from "lucide-react";

const items = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/attractions", label: "Places", icon: Map },
  { href: "/checkin/demo-code", label: "QR", icon: QrCode },
  { href: "/passport", label: "Passport", icon: Stamp },
  { href: "/dashboard", label: "Data", icon: Gauge }
];

export function MobileBottomNav() {
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-[1.5rem] border border-white bg-white/92 p-2 shadow-card backdrop-blur-xl md:hidden"
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold text-slate-600 transition hover:bg-[#EEF6F2] hover:text-[#073F37]"
            href={item.href}
            key={item.href}
          >
            <Icon aria-hidden="true" size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
