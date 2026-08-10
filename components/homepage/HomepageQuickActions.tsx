import Link from "next/link";
import {
  Bed,
  BookOpenText,
  ForkKnife,
  MapPin,
  MapTrifold,
} from "@phosphor-icons/react/dist/ssr";

const ACTIONS = [
  { href: "/attractions", label: "สถานที่", icon: MapPin, tone: "text-teal" },
  { href: "/restaurants", label: "ร้านอาหาร", icon: ForkKnife, tone: "text-coral" },
  { href: "/accommodations", label: "ที่พัก", icon: Bed, tone: "text-teal" },
  { href: "/routes", label: "เส้นทาง", icon: MapTrifold, tone: "text-coral" },
  { href: "/stories", label: "เรื่องราว", icon: BookOpenText, tone: "text-teal" },
] as const;

export function HomepageQuickActions() {
  return (
    <nav aria-label="ทางลัดสำรวจยะลา" className="border-b border-ink/10 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-5 overflow-x-auto px-3 sm:px-6 lg:px-8">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group flex min-h-20 min-w-[76px] flex-col items-center justify-center gap-2 border-r border-ink/10 px-2 text-center text-xs font-bold text-ink transition-colors first:border-l hover:bg-cream focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coral sm:min-h-16 sm:flex-row sm:gap-3 sm:text-sm"
            >
              <Icon aria-hidden="true" size={24} weight="duotone" className={action.tone} />
              <span>{action.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
