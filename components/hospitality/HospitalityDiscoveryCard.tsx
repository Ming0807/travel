import Link from "next/link";
import { ArrowRight, MapPin } from "@phosphor-icons/react/dist/ssr";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { PublicMissingImage } from "@/components/public/directory/PublicMissingImage";
import type {
  PublicAccommodationCard,
  PublicRestaurantCard,
} from "@/lib/repositories/public-content.repository";
import { accommodationTypeLabel, restaurantFoodTypeLabel } from "@/lib/hospitality/labels";

type HospitalityCardProps = {
  href: string;
  name: string;
  province: string;
  category: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  detail?: string | null;
  detailLabel?: string;
  actionLabel: string;
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
  detail,
  detailLabel,
  actionLabel,
  priority = false,
}: HospitalityCardProps) {
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden border border-black/10 bg-white transition-colors hover:border-[var(--public-teal)]">
      <Link href={href} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]">
        {imageUrl ? (
          <PublicMediaFrame
            src={imageUrl}
            alt={imageAlt}
            aspect="landscape"
            sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(50vw - 3rem), 360px"
            priority={priority}
            fallbackLabel={`ยังไม่มีภาพของ${name}`}
          />
        ) : (
          <PublicMissingImage label={name} />
        )}
      </Link>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold">
            <span className="inline-flex items-center gap-1 text-[var(--public-teal)]">
              <MapPin size={16} weight="fill" aria-hidden="true" />
              {province}
            </span>
            <span className="text-black/65">{category}</span>
          </div>

          <h2 className="mt-3 text-xl font-bold leading-8 text-[var(--public-ink)]">
            <Link href={href} className="hover:text-[var(--public-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]">
              {name}
            </Link>
          </h2>
          {description ? (
            <p className="mt-2 line-clamp-2 text-base leading-7 text-black/65">
              {description}
            </p>
          ) : null}
          {detail ? (
            <p className="mt-4 border-t border-black/10 pt-4 text-sm font-semibold text-[var(--public-ink)]">
              {detailLabel ? <span className="text-black/55">{detailLabel}: </span> : null}
              {detail}
            </p>
          ) : null}

          <Link
            href={href}
            className="mt-auto inline-flex min-h-11 items-center justify-between gap-2 pt-5 text-sm font-bold text-[var(--public-coral-strong)] hover:text-[var(--public-teal)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
          >
            {actionLabel} <ArrowRight aria-hidden="true" size={17} weight="bold" />
          </Link>
        </div>
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
      category={restaurantFoodTypeLabel(restaurant.foodType)}
      description={restaurant.description}
      imageUrl={restaurant.imageUrl}
      imageAlt={restaurant.imageAlt}
      actionLabel="ดูข้อมูลร้านอาหาร"
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
      category={accommodationTypeLabel(accommodation.accommodationType)}
      description={accommodation.description}
      imageUrl={accommodation.thumbnailUrl || accommodation.imageUrl}
      imageAlt={accommodation.imageAlt}
      detail={accommodation.priceRange || "ยังไม่ระบุช่วงราคา"}
      detailLabel="ช่วงราคา"
      actionLabel="ดูข้อมูลที่พัก"
      priority={priority}
    />
  );
}
