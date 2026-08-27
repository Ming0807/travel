import Link from "next/link";
import {
  Bed,
  BookOpenText,
  ForkKnife,
  MapPin,
  MapTrifold,
} from "@phosphor-icons/react/dist/ssr";

const ACTIONS = [
  {
    href: "/attractions",
    label: "สถานที่",
    description: "จุดเช็กอินและธรรมชาติ",
    icon: MapPin,
    accent: "bg-coral text-white",
  },
  {
    href: "/restaurants",
    label: "ร้านอาหาร",
    description: "อาหารพื้นถิ่นและคาเฟ่",
    icon: ForkKnife,
    accent: "bg-teal text-white",
  },
  {
    href: "/accommodations",
    label: "ที่พัก",
    description: "พักผ่อนในยะลา",
    icon: Bed,
    accent: "bg-coral text-white",
  },
  {
    href: "/routes",
    label: "เส้นทาง",
    description: "ทริปแนะนำตามสไตล์",
    icon: MapTrifold,
    accent: "bg-teal text-white",
  },
  {
    href: "/stories",
    label: "เรื่องราว",
    description: "วิถีชีวิตและวัฒนธรรม",
    icon: BookOpenText,
    accent: "bg-coral text-white",
  },
] as const;

export function HomepageQuickActions() {
  return (
    <section aria-label="ทางลัดสำรวจยะลา" className="bg-background px-3 pb-8 pt-2 sm:px-6 lg:px-8 lg:pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex flex-col items-center rounded-[8px] border border-ink/10 bg-white p-4 text-center shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-coral/40 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral sm:p-5"
              >
                <div className={`grid h-12 w-12 place-items-center rounded-full shadow-xs transition-transform duration-200 group-hover:scale-110 sm:h-14 sm:w-14 ${action.accent}`}>
                  <Icon aria-hidden="true" size={26} weight="fill" />
                </div>
                <h3 className="mt-3 text-sm font-black text-ink transition-colors group-hover:text-coral sm:text-base">
                  {action.label}
                </h3>
                <p className="mt-1 line-clamp-1 text-[11px] font-semibold text-muted sm:text-xs">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
