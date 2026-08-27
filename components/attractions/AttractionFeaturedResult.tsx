"use client";

import { ArrowRight, MapPin, QrCode, Star } from "@phosphor-icons/react";
import Link from "next/link";

import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { TripShortlistButton } from "@/components/trip-shortlist/TripShortlistButton";
import type { PublicAttractionCard } from "@/lib/repositories/public-content.repository";
import { attractionReviewSummary } from "./AttractionDiscoveryCard";

export function AttractionFeaturedResult({ attraction }: { attraction: PublicAttractionCard }) {
  const href = `/attractions/${attraction.slug}`;

  return (
    <article className="grid overflow-hidden rounded-2xl border border-orange-100/90 bg-white shadow-md transition-all duration-300 hover:shadow-xl lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
      <Link
        href={href}
        className="block min-w-0 overflow-hidden bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
      >
        <PublicMediaFrame
          src={attraction.imageUrl}
          alt={attraction.imageAlt}
          aspect="wide"
          sizes="(max-width: 1023px) calc(100vw - 2rem), 720px"
          priority
          fallbackLabel={`ยังไม่มีภาพของ${attraction.name}`}
        />
      </Link>

      <div className="flex min-w-0 flex-col justify-center p-6 sm:p-7 lg:p-8">
        <div className="inline-flex items-center gap-2">
          <span className="rounded-full bg-coral/10 px-3 py-0.5 text-xs font-black text-coral">
            สถานที่แนะนำ
          </span>
          <span className="text-xs font-bold text-muted">
            {attraction.category}
          </span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-muted">
          <MapPin aria-hidden="true" size={15} weight="fill" className="text-coral" />
          <span>{attraction.district || attraction.province || "ยะลา"}</span>
        </div>

        <h2 className="mt-2 text-2xl font-black leading-tight text-ink transition-colors hover:text-coral sm:text-3xl">
          <Link href={href} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral">
            {attraction.name}
          </Link>
        </h2>

        {attraction.description ? (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
            {attraction.description}
          </p>
        ) : null}

        <p className="mt-4 flex items-center gap-1.5 text-xs font-bold text-muted">
          {attraction.reviewState === "available" && attraction.rating !== null ? (
            <Star aria-hidden="true" size={15} weight="fill" className="text-amber-400" />
          ) : null}
          <span>{attractionReviewSummary(attraction)}</span>
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={href}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 text-xs font-black text-white shadow-xs transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          >
            <span>ดูรายละเอียด</span>
            <ArrowRight aria-hidden="true" size={15} weight="bold" />
          </Link>

          <Link
            href={`/c/${attraction.slug}`}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50/50 px-4 text-xs font-bold text-coral transition-colors hover:bg-orange-100/70"
          >
            <QrCode size={16} weight="bold" />
            <span>เช็กอิน</span>
          </Link>

          <TripShortlistButton slug={attraction.slug} label={attraction.name} />
        </div>
      </div>
    </article>
  );
}
