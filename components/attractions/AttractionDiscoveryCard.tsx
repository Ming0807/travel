"use client";

import { MapPin, QrCode, Star } from "@phosphor-icons/react";
import Link from "next/link";

import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { PublicMissingImage } from "@/components/public/directory/PublicMissingImage";
import { TripShortlistButton } from "@/components/trip-shortlist/TripShortlistButton";
import type { PublicAttractionCard } from "@/lib/repositories/public-content.repository";
import "./attraction-experience.css";

export function attractionReviewSummary(attraction: PublicAttractionCard) {
  if (attraction.reviewState === "unavailable") return "คะแนนรีวิวยังไม่พร้อมใช้งาน";
  if (attraction.reviewState === "available" && attraction.rating !== null && attraction.reviewCount !== null) {
    return `${attraction.rating.toFixed(1)} จาก ${attraction.reviewCount.toLocaleString("th-TH")} รีวิว`;
  }
  return "ยังไม่มีคะแนนรีวิว";
}

function categoryBadgeColor(category: string) {
  if (/ธรรมชาติ/i.test(category)) return "bg-emerald-700 text-white";
  if (/อาหาร|ของฝาก|คาเฟ่/i.test(category)) return "bg-rose-600/90 text-white";
  if (/พิพิธภัณฑ์|ประวัติศาสตร์/i.test(category)) return "bg-amber-700 text-white";
  if (/วัฒนธรรม|ประเพณี|ชุมชน/i.test(category)) return "bg-orange-700 text-white";
  return "bg-[#b94727] text-white";
}

export function AttractionDiscoveryCard({
  attraction,
  priority = false,
}: {
  attraction: PublicAttractionCard;
  priority?: boolean;
}) {
  const href = `/attractions/${attraction.slug}`;

  return (
    <article className="attraction-discovery-card group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-orange-100/80 bg-white">
      {/* Photo Frame with Category Badge & Bookmark Button */}
      <div className="relative overflow-hidden bg-cream aspect-[16/10]">
        <Link
          href={href}
          className="attraction-discovery-card__media block h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-coral"
        >
          {attraction.imageUrl ? (
            <PublicMediaFrame
              src={attraction.imageUrl}
              alt={attraction.imageAlt}
              aspect="landscape"
              sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 2.125rem), (max-width: 1279px) calc(50vw - 12.625rem), 275px"
              priority={priority}
              fallbackLabel={`ยังไม่มีภาพของ${attraction.name}`}
            />
          ) : (
            <PublicMissingImage label={attraction.name} />
          )}
        </Link>

        {/* Category Badge (Top Left) */}
        {attraction.category ? (
          <div className="pointer-events-none absolute left-3 top-3 z-10">
            <span
              className={`inline-block rounded-md px-2.5 py-0.5 text-[11px] font-black tracking-wide ${categoryBadgeColor(
                attraction.category,
              )}`}
            >
              {attraction.category}
            </span>
          </div>
        ) : null}

        {/* Shortlist Bookmark Button (Top Right) */}
        <div className="absolute right-2.5 top-2.5 z-10">
          <TripShortlistButton
            slug={attraction.slug}
            label={attraction.name}
            showLabel={false}
            className="attraction-control !min-h-11 !min-w-11 !rounded-full !border-white/40 !bg-white !p-1.5 !text-ink hover:!text-coral"
          />
        </div>
      </div>

      {/* Card Content Area */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h2 className="text-base font-black leading-snug text-ink transition-colors group-hover:text-coral">
          <Link
            href={href}
            className="line-clamp-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          >
            {attraction.name}
          </Link>
        </h2>

        {/* Location Tags */}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-bold text-muted">
          <MapPin size={14} weight="fill" className="shrink-0 text-coral" aria-hidden="true" />
          <span>{attraction.province || "ยะลา"}</span>
          {attraction.district ? (
            <>
              <span className="text-black/30">·</span>
              <span>{attraction.district}</span>
            </>
          ) : null}
        </div>

        {/* Excerpt Description */}
        {attraction.description ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
            {attraction.description}
          </p>
        ) : null}

        {/* Rating and Review Summary */}
        <div className="mb-4 mt-3 flex flex-wrap items-center gap-1.5 text-xs font-bold text-muted">
          {attraction.reviewState === "available" && attraction.rating !== null ? (
            <span className="inline-flex items-center gap-1 text-amber-500 font-black">
              <Star size={14} weight="fill" className="text-amber-400" aria-hidden="true" />
              <span>{attraction.rating.toFixed(1)}</span>
            </span>
          ) : null}
          <span>{attractionReviewSummary(attraction)}</span>
        </div>

        {/* Footer 2-Button Action Bar */}
        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-orange-100/60 pt-3">
          <Link
            href={href}
            className="attraction-control inline-flex min-h-11 items-center justify-center rounded-lg border border-ink/15 bg-white px-3 text-xs font-bold text-ink hover:border-coral hover:bg-orange-50/50 hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          >
            ดูรายละเอียด
          </Link>
          <PublicCheckinEntryLink
            className="attraction-control inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-[#b94727] px-3 text-xs font-black text-white hover:bg-[#96391f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          >
            <QrCode size={15} weight="bold" aria-hidden="true" />
            <span>เริ่มเช็กอิน</span>
          </PublicCheckinEntryLink>
        </div>
      </div>
    </article>
  );
}
