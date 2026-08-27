"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Certificate,
  MapPin,
  MapTrifold,
  Medal,
  Path,
  Star,
} from "@phosphor-icons/react";
import type { PublicRouteCard } from "@/lib/repositories/public-content.repository";
import type { AttractionCard } from "@/types/tourism";

type HomepageDiscoveryWorkspaceProps = {
  attractions?: AttractionCard[];
  routes?: PublicRouteCard[];
  routesUnavailable?: boolean;
};

const PLANNING_LINKS = [
  { href: "/attractions", label: "สำรวจสถานที่ทั้งหมด", icon: MapPin },
  { href: "/routes", label: "ดูเส้นทางแนะนำ", icon: Path },
  { href: "/passport", label: "เปิด Digital Passport", icon: Certificate },
  { href: "/leaderboard", label: "ดูกระดานผู้นำ", icon: Medal },
] as const;

function hasCoordinates(attraction: AttractionCard) {
  return Number.isFinite(attraction.latitude) && Number.isFinite(attraction.longitude);
}

export function HomepageDiscoveryWorkspace({
  attractions = [],
  routes = [],
  routesUnavailable = false,
}: HomepageDiscoveryWorkspaceProps) {
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const categories = useMemo(
    () => Array.from(new Set(attractions.map((attraction) => attraction.category).filter(Boolean))),
    [attractions],
  );
  const displayAttractions = useMemo(
    () => attractions
      .filter((attraction) => activeCategory === "ทั้งหมด" || attraction.category === activeCategory)
      .slice(0, 6),
    [activeCategory, attractions],
  );
  const mappedAttraction = attractions.find(hasCoordinates);
  const mapEmbedUrl = mappedAttraction
    ? `https://www.google.com/maps?q=${mappedAttraction.latitude},${mappedAttraction.longitude}&z=12&output=embed`
    : null;
  const mapExternalUrl = mappedAttraction
    ? `https://www.google.com/maps/search/?api=1&query=${mappedAttraction.latitude},${mappedAttraction.longitude}`
    : "/attractions";

  return (
    <section id="attractions" aria-labelledby="homepage-discovery-heading" className="border-t border-ink/10 bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-coral">
            <span className="h-px w-6 bg-coral/40"></span>
            <span>❖ สถานที่น่าสนใจ ❖</span>
            <span className="h-px w-6 bg-coral/40"></span>
          </div>
          <h2 id="homepage-discovery-heading" className="mt-2 text-2xl font-black text-ink sm:text-3xl lg:text-4xl">
            วางแผนเที่ยวในยะลา
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-bold text-muted">
            สำรวจจากข้อมูลจริง
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)_270px] lg:items-start">
          {/* Left Utility Rail: Planning Links */}
          <aside className="order-2 overflow-hidden rounded-[8px] border border-ink/10 bg-cream lg:order-1" aria-label="เครื่องมือวางแผนการเดินทาง">
            <div className="border-b border-ink/10 bg-white p-4">
              <p className="text-sm font-black text-ink">วางแผนการเดินทาง</p>
            </div>
            <nav className="divide-y divide-ink/10" aria-label="ลิงก์วางแผนท่องเที่ยว">
              {PLANNING_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="flex min-h-11 items-center gap-3 px-4 py-3 text-sm font-bold text-ink transition-colors hover:bg-white hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coral">
                    <Icon aria-hidden="true" size={18} className="text-teal" />
                    <span className="flex-1">{item.label}</span>
                    <ArrowRight aria-hidden="true" size={14} />
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-teal/20 bg-teal p-5 text-white">
              <p className="text-lg font-black">Digital Passport</p>
              <p className="mt-2 text-xs leading-relaxed text-white/80">เช็กอิน สะสมตราประทับ และบันทึกความทรงจำจากการเดินทาง</p>
              <Link href="/passport" className="mt-4 inline-flex min-h-10 w-full items-center justify-between rounded-[6px] border border-white/40 px-3 text-sm font-bold transition-colors hover:bg-white hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                ดูข้อมูลเพิ่มเติม <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </aside>

          {/* Main Discovery Feed */}
          <div className="order-1 min-w-0 lg:order-2">
            {/* Category Filters */}
            <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2" aria-label="กรองตามประเภทสถานที่">
              {["ทั้งหมด", ...categories].map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                  className={`min-h-10 shrink-0 rounded-full border px-4 text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral ${
                    activeCategory === category
                      ? "border-coral bg-coral text-white shadow-xs"
                      : "border-ink/10 bg-cream text-ink hover:border-coral/40 hover:bg-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {displayAttractions.length > 0 ? (
              <div className="mt-5 grid grid-cols-2 gap-3.5 sm:gap-4 xl:grid-cols-3">
                {displayAttractions.map((attraction) => {
                  const hasRating = typeof attraction.rating === "number" && (attraction.reviewCount ?? 0) > 0;
                  return (
                    <Link
                      key={attraction.slug}
                      href={`/attractions/${attraction.slug}`}
                      className="group min-w-0 overflow-hidden rounded-[8px] border border-ink/10 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-coral/40 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                    >
                      <div className="relative aspect-[4/3] bg-cream overflow-hidden">
                        {attraction.imageUrl ? (
                          <Image
                            src={attraction.imageUrl}
                            alt={attraction.imageAlt}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 220px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-3 text-center text-xs font-bold text-muted">
                            ยังไม่มีภาพจาก CMS
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                      <div className="p-3.5 sm:p-4">
                        <h3 className="line-clamp-2 text-sm font-black leading-snug text-ink transition-colors group-hover:text-coral sm:text-base">
                          {attraction.name}
                        </h3>
                        <div className="mt-2.5 flex min-w-0 items-center justify-between gap-2 text-[11px] font-bold text-muted sm:text-xs">
                          <span className="flex items-center gap-1 truncate text-muted">
                            <MapPin aria-hidden="true" size={13} weight="fill" className="text-coral shrink-0" />
                            <span className="truncate">{attraction.province || "ยะลา"}</span>
                          </span>
                          {hasRating ? (
                            <span className="inline-flex shrink-0 items-center gap-1 font-bold text-ink">
                              <Star aria-hidden="true" weight="fill" className="text-gold" /> {attraction.rating!.toFixed(1)} ({attraction.reviewCount})
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-[8px] border border-dashed border-ink/20 bg-cream p-8 text-center">
                <p className="text-sm font-bold text-muted">ยังไม่มีสถานที่ในประเภทนี้</p>
                <button
                  type="button"
                  onClick={() => setActiveCategory("ทั้งหมด")}
                  className="mt-3 min-h-10 px-4 text-sm font-black text-coral underline underline-offset-4"
                >
                  แสดงทุกประเภท
                </button>
              </div>
            )}

            {/* Bottom Button */}
            <div className="mt-8 text-center">
              <Link
                href="/attractions"
                className="inline-flex min-h-11 items-center gap-2 rounded-[6px] bg-coral px-6 text-sm font-black text-white shadow-xs transition-all hover:bg-[#C95C3F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
              >
                ดูสถานที่ทั้งหมด <ArrowRight aria-hidden="true" weight="bold" />
              </Link>
            </div>
          </div>

          {/* Right Rail: Map & Suggested Routes */}
          <aside className="order-3 space-y-4" aria-label="แผนที่และเส้นทางแนะนำ">
            <section className="overflow-hidden rounded-[8px] border border-ink/10 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
                <h2 className="text-sm font-black text-ink">แผนที่แนะนำ</h2>
                <MapTrifold aria-hidden="true" className="text-teal" />
              </div>
              {mapEmbedUrl && mappedAttraction ? (
                <>
                  <iframe
                    title={`แผนที่${mappedAttraction.name}`}
                    src={mapEmbedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-40 w-full border-0"
                  />
                  <a
                    href={mapExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 items-center justify-between border-t border-ink/10 px-4 text-xs font-black text-teal hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coral"
                  >
                    เปิดแผนที่ {mappedAttraction.name} <ArrowRight aria-hidden="true" />
                  </a>
                </>
              ) : (
                <div className="p-4">
                  <p className="text-xs leading-relaxed text-muted">แผนที่จะแสดงเมื่อสถานที่มีพิกัดที่ผ่านการตรวจสอบใน CMS</p>
                  <Link href="/attractions" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-black text-teal hover:text-coral">
                    เปิดรายชื่อสถานที่ <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-[8px] border border-ink/10 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
                <h2 className="text-sm font-black text-ink">เส้นทางแนะนำ</h2>
                <Link href="/routes" className="text-xs font-black text-teal hover:text-coral">
                  ดูทั้งหมด
                </Link>
              </div>
              {routes.length > 0 ? (
                <div className="divide-y divide-ink/10">
                  {routes.slice(0, 3).map((route) => (
                    <Link
                      key={route.slug}
                      href={`/routes/${route.slug}`}
                      className="flex min-h-16 items-center gap-3 px-4 py-3 transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coral"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-black text-ink">{route.name}</p>
                        <p className="mt-1 text-xs font-bold text-teal">{route.days} วัน</p>
                      </div>
                      <ArrowRight aria-hidden="true" className="shrink-0 text-muted" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-xs leading-relaxed text-muted">
                  {routesUnavailable
                    ? "ยังโหลดเส้นทางแนะนำไม่ได้ในขณะนี้ เปิดหน้ารวมเพื่อลองอีกครั้ง"
                    : "เส้นทางที่เผยแพร่แล้วจะแสดงที่นี่"}
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
