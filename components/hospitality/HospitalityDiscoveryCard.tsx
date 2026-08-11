import Link from "next/link";
import { MapPin } from "@phosphor-icons/react/dist/ssr";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import type {
  PublicAccommodationCard,
  PublicRestaurantCard,
} from "@/lib/repositories/public-content.repository";

type HospitalityCardProps = {
  href: string;
  name: string;
  province: string;
  category: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  fallbackLabel: string;
  detail?: string | null;
  priority?: boolean;
};

function HospitalityCard({
  href,
  name,
  province,
  category,
  description,
  imageUrl,
  imageAlt,
  fallbackLabel,
  detail,
  priority = false,
}: HospitalityCardProps) {
  return (
    <article className="h-full">
      <Link
        href={href}
        className="group flex h-full flex-col rounded-[var(--public-radius-panel)] border border-black/10 bg-white p-2 transition-colors hover:border-[var(--public-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
      >
        <PublicMediaFrame
          src={imageUrl}
          alt={imageAlt}
          aspect="landscape"
          sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(50vw - 2.5rem), 384px"
          priority={priority}
          fallbackLabel={fallbackLabel}
        />

        <div className="flex flex-1 flex-col px-2 pb-3 pt-4 sm:px-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold">
            <span className="inline-flex items-center gap-1 text-[var(--public-teal)]">
              <MapPin size={16} weight="fill" aria-hidden="true" />
              {province}
            </span>
            <span className="text-black/65">{category}</span>
          </div>

          <h2 className="mt-3 text-xl font-bold leading-8 text-[var(--public-ink)] group-hover:text-[var(--public-teal)]">
            {name}
          </h2>
          {description ? (
            <p className="mt-2 line-clamp-2 text-base leading-7 text-black/65">
              {description}
            </p>
          ) : null}
          {detail ? (
            <p className="mt-auto pt-4 text-sm font-semibold text-[var(--public-coral-strong)]">
              {detail}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

export function RestaurantDiscoveryCard({
  restaurant,
  priority,
}: {
  restaurant: PublicRestaurantCard;
  priority?: boolean;
}) {
  return (
    <HospitalityCard
      href={`/restaurants/${restaurant.slug}`}
      name={restaurant.name}
      province={restaurant.province}
      category={restaurant.foodType}
      description={restaurant.description}
      imageUrl={restaurant.imageUrl}
      imageAlt={restaurant.imageAlt}
      fallbackLabel="ร้านนี้ยังไม่มีรูปภาพที่เผยแพร่"
      priority={priority}
    />
  );
}

export function AccommodationDiscoveryCard({
  accommodation,
  priority,
}: {
  accommodation: PublicAccommodationCard;
  priority?: boolean;
}) {
  return (
    <HospitalityCard
      href={`/accommodations/${accommodation.slug}`}
      name={accommodation.name}
      province={accommodation.province}
      category={accommodation.accommodationType}
      description={accommodation.description}
      imageUrl={accommodation.imageUrl}
      imageAlt={accommodation.imageAlt}
      fallbackLabel="ที่พักนี้ยังไม่มีรูปภาพที่เผยแพร่"
      detail={accommodation.priceRange || "ยังไม่ระบุช่วงราคา"}
      priority={priority}
    />
  );
}
