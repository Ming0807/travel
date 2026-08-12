import Link from "next/link";
import { ArrowRight, ImageSquare, MapPin } from "@phosphor-icons/react/dist/ssr";

import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { restaurantFoodTypeLabel } from "@/lib/hospitality/labels";
import type { PublicRestaurantCard } from "@/lib/repositories/public-content.repository";

export function RestaurantDirectoryItem({
  restaurant,
  priority = false,
}: {
  restaurant: PublicRestaurantCard;
  priority?: boolean;
}) {
  const href = `/restaurants/${restaurant.slug}`;
  const missingImageLabel = `ยังไม่มีภาพของ${restaurant.name}`;

  return (
    <article
      data-layout="compact-row"
      className="group grid min-w-0 grid-cols-[6.5rem_minmax(0,1fr)] border-b border-black/10 bg-white py-4 last:border-b-0 sm:grid-cols-[7.5rem_minmax(0,1fr)]"
    >
      <Link
        href={href}
        aria-label={`ดูข้อมูล${restaurant.name}จากภาพ`}
        className="block self-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
      >
        {restaurant.imageUrl ? (
          <PublicMediaFrame
            src={restaurant.imageUrl}
            alt={restaurant.imageAlt}
            aspect="square"
            sizes="(max-width: 639px) 104px, 120px"
            priority={priority}
            fallbackLabel={missingImageLabel}
          />
        ) : (
          <div
            role="img"
            aria-label={missingImageLabel}
            className="grid aspect-square place-items-center border border-black/10 bg-[#f3f6f5] text-[var(--public-teal)]"
          >
            <ImageSquare size={28} aria-hidden="true" />
            <span className="sr-only">{missingImageLabel}</span>
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-col pl-4">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="text-base font-bold leading-6 text-[var(--public-ink)]">
              <Link
                href={href}
                className="line-clamp-2 hover:text-[var(--public-coral-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
              >
                {restaurant.name}
              </Link>
            </h4>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-black/60">
              <span>{restaurantFoodTypeLabel(restaurant.foodType)}</span>
              <span aria-hidden="true">•</span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={13} weight="fill" aria-hidden="true" />
                {restaurant.province}
              </span>
            </div>
          </div>
          <Link
            href={href}
            aria-label={`ดูข้อมูล${restaurant.name}`}
            className="grid size-11 shrink-0 place-items-center text-[var(--public-ink)] transition-colors hover:bg-[var(--public-coral)] hover:text-[var(--public-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
          >
            <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </Link>
        </div>
        {restaurant.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-black/60">
            {restaurant.description}
          </p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-black/45">ดูข้อมูลร้านอาหารและรายละเอียดเพิ่มเติม</p>
        )}
      </div>
    </article>
  );
}
