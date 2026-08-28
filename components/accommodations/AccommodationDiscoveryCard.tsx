"use client";

import { ArrowRight, MapPin, Wallet } from "@phosphor-icons/react";
import Link from "next/link";

import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { PublicMissingImage } from "@/components/public/directory/PublicMissingImage";
import { accommodationTypeLabel } from "@/lib/hospitality/labels";
import type { PublicAccommodationCard } from "@/lib/repositories/public-content.repository";

function accommodationBadgeColor(type: string) {
  if (/hotel|โรงแรม/i.test(type)) return "bg-teal-700/90 text-white";
  if (/resort|รีสอร์ต/i.test(type)) return "bg-emerald-700/90 text-white";
  if (/homestay|โฮมสเตย์/i.test(type)) return "bg-amber-600/90 text-white";
  if (/guesthouse|เกสต์เฮาส์/i.test(type)) return "bg-rose-600/90 text-white";
  if (/hostel|โฮสเทล/i.test(type)) return "bg-indigo-700/90 text-white";
  return "bg-coral text-white";
}

function accommodationPrice(value?: string) {
  const normalized = value?.trim();
  if (!normalized) return { label: "ช่วงราคา", value: "ยังไม่ระบุช่วงราคา" };
  if (/^[฿$€£¥]{1,4}$/.test(normalized)) return { label: "ระดับราคา", value: normalized };
  return { label: "ช่วงราคา", value: normalized };
}

export function AccommodationDiscoveryCard({
  accommodation,
  priority = false,
}: {
  accommodation: PublicAccommodationCard;
  priority?: boolean;
}) {
  const href = `/accommodations/${accommodation.slug}`;
  const typeLabel = accommodationTypeLabel(accommodation.accommodationType);
  const displayImage = accommodation.thumbnailUrl || accommodation.imageUrl;
  const price = accommodationPrice(accommodation.priceRange);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-orange-100/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-coral/40 hover:shadow-xl hover:shadow-orange-500/10">
      {/* Photo Frame with Type Badge */}
      <div className="relative overflow-hidden bg-cream aspect-[16/10]">
        <Link
          href={href}
          className="block h-full w-full focus-visible:outline-none"
        >
          {displayImage ? (
            <PublicMediaFrame
              src={displayImage}
              alt={accommodation.imageAlt}
              aspect="landscape"
              sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(50vw - 3rem), 360px"
              priority={priority}
              fallbackLabel={`ยังไม่มีภาพของ${accommodation.name}`}
            />
          ) : (
            <PublicMissingImage label={accommodation.name} className="!aspect-[16/10]" />
          )}
        </Link>

        {/* Type Badge (Top Left) */}
        {typeLabel ? (
          <div className="pointer-events-none absolute left-3 top-3 z-10">
            <span
              className={`inline-block rounded-md px-2.5 py-0.5 text-[11px] font-black tracking-wide shadow-xs backdrop-blur-xs ${accommodationBadgeColor(
                accommodation.accommodationType,
              )}`}
            >
              {typeLabel}
            </span>
          </div>
        ) : null}
      </div>

      {/* Card Content Area */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Title */}
        <h2 className="text-base font-black leading-snug text-ink transition-colors group-hover:text-coral">
          <Link
            href={href}
            className="line-clamp-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          >
            {accommodation.name}
          </Link>
        </h2>

        {/* Location Tags */}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-bold text-muted">
          <MapPin size={14} weight="fill" className="shrink-0 text-coral" aria-hidden="true" />
          <span>{accommodation.province || "ยะลา"}</span>
        </div>

        {/* Excerpt Description */}
        {accommodation.description ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
            {accommodation.description}
          </p>
        ) : (
          <p className="mt-2 text-xs leading-relaxed text-muted">
            ที่พักในจังหวัดยะลา เผยแพร่โดยผู้ดูแลระบบ
          </p>
        )}

        {/* Real Price Range (Truthful data from DB, no fake rating/reviews) */}
        <div className="mt-3.5 flex items-center gap-1.5 text-xs font-bold text-ink">
          <Wallet size={15} weight="bold" className="shrink-0 text-coral" aria-hidden="true" />
          <span className="text-muted">{price.label}:</span>
          <span className="font-black text-ink">
            {price.value}
          </span>
        </div>

        {/* Footer Action Bar */}
        <div className="mt-4 border-t border-orange-100/60 pt-3">
          <Link
            href={href}
            aria-label={`ดูรายละเอียด ${accommodation.name}`}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-ink/15 bg-white px-4 text-xs font-bold text-ink transition-colors hover:border-coral hover:bg-orange-50/50 hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          >
            <span>ดูรายละเอียด</span>
            <ArrowRight aria-hidden="true" size={15} weight="bold" className="text-coral" />
          </Link>
        </div>
      </div>
    </article>
  );
}
