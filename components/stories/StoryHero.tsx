import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  CaretRight,
  CheckCircle,
  MapPin,
  PenNib,
  Users,
} from "@phosphor-icons/react/dist/ssr";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";

export interface StoryHeroProps {
  title?: string;
  description?: string;
  image?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
}

export function StoryHero({
  title = "เรื่องราวจากยะลา",
  description = "อ่านพื้นที่ผ่านผู้คน อาหาร วัฒนธรรม และประสบการณ์จากนักเดินทางในยะลา",
  image,
  imageUrl: directImageUrl,
  imageAlt = "เรื่องราวและบรรยากาศการท่องเที่ยวในจังหวัดยะลา",
}: StoryHeroProps) {
  const resolvedImageUrl =
    directImageUrl ||
    siteMediaImageUrl(image);

  const featureBadges = [
    { icon: BookOpen, label: "เนื้อหาที่เผยแพร่", sublabel: "อ่านได้จากระบบ" },
    { icon: CheckCircle, label: "ผ่านการตรวจ", sublabel: "ก่อนเผยแพร่" },
    { icon: Users, label: "แหล่งเรื่องราว", sublabel: "ทีมงานและนักเดินทาง" },
    { icon: MapPin, label: "ขอบเขตนำร่อง", sublabel: "จังหวัดยะลา" },
  ];

  return (
    <section
      aria-labelledby="stories-hero-heading"
      className="relative isolate overflow-hidden bg-gradient-to-r from-[#1A1815] via-[#26211C] to-[#342A20] text-white"
    >
      {/* Background Photography Layer */}
      <div
        className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity"
        style={{ position: "absolute" }}
      >
        {resolvedImageUrl ? (
          <Image
            src={resolvedImageUrl}
            alt={imageAlt}
            fill
            priority
            className="object-cover object-[center_30%]"
            sizes="100vw"
          />
        ) : null}
      </div>

      {/* Ambient Gradient Overlays */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#141210] via-transparent to-black/40" />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#1A1815]/95 via-[#1A1815]/80 to-transparent" />

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
            <li aria-current="page" className="font-bold text-amber-300">
              เรื่องราว
            </li>
          </ol>
        </nav>

        <div className="max-w-3xl">
          <h1
            id="stories-hero-heading"
            className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl leading-tight"
          >
            {title}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base lg:text-lg">
            {description}
          </p>

          {/* Action Buttons: Share & My Stories */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/stories/share"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 text-xs font-black text-white shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02] hover:shadow-orange-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:text-sm"
            >
              <PenNib size={17} weight="bold" aria-hidden="true" />
              <span>แบ่งปันเรื่องราวของคุณ</span>
            </Link>

            <Link
              href="/profile"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-4 text-xs font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-sm"
            >
              เรื่องราวของฉัน
            </Link>
          </div>

          {/* 4 Feature Badges Strip */}
          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:gap-3.5">
            {featureBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.label}
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
