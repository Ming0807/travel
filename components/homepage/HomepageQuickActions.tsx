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
    description: "สแกน QR Code ณ สถานที่ เพื่อบันทึกการเยี่ยมชม",
    icon: QrCode,
  },
  {
    type: "link",
    href: "/passport",
    label: "สะสมตราประทับ",
    badgeText: "Digital Passport",
    description: "สะสมตราประทับดิจิทัล จากทุกสถานที่ที่คุณไป",
    icon: Stamp,
  },
  {
    type: "checkin",
    label: "รับใบประกาศนียบัตร",
    badgeText: "ใบประกาศดิจิทัล",
    description: "รับใบประกาศนียบัตร เมื่อทำครบตามเงื่อนไข",
    icon: Certificate,
  },
  {
    type: "checkin",
    label: "ประเมินความพึงพอใจ",
    badgeText: "แบบสำรวจเพื่อการพัฒนา",
    description: "ร่วมแสดงความคิดเห็น ช่วยพัฒนาการท่องเที่ยว",
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
    <section aria-label="คุณค่าหลักและการสำรวจยะลา" className="relative -mt-6 z-20 bg-transparent px-4 pb-8 pt-0 sm:-mt-10 sm:px-6 lg:-mt-14 lg:px-8 lg:pb-12">
      <div className="mx-auto max-w-7xl">
        {/* Four-Value Action Band */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {FOUR_VALUES.map((item) => {
            const Icon = item.icon;
            if (item.type === "checkin") {
              return (
                <PublicCheckinEntryLink
                  key={item.label}
                  className="group flex flex-col items-center rounded-2xl border border-ink/5 bg-white p-6 text-center shadow-lg shadow-orange-500/5 transition-all duration-300 hover:-translate-y-1 hover:border-coral/40 hover:shadow-xl hover:shadow-orange-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral sm:p-7"
                >
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-b from-amber-400 via-orange-500 to-coral text-white shadow-md shadow-orange-500/30 transition-transform duration-300 group-hover:scale-110 sm:h-16 sm:w-16">
                    <Icon aria-hidden="true" size={28} weight="fill" />
                  </div>
                  <h3 className="mt-4 text-base font-black text-ink transition-colors group-hover:text-coral sm:text-lg">
                    {item.label}
                  </h3>
                  {"badgeText" in item ? (
                    <span className="mt-1 text-[11px] font-bold text-coral">{item.badgeText}</span>
                  ) : null}
                  <p className="mt-2 line-clamp-2 text-xs font-medium leading-relaxed text-muted">
                    {item.description}
                  </p>
                </PublicCheckinEntryLink>
              );
            }
            if (item.type === "link") return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex flex-col items-center rounded-2xl border border-ink/5 bg-white p-6 text-center shadow-lg shadow-orange-500/5 transition-all duration-300 hover:-translate-y-1 hover:border-coral/40 hover:shadow-xl hover:shadow-orange-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral sm:p-7"
              >
                <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-b from-amber-400 via-orange-500 to-coral text-white shadow-md shadow-orange-500/30 transition-transform duration-300 group-hover:scale-110 sm:h-16 sm:w-16">
                  <Icon aria-hidden="true" size={28} weight="fill" />
                </div>
                <h3 className="mt-4 text-base font-black text-ink transition-colors group-hover:text-coral sm:text-lg">
                  {item.label}
                </h3>
                {item.badgeText ? (
                  <span className="mt-1 text-[11px] font-bold text-coral">{item.badgeText}</span>
                ) : null}
                <p className="mt-2 line-clamp-2 text-xs font-medium leading-relaxed text-muted">
                  {item.description}
                </p>
              </Link>
            );

            return null;
          })}
        </div>

        {/* Compact Five-Destination Discovery Navigation */}
        <div className="mt-6 rounded-xl border border-ink/10 bg-cream/70 p-3 sm:p-4 backdrop-blur-xs">
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
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3.5 py-1.5 text-xs font-bold text-ink shadow-2xs transition-all hover:border-coral hover:bg-coral/5 hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
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
