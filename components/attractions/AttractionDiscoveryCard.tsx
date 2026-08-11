"use client";

import { MapPin, Star } from "@phosphor-icons/react";
import Link from "next/link";

import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { PublicMissingImage } from "@/components/public/directory/PublicMissingImage";
import { TripShortlistButton } from "@/components/trip-shortlist/TripShortlistButton";
import type { PublicAttractionCard } from "@/lib/repositories/public-content.repository";

export function attractionReviewSummary(attraction: PublicAttractionCard) {
  if (attraction.reviewState === "unavailable") return "คะแนนรีวิวยังไม่พร้อมใช้งาน";
  if (attraction.reviewState === "available" && attraction.rating !== null && attraction.reviewCount !== null) {
    return `${attraction.rating.toFixed(1)} จาก ${attraction.reviewCount.toLocaleString("th-TH")} รีวิว`;
  }
  return "ยังไม่มีคะแนนรีวิว";
}

export function AttractionDiscoveryCard({ attraction, priority = false }: { attraction: PublicAttractionCard; priority?: boolean }) {
  const href = `/attractions/${attraction.slug}`;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden border border-black/10 bg-white transition-colors hover:border-[var(--public-teal)]">
      <Link href={href} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]">
        {attraction.imageUrl ? (
          <PublicMediaFrame
            src={attraction.imageUrl}
            alt={attraction.imageAlt}
            aspect="landscape"
            sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(50vw - 3rem), 300px"
            priority={priority}
            fallbackLabel={`ยังไม่มีภาพของ${attraction.name}`}
          />
        ) : (
          <PublicMissingImage label={attraction.name} />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold">
          <span className="inline-flex items-center gap-1 text-[var(--public-teal)]">
            <MapPin size={16} weight="fill" aria-hidden="true" />
            {attraction.province}
          </span>
          {attraction.district ? <span className="text-black/60">{attraction.district}</span> : null}
          <span className="text-black/60">{attraction.category}</span>
        </div>

        <h2 className="mt-3 text-xl font-bold leading-8 text-[var(--public-ink)]">
          <Link href={href} className="hover:text-[var(--public-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]">
            {attraction.name}
          </Link>
        </h2>
        {attraction.description ? <p className="mt-2 line-clamp-2 text-base leading-7 text-black/65">{attraction.description}</p> : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-black/65">
            {attraction.reviewState === "available" ? <Star size={16} weight="fill" className="shrink-0 text-[var(--public-gold)]" aria-hidden="true" /> : null}
            <span>{attractionReviewSummary(attraction)}</span>
          </p>
          <TripShortlistButton slug={attraction.slug} label={attraction.name} />
        </div>
      </div>
    </article>
  );
}
