import Link from "next/link";
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
  { href: "/admin", label: "ภาพรวม", icon: SquaresFour },
  { href: "/admin/dashboard", label: "Analytics", icon: ChartLineUp },
  { href: "/admin/attractions", label: "แหล่งท่องเที่ยว", icon: MapPin },
  { href: "/admin/photo-spots", label: "จุดถ่ายภาพ", icon: ImageIcon },
  { href: "/admin/checkin-codes", label: "QR Check-in", icon: QrCode },
  { href: "/admin/visits", label: "Visit Records", icon: ClipboardText },
  { href: "/admin/surveys", label: "Surveys", icon: ChatCircleText },
  { href: "/admin/settings", label: "Settings", icon: Gear },
];

export function AdminSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#073F37] text-white lg:block">
      <div className="sticky top-0 min-h-screen px-5 py-6">
        <Link className="block rounded-2xl bg-white/8 p-4" href="/admin">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#D6A13D]">Tourism Admin</p>
          <p className="mt-2 text-lg font-black leading-tight">Southern Border Data Platform</p>
        </Link>
        <nav aria-label="Admin navigation" className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-white/78 transition hover:bg-white/10 hover:text-white"
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden="true" size={18} weight="fill" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
