"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Compass,
  MapPin,
  MapTrifold,
  Star,
} from "@phosphor-icons/react";
import type { PublicRouteCard } from "@/lib/repositories/public-content.repository";
import type { AttractionCard } from "@/types/tourism";

type HomepageDiscoveryWorkspaceProps = {
  attractions?: AttractionCard[];
  routes?: PublicRouteCard[];
  routesUnavailable?: boolean;
};

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
      .slice(0, 8),
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
        <div className="mb-8 text-center sm:mb-10">
          <div className="inline-flex items-center gap-3 text-sm font-black text-coral">
            <span className="h-0.5 w-8 bg-coral" aria-hidden="true" />
            <span>สถานที่น่าสนใจ</span>
            <span className="h-0.5 w-8 bg-coral" aria-hidden="true" />
          </div>
          <h2 id="homepage-discovery-heading" className="mt-3 text-2xl font-black text-ink sm:text-3xl lg:text-4xl">
            วางแผนเที่ยวในยะลา
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-medium text-muted">
            สำรวจจากข้อมูลจริง
          </p>
        </div>

        {/* Category Filters */}
        <div className="hide-scrollbar flex justify-center gap-2 overflow-x-auto pb-2" aria-label="กรองตามประเภทสถานที่">
          {["ทั้งหมด", ...categories].map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              className={`min-h-9 shrink-0 rounded-full border px-4 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral ${
                activeCategory === category
                  ? "border-coral bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs"
                  : "border-ink/10 bg-white text-ink hover:border-coral/40 hover:bg-cream"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Five cards remain visible on desktop; additional CMS selections stay reachable by horizontal scroll. */}
        {displayAttractions.length > 0 ? (
          <div className="relative mt-8">
            <div className="hide-scrollbar grid snap-x snap-mandatory auto-cols-[78%] grid-flow-col gap-3.5 overflow-x-auto pb-3 sm:auto-cols-[44%] sm:gap-4 md:auto-cols-[31%] lg:auto-cols-[calc((100%_-_4rem)/5)]">
              {displayAttractions.map((attraction) => {
                const hasRating = typeof attraction.rating === "number" && (attraction.reviewCount ?? 0) > 0;
                return (
                  <Link
                    key={attraction.slug}
                    href={`/attractions/${attraction.slug}`}
                    className="group relative flex aspect-[3/4] snap-start flex-col justify-end overflow-hidden rounded-xl bg-ink shadow-sm transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                  >
                    {/* Background Image */}
                    {attraction.imageUrl ? (
                      <Image
                        src={attraction.imageUrl}
                        alt={attraction.imageAlt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-b from-amber-900/30 to-ink p-3 text-center text-xs font-bold text-white/80">
                        ยังไม่มีภาพจาก CMS
                      </div>
                    )}

                    {/* Gradient Overlay for Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent" />

                    {/* Overlay Text Details */}
                    <div className="relative z-10 p-3.5 sm:p-4 text-white">
                      <h3 className="line-clamp-1 text-sm font-black text-white group-hover:text-amber-300 transition-colors sm:text-base">
                        {attraction.name}
                      </h3>
                      <div className="mt-1 flex items-center justify-between gap-1 text-[11px] font-bold text-white/80">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin aria-hidden="true" size={12} weight="fill" className="shrink-0 text-coral" />
                          <span className="truncate">{attraction.province || "ยะลา"}</span>
                        </span>
                        {hasRating ? (
                          <span className="inline-flex shrink-0 items-center gap-0.5 font-bold text-amber-300">
                            <Star aria-hidden="true" weight="fill" size={11} className="text-amber-400" /> {attraction.rating!.toFixed(1)} ({attraction.reviewCount})
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-ink/20 bg-cream p-8 text-center">
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

        {/* View All Attractions CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/attractions"
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-coral px-8 text-sm font-black text-white transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
          >
            ดูสถานที่ทั้งหมด <ArrowRight aria-hidden="true" weight="bold" />
          </Link>
        </div>

        {/* Full-Width Supporting Section: Map & Suggested Routes */}
        <div className="mt-16 border-t border-ink/10 pt-12 sm:mt-20 sm:pt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 text-sm font-black text-coral">
                <span className="h-0.5 w-8 bg-coral" aria-hidden="true" />
                <span>สำรวจเชิงพื้นที่และเส้นทาง</span>
              </div>
              <h2 className="mt-3 text-2xl font-black text-ink sm:text-3xl">แผนที่และเส้นทางท่องเที่ยวแนะนำ</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">ค้นพบหมุดหมายสำคัญ และเส้นทางท่องเที่ยวเชิงวัฒนธรรมที่เชื่อมต่อถึงกัน</p>
            </div>
            <Link
              href="/routes"
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start text-sm font-black text-coral hover:underline sm:self-auto"
            >
              ดูเส้นทางทั้งหมด <ArrowRight aria-hidden="true" weight="bold" />
            </Link>
          </div>

          <div className="mt-8 grid overflow-hidden rounded-xl bg-ink shadow-[0_18px_50px_rgba(24,24,27,0.14)] lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
            {/* Map Preview Card */}
            <section className="relative min-h-[320px] min-w-0 overflow-hidden bg-[#F4EEE7] sm:min-h-[380px] lg:min-h-[430px]">
              {mapEmbedUrl && mappedAttraction ? (
                <>
                  <iframe
                    title={`แผนที่${mappedAttraction.name}`}
                    src={mapEmbedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 h-full w-full border-0"
                  />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/30 to-transparent" aria-hidden="true" />
                  <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-black text-ink shadow-lg backdrop-blur-sm sm:left-5 sm:top-5 sm:text-sm">
                    <MapPin aria-hidden="true" size={17} className="shrink-0 text-coral" weight="fill" />
                    <span className="truncate">{mappedAttraction.name}</span>
                  </div>
                  <a
                    href={mapExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-x-4 bottom-4 flex min-h-12 items-center justify-between rounded-lg bg-white px-4 text-sm font-black text-ink shadow-xl transition-colors hover:bg-coral hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:min-w-72"
                  >
                    <span>เปิดแผนที่และนำทาง</span>
                    <ArrowRight aria-hidden="true" weight="bold" />
                  </a>
                </>
              ) : (
                <div className="flex min-h-[320px] flex-col items-center justify-center bg-[linear-gradient(135deg,#FFF7ED_0%,#F4EEE7_100%)] p-8 text-center sm:min-h-[380px] lg:min-h-[430px]">
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-white text-coral shadow-sm">
                    <MapTrifold aria-hidden="true" size={24} weight="fill" />
                  </div>
                  <p className="mt-3 text-xs font-bold text-ink sm:text-sm">แผนที่และพิกัดนำทาง</p>
                  <p className="mt-1 max-w-xs text-[11px] text-muted">เลือกดูสถานที่ท่องเที่ยวเพื่อเปิดแผนที่และเส้นทางนำทางจริงในพื้นที่</p>
                  <Link href="/attractions" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-coral px-4 text-xs font-black text-white transition-colors hover:bg-orange-600">
                    เปิดรายชื่อสถานที่ <ArrowRight aria-hidden="true" weight="bold" />
                  </Link>
                </div>
              )}
            </section>

            {/* Suggested Routes Card */}
            <section className="flex min-w-0 flex-col overflow-hidden bg-ink text-white">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
                <div className="flex items-center gap-2">
                  <Compass aria-hidden="true" size={18} className="text-coral" weight="fill" />
                  <h3 className="text-sm font-black text-white">ทริปแนะนำประจำฤดูกาล</h3>
                </div>
                <Link href="/routes" className="text-xs font-bold text-orange-300 hover:text-white">
                  ดูทั้งหมด
                </Link>
              </div>

              {routes.length > 0 ? (
                <div className="divide-y divide-white/10 px-3 py-2">
                  {routes.slice(0, 4).map((route, index) => (
                    <Link
                      key={route.slug}
                      href={`/routes/${route.slug}`}
                      className="group flex min-h-20 items-center gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-coral"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-orange-100 text-xs font-black text-coral transition-colors group-hover:bg-coral group-hover:text-white">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-black text-white transition-colors group-hover:text-orange-300">{route.name}</p>
                        <p className="mt-0.5 text-xs font-bold text-orange-300">{route.days} วัน · {route.stopCount} จุดแวะ</p>
                      </div>
                      <ArrowRight aria-hidden="true" className="shrink-0 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-orange-300" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center px-7 py-12 text-center lg:py-8">
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/10 text-orange-300">
                    <Compass aria-hidden="true" size={24} weight="fill" />
                  </div>
                  <p className="mt-4 text-sm font-black text-white">
                    {routesUnavailable
                      ? "ยังโหลดเส้นทางแนะนำไม่ได้ในขณะนี้"
                      : "เส้นทางที่เผยแพร่แล้วจะแสดงที่นี่"}
                  </p>
                  <p className="mt-2 max-w-xs text-xs leading-5 text-white/60">เลือกเส้นทางตามเวลาและจุดแวะ เพื่อวางแผนทริปได้ง่ายขึ้น</p>
                  <Link href="/routes" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-coral px-4 text-xs font-black text-white transition-colors hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2 focus-visible:ring-offset-ink">
                    เปิดหน้ารวมเส้นทาง <ArrowRight aria-hidden="true" weight="bold" />
                  </Link>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
