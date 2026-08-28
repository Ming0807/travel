import Image from "next/image";
import Link from "next/link";
import { CaretRight, ClockCounterClockwise, MapPin, ShieldCheck, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";

export interface AttractionHeroProps {
  title?: string;
  description?: string;
  image?: string;
  scope?: string;
}

export function AttractionHero({
  title = "สถานที่ท่องเที่ยวในจังหวัดยะลา",
  description = "ค้นพบสถานที่ท่องเที่ยวที่น่าประทับใจในจังหวัดยะลา วัฒนธรรม ธรรมชาติ และวิถีชีวิตที่มีเอกลักษณ์",
  image,
  scope,
}: AttractionHeroProps) {
  const heroImageUrl = siteMediaImageUrl(image);

  const featureBadges = [
    { icon: Sparkle, label: "สถานที่เผยแพร่", sublabel: "โดยทีมงาน" },
    { icon: ClockCounterClockwise, label: "ข้อมูลสำหรับ", sublabel: "เตรียมเดินทาง" },
    { icon: MapPin, label: "เช็กอินหน้างาน", sublabel: "สะสมตราและคะแนน" },
    { icon: ShieldCheck, label: "ตรวจรายละเอียด", sublabel: "ก่อนออกเดินทาง" },
  ];

  return (
    <section aria-labelledby="attractions-hero-heading" className="relative isolate overflow-hidden bg-gradient-to-r from-[#2A170F] via-[#3D1E10] to-[#542B15] text-white">
      {/* Photographic Background Layer */}
      <div className="absolute inset-0 z-0 opacity-45 mix-blend-luminosity">
        {heroImageUrl ? (
          <Image
            src={heroImageUrl}
            alt="ทิวทัศน์สถานที่ท่องเที่ยวจังหวัดยะลา"
            fill
            loading="eager"
            fetchPriority="high"
            className="object-cover object-[center_35%]"
            sizes="100vw"
          />
        ) : null}
      </div>

      {/* Warm Ambient Gradient Overlays */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#1F120A] via-transparent to-black/30" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#2A170F]/95 via-[#2A170F]/70 to-transparent" />

      {/* Decorative Thai Geometric Motif Accent */}
      <div className="pointer-events-none absolute -right-16 -top-16 z-0 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
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
              <Link href="/" className="transition-colors hover:text-amber-300 focus-visible:outline-none focus-visible:underline">
                หน้าแรก
              </Link>
            </li>
            <li aria-hidden="true" className="text-white/40">
              <CaretRight size={13} weight="bold" />
            </li>
            <li aria-current="page" className="text-amber-300 font-bold">
              สถานที่ท่องเที่ยว
            </li>
          </ol>
        </nav>

        <div className="max-w-3xl">
          <h1 id="attractions-hero-heading" className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title.includes("ในจังหวัดยะลา") ? (
              <>
                <span className="block">{title.replace("ในจังหวัดยะลา", "").trim() || "สถานที่ท่องเที่ยว"}</span>
                <span className="mt-1 block text-amber-300">ในจังหวัดยะลา</span>
              </>
            ) : (
              <span>{title}</span>
            )}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base lg:text-lg">
            {description}
          </p>

          {scope ? <p className="mt-3 text-xs font-bold text-amber-200">{scope}</p> : null}

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
                    <span className="font-bold">{badge.label}</span> <span className="text-white/80">{badge.sublabel}</span>
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
