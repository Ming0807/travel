import Link from "next/link";
import { Compass, Gauge, Map, ShieldCheck, Stamp } from "lucide-react";

type SiteHeaderProps = {
  appName: string;
};

const navItems = [
  { href: "/attractions", label: "Attractions", icon: Map },
  { href: "/passport", label: "Passport", icon: Stamp },
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/privacy", label: "Privacy", icon: ShieldCheck }
];

export function SiteHeader({ appName }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-[#EEF6F2]/88 backdrop-blur-xl">
      <div className="tourism-container flex h-16 items-center justify-between gap-4">
        <Link className="flex items-center gap-3" href="/" aria-label={`${appName} home`}>
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#073F37] text-[#D6A13D] shadow-card">
            <Compass aria-hidden="true" size={21} />
          </span>
          <span>
            <span className="block text-[11px] font-black uppercase tracking-[0.22em] text-[#D36B4B]">
              Southern Border
            </span>
            <span className="block text-sm font-black text-[#073F37]">Travel Passport</span>
          </span>
        </Link>

        <nav className="hidden items-center rounded-full bg-white/80 p-1 shadow-sm md:flex" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-[#EEF6F2] hover:text-[#073F37]"
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden="true" size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          className="hidden rounded-full bg-[#073F37] px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-[#0F766E] md:inline-flex"
          href="/checkin/demo-code"
        >
          Try QR landing
        </Link>
      </div>
    </header>
  );
}
