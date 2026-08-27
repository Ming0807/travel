import Link from "next/link";
import {
  Bed,
  BookOpenText,
  Certificate,
  ChatTeardropText,
  Compass,
  ForkKnife,
  MapPin,
  MapTrifold,
  QrCode,
  Stamp,
} from "@phosphor-icons/react/dist/ssr";
import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";

const FOUR_VALUES = [
  {
    type: "checkin",
    label: "สแกน QR เช็กอิน",
    description: "บันทึกการเดินทาง ณ จุดเช็กอินจริงในยะลา",
    icon: QrCode,
  },
  {
    type: "link",
    href: "/passport",
    label: "Digital Passport",
    description: "สะสมตราประทับดิจิทัลประจำสถานที่",
    icon: Stamp,
  },
  {
    type: "link",
    href: "/passport",
    label: "ใบประกาศดิจิทัล",
    description: "รับเกียรติบัตรการเดินทางเฉพาะคุณ",
    icon: Certificate,
  },
  {
    type: "link",
    href: "/dashboard",
    label: "แบบสำรวจเพื่อการพัฒนา",
    description: "ร่วมให้ข้อมูลเพื่อพัฒนาการท่องเที่ยวอย่างยั่งยืน",
    icon: ChatTeardropText,
  },
] as const;

const DISCOVERY_DESTINATIONS = [
  {
    href: "/attractions",
    label: "สถานที่",
    hint: "จุดเช็กอินและธรรมชาติ",
    icon: MapPin,
  },
  {
    href: "/restaurants",
    label: "ร้านอาหาร",
    hint: "อาหารพื้นถิ่นและคาเฟ่",
    icon: ForkKnife,
  },
  {
    href: "/accommodations",
    label: "ที่พัก",
    hint: "พักผ่อนในยะลา",
    icon: Bed,
  },
  {
    href: "/routes",
    label: "เส้นทาง",
    hint: "ทริปแนะนำตามสไตล์",
    icon: MapTrifold,
  },
  {
    href: "/stories",
    label: "เรื่องราว",
    hint: "วิถีชีวิตและวัฒนธรรม",
    icon: BookOpenText,
  },
] as const;

export function HomepageQuickActions() {
  return (
    <section aria-label="คุณค่าหลักและการสำรวจยะลา" className="bg-background px-4 pb-8 pt-2 sm:px-6 lg:px-8 lg:pb-10">
      <div className="mx-auto max-w-7xl">
        {/* Four-Value Action Band */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:grid-cols-4">
          {FOUR_VALUES.map((item) => {
            const Icon = item.icon;
            if (item.type === "checkin") {
              return (
                <PublicCheckinEntryLink
                  key={item.label}
                  className="group flex flex-col items-center rounded-[8px] border border-ink/10 bg-white p-4 text-center shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-coral/40 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral sm:p-5"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-coral text-white shadow-xs transition-transform duration-200 group-hover:scale-110 sm:h-14 sm:w-14">
                    <Icon aria-hidden="true" size={26} weight="fill" />
                  </div>
                  <h3 className="mt-3 text-sm font-black text-ink transition-colors group-hover:text-coral sm:text-base">
                    {item.label}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-muted sm:text-xs">
                    {item.description}
                  </p>
                </PublicCheckinEntryLink>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex flex-col items-center rounded-[8px] border border-ink/10 bg-white p-4 text-center shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-coral/40 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral sm:p-5"
              >
                <div className="grid h-12 w-12 place-items-center rounded-full bg-coral text-white shadow-xs transition-transform duration-200 group-hover:scale-110 sm:h-14 sm:w-14">
                  <Icon aria-hidden="true" size={26} weight="fill" />
                </div>
                <h3 className="mt-3 text-sm font-black text-ink transition-colors group-hover:text-coral sm:text-base">
                  {item.label}
                </h3>
                <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-muted sm:text-xs">
                  {item.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Compact Five-Destination Discovery Navigation */}
        <div className="mt-6 rounded-[8px] border border-ink/10 bg-cream p-3 sm:p-4">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 px-1 text-xs font-black uppercase tracking-wider text-ink">
              <Compass size={16} weight="fill" className="text-coral" />
              <span>สำรวจตามหมวดหมู่</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {DISCOVERY_DESTINATIONS.map((dest) => {
                const Icon = dest.icon;
                return (
                  <Link
                    key={dest.href}
                    href={dest.href}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-[6px] border border-ink/10 bg-white px-3 py-1.5 text-xs font-bold text-ink shadow-2xs transition-colors hover:border-coral hover:bg-coral/5 hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                  >
                    <Icon aria-hidden="true" size={15} weight="bold" className="text-coral" />
                    <span>{dest.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
