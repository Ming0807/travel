"use client";

import { ArrowRight, MapPin, Star } from "@phosphor-icons/react";
import Link from "next/link";

import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { TripShortlistButton } from "@/components/trip-shortlist/TripShortlistButton";
import type { PublicAttractionCard } from "@/lib/repositories/public-content.repository";
import { attractionReviewSummary } from "./AttractionDiscoveryCard";

export function AttractionFeaturedResult({ attraction }: { attraction: PublicAttractionCard }) {
  const href = `/attractions/${attraction.slug}`;

  return (
    <article className="grid overflow-hidden border border-black/10 bg-white lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
      <Link href={href} className="block min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]">
        <PublicMediaFrame
          src={attraction.imageUrl}
          alt={attraction.imageAlt}
          aspect="wide"
          sizes="(max-width: 1023px) calc(100vw - 2rem), 720px"
          priority
          fallbackLabel={`ยังไม่มีภาพของ${attraction.name}`}
        />
      </Link>

      <div className="flex min-w-0 flex-col justify-center p-5 sm:p-7 lg:p-8">
        <p className="text-xs font-bold uppercase text-[var(--public-coral)]">สถานที่แนะนำ</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-black/60">
          <span className="inline-flex items-center gap-1 text-[var(--public-teal)]">
            <MapPin aria-hidden="true" size={16} weight="fill" /> {attraction.district ?? attraction.province}
          </span>
          <span>{attraction.category}</span>
        </div>
        <h2 className="mt-3 text-2xl font-bold leading-tight text-[var(--public-ink)] sm:text-3xl">
          <Link href={href} className="hover:text-[var(--public-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]">
            {attraction.name}
          </Link>
        </h2>
        {attraction.description ? <p className="mt-3 line-clamp-3 text-base leading-7 text-black/65">{attraction.description}</p> : null}
        <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-black/65">
          {attraction.reviewState === "available" ? <Star aria-hidden="true" size={16} weight="fill" className="text-[var(--public-gold)]" /> : null}
          {attractionReviewSummary(attraction)}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href={href} className="inline-flex min-h-11 items-center gap-2 rounded-[var(--public-radius-control)] bg-[var(--public-coral)] px-4 text-sm font-bold text-[var(--public-ink)] hover:bg-[#d86548]">
            ดูรายละเอียด <ArrowRight aria-hidden="true" size={17} />
          </Link>
          <TripShortlistButton slug={attraction.slug} label={attraction.name} className="sm:min-w-11" />
        </div>
      </div>
    </article>
  );
}
