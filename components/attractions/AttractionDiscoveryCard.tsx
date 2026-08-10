import Link from "next/link";
import { MapPin, Star } from "@phosphor-icons/react/dist/ssr";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import type { PublicAttractionCard } from "@/lib/repositories/public-content.repository";

function reviewSummary(attraction: PublicAttractionCard) {
  if (attraction.reviewState === "unavailable") {
    return "คะแนนรีวิวยังไม่พร้อมใช้งาน";
  }

  if (
    attraction.reviewState === "available"
    && attraction.rating !== null
    && attraction.reviewCount !== null
  ) {
    return `${attraction.rating.toFixed(1)} จาก ${attraction.reviewCount.toLocaleString("th-TH")} รีวิว`;
  }

  return "ยังไม่มีคะแนนรีวิว";
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
    <article className="h-full">
      <Link
        href={href}
        className="group flex h-full flex-col rounded-[var(--public-radius-panel)] border border-black/10 bg-white p-2 transition-colors hover:border-[var(--public-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
      >
        <PublicMediaFrame
          src={attraction.imageUrl}
          alt={attraction.imageAlt}
          aspect="landscape"
          sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(50vw - 2.5rem), 384px"
          priority={priority}
          fallbackLabel="ยังไม่มีรูปภาพของสถานที่นี้"
        />

        <div className="flex flex-1 flex-col px-2 pb-3 pt-4 sm:px-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold">
            <span className="inline-flex items-center gap-1 text-[var(--public-teal)]">
              <MapPin size={16} weight="fill" aria-hidden="true" />
              {attraction.province}
            </span>
            {attraction.district ? (
              <span className="text-black/65">{attraction.district}</span>
            ) : null}
            <span className="text-black/65">{attraction.category}</span>
          </div>

          <h2 className="mt-3 text-xl font-bold leading-8 text-[var(--public-ink)] group-hover:text-[var(--public-teal)]">
            {attraction.name}
          </h2>
          {attraction.description ? (
            <p className="mt-2 line-clamp-2 text-base leading-7 text-black/65">
              {attraction.description}
            </p>
          ) : null}

          <p className="mt-auto flex items-center gap-1.5 pt-4 text-sm font-semibold text-black/70">
            {attraction.reviewState === "available" ? (
              <Star size={16} weight="fill" className="text-[var(--public-gold)]" aria-hidden="true" />
            ) : null}
            {reviewSummary(attraction)}
          </p>
        </div>
      </Link>
    </article>
  );
}
