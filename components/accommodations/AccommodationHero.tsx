import Image from "next/image";
import Link from "next/link";
import { CaretRight, CheckCircle, Heart, House, MapPin } from "@phosphor-icons/react/dist/ssr";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";

export interface AccommodationHeroProps {
  title?: string;
  description?: string;
  scope?: string;
  image?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
  imageContext?: string;
}

export function AccommodationHero({
  title = "ที่พักในจังหวัดยะลา",
  description = "เปรียบเทียบประเภทที่พัก ช่วงราคา และเลือกที่พักที่เหมาะกับแผนการเดินทางของคุณ",
  scope: _scope = "ขอบเขตข้อมูลปัจจุบัน: จังหวัดยะลา",
  image,
  imageUrl: directImageUrl,
  imageAlt = "บรรยากาศที่พักและการท่องเที่ยวในจังหวัดยะลา",
  imageContext: _imageContext,
}: AccommodationHeroProps) {
  const resolvedImageUrl = directImageUrl || siteMediaImageUrl(image) || "/site-media/general/hero-1.webp";

  const featureBadges = [
    { icon: CheckCircle, label: "คัดสรรโดย", sublabel: "ผู้ดูแลระบบ" },
    { icon: House, label: "บรรยากาศ", sublabel: "น่าพักผ่อน" },
    { icon: MapPin, label: "ทำเลเดินทาง", sublabel: "สะดวกสบาย" },
    { icon: Heart, label: "เหมาะกับทุกสไตล์", sublabel: "การพักผ่อน" },
  ];

  return (
    <section
      aria-labelledby="accommodations-hero-heading"
      className="relative isolate overflow-hidden bg-gradient-to-r from-[#1E1B18] via-[#2A241E] to-[#382E24] text-white"
    >
      {/* Background Photography Layer */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity">
        {resolvedImageUrl ? (
          <Image
            src={resolvedImageUrl}
            alt={imageAlt}
            fill
            priority
            className="object-cover object-[center_35%]"
            sizes="100vw"
          />
        ) : null}
      </div>

      {/* Ambient Gradient Overlays */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#141210] via-transparent to-black/35" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#1E1B18]/95 via-[#1E1B18]/75 to-transparent" />

      {/* Decorative Thai Geometric Motif Accent */}
      <div className="pointer-events-none absolute -right-16 -top-16 z-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-12 top-12 z-0 hidden text-amber-400/15 lg:block">
        <svg width="200" height="200" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z" opacity="0.4" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pb-24">
        {/* Breadcrumb Navigation */}
        <nav aria-label="เส้นทางนำทาง" className="mb-6">
          <ol className="flex items-center gap-1.5 text-xs font-semibold text-white/80 sm:text-sm">
            <li>
              <Link
                href="/"
                className="transition-colors hover:text-amber-300 focus-visible:outline-none focus-visible:underline"
              >
                หน้าแรก
              </Link>
            </li>
            <li aria-hidden="true" className="text-white/40">
              <CaretRight size={13} weight="bold" />
            </li>
            <li aria-current="page" className="text-amber-300 font-bold">
              ที่พัก
            </li>
          </ol>
        </nav>

        <div className="max-w-3xl">
          <h1
            id="accommodations-hero-heading"
            className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            {title.includes("ในจังหวัดยะลา") ? (
              <>
                <span className="block">{title.replace("ในจังหวัดยะลา", "").trim() || "ที่พัก"}</span>
                <span className="mt-1 block text-amber-300">ในจังหวัดยะลา</span>
              </>
            ) : (
              <span>{title}</span>
            )}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base lg:text-lg">
            {description}
          </p>

          {/* 4 Feature Badges Strip */}
          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3.5">
            {featureBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur-md transition-all hover:bg-white/20"
                >
                  <div className="grid size-6 place-items-center rounded-full bg-orange-500 text-white shadow-xs">
                    <Icon size={13} weight="bold" />
                  </div>
                  <div className="text-[11px] leading-tight text-white sm:text-xs">
                    <span className="font-bold">{badge.label}</span>{" "}
                    <span className="text-white/80">{badge.sublabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
