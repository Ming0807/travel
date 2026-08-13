import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  MapPin,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";

import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { PublicMissingImage } from "@/components/public/directory/PublicMissingImage";
import { accommodationTypeLabel } from "@/lib/hospitality/labels";
import type { PublicAccommodationCard } from "@/lib/repositories/public-content.repository";

function priceLabel(accommodation: PublicAccommodationCard) {
  return accommodation.priceRange || "ยังไม่ระบุช่วงราคา";
}

function AccommodationMeta({ accommodation }: { accommodation: PublicAccommodationCard }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-black/65">
      <span className="inline-flex items-center gap-1.5">
        <MapPin aria-hidden="true" size={16} weight="fill" className="text-[var(--public-coral-strong)]" />
        {accommodation.province}
      </span>
      <span aria-hidden="true" className="size-1 bg-black/25" />
      <span>{accommodationTypeLabel(accommodation.accommodationType)}</span>
    </div>
  );
}

export function AccommodationFeaturedResult({
  accommodation,
}: {
  accommodation: PublicAccommodationCard;
}) {
  const href = `/accommodations/${accommodation.slug}`;

  return (
    <article className="grid overflow-hidden border border-black/12 bg-white lg:grid-cols-[minmax(22rem,0.9fr)_minmax(0,1.1fr)]">
      <Link
        href={href}
        className="block min-w-0 bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
      >
        <PublicMediaFrame
          src={accommodation.imageUrl}
          alt={accommodation.imageAlt}
          aspect="featured"
          sizes="(max-width: 1023px) calc(100vw - 2rem), 520px"
          priority
          fallbackLabel={`ยังไม่มีภาพของ${accommodation.name}`}
        />
      </Link>

      <div className="flex min-w-0 flex-col p-5 sm:p-7 lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="border border-[var(--public-coral)] bg-[#fff5f1] px-2.5 py-1 text-xs font-black text-[var(--public-coral-strong)]">
            ที่พักแนะนำ
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--public-teal)]">
            <CheckCircle aria-hidden="true" size={16} weight="fill" />
            ข้อมูลโดยผู้ดูแล
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-black leading-tight text-[var(--public-ink)] sm:text-3xl">
          <Link
            href={href}
            className="hover:text-[var(--public-coral-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
          >
            {accommodation.name}
          </Link>
        </h2>
        <div className="mt-3">
          <AccommodationMeta accommodation={accommodation} />
        </div>
        {accommodation.description ? (
          <p className="mt-4 line-clamp-3 text-base leading-7 text-black/65">
            {accommodation.description}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-4 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 text-sm font-black text-[var(--public-ink)]">
            <Wallet aria-hidden="true" size={18} weight="bold" className="text-[var(--public-coral-strong)]" />
            <span className="text-black/55">ช่วงราคา</span>
            {priceLabel(accommodation)}
          </p>
          <Link
            href={href}
            className="inline-flex min-h-11 items-center justify-center gap-3 bg-[var(--public-coral)] px-5 text-sm font-black text-white transition-colors hover:bg-[var(--public-coral-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
          >
            ดูข้อมูลที่พัก <ArrowRight aria-hidden="true" size={18} weight="bold" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function AccommodationResultCard({
  accommodation,
  priority = false,
}: {
  accommodation: PublicAccommodationCard;
  priority?: boolean;
}) {
  const href = `/accommodations/${accommodation.slug}`;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden border border-black/12 bg-white transition-colors hover:border-[var(--public-coral)]">
      <Link
        href={href}
        className="block bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
      >
        {accommodation.thumbnailUrl || accommodation.imageUrl ? (
          <PublicMediaFrame
            src={accommodation.thumbnailUrl || accommodation.imageUrl}
            alt={accommodation.imageAlt}
            aspect="directory"
            sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(50vw - 3rem), 360px"
            priority={priority}
            fallbackLabel={`ยังไม่มีภาพของ${accommodation.name}`}
          />
        ) : (
          <PublicMissingImage label={accommodation.name} className="!aspect-[16/10]" />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <AccommodationMeta accommodation={accommodation} />
        <h2 className="mt-3 text-xl font-black leading-7 text-[var(--public-ink)]">
          <Link
            href={href}
            className="hover:text-[var(--public-coral-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
          >
            {accommodation.name}
          </Link>
        </h2>
        {accommodation.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-black/60">
            {accommodation.description}
          </p>
        ) : null}
        <p className="mt-4 inline-flex items-start gap-2 border-t border-black/10 pt-4 text-sm font-bold text-[var(--public-ink)]">
          <Wallet aria-hidden="true" size={17} weight="bold" className="mt-0.5 shrink-0 text-[var(--public-coral-strong)]" />
          <span><span className="text-black/50">ช่วงราคา: </span>{priceLabel(accommodation)}</span>
        </p>
        <Link
          href={href}
          aria-label={`ดูรายละเอียด ${accommodation.name}`}
          className="mt-4 inline-flex min-h-11 items-center justify-between border-t border-black/10 pt-4 text-sm font-black text-[var(--public-ink)] transition-colors hover:text-[var(--public-coral-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
        >
          ดูรายละเอียด <ArrowRight aria-hidden="true" size={18} weight="bold" className="text-[var(--public-coral-strong)]" />
        </Link>
      </div>
    </article>
  );
}
