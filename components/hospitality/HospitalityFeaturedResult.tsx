import { ArrowRight, MapPin } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";

export interface HospitalityFeaturedResultProps {
  href: string;
  label: string;
  name: string;
  province: string;
  category: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  actionLabel: string;
  detail?: string | null;
  detailLabel?: string;
}

export function HospitalityFeaturedResult({
  href,
  label,
  name,
  province,
  category,
  description,
  imageUrl,
  imageAlt,
  actionLabel,
  detail,
  detailLabel,
}: HospitalityFeaturedResultProps) {
  return (
    <article className="grid overflow-hidden border border-black/10 bg-white lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.85fr)]">
      <Link href={href} className="block min-w-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]">
        <PublicMediaFrame
          src={imageUrl}
          alt={imageAlt}
          aspect="wide"
          sizes="(max-width: 1023px) calc(100vw - 2rem), 700px"
          priority
          fallbackLabel={`ยังไม่มีภาพของ${name}`}
        />
      </Link>

      <div className="flex min-w-0 flex-col justify-center p-5 sm:p-7 lg:p-8">
        <p className="text-xs font-bold text-[var(--public-coral-strong)]">{label}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold">
          <span className="inline-flex items-center gap-1 text-[var(--public-teal)]">
            <MapPin aria-hidden="true" size={16} weight="fill" /> {province}
          </span>
          <span className="text-black/60">{category}</span>
        </div>
        <h2 className="mt-3 text-2xl font-bold leading-tight text-[var(--public-ink)] sm:text-3xl">
          <Link href={href} className="hover:text-[var(--public-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]">
            {name}
          </Link>
        </h2>
        {description ? <p className="mt-3 line-clamp-3 text-base leading-7 text-black/65">{description}</p> : null}
        {detail ? (
          <p className="mt-4 text-sm font-semibold text-[var(--public-ink)]">
            {detailLabel ? <span className="text-black/55">{detailLabel}: </span> : null}
            {detail}
          </p>
        ) : null}
        <Link
          href={href}
          className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-[var(--public-radius-control)] bg-[var(--public-coral)] px-4 text-sm font-bold text-[var(--public-ink)] hover:bg-[#d86548] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
        >
          {actionLabel} <ArrowRight aria-hidden="true" size={17} weight="bold" />
        </Link>
      </div>
    </article>
  );
}
