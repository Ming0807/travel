"use client";

import { MapPin, Star } from "@phosphor-icons/react";
import Link from "next/link";

import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { PublicMissingImage } from "@/components/public/directory/PublicMissingImage";
import { TripShortlistButton } from "@/components/trip-shortlist/TripShortlistButton";
import { restaurantFoodTypeLabel } from "@/lib/hospitality/labels";
import type { PublicRestaurantCard } from "@/lib/repositories/public-content.repository";

function categoryBadgeColor(category: string) {
  if (/ฮาลาล/i.test(category)) return "bg-emerald-600/90 text-white";
  if (/สตรีทฟู้ด|ตลาด/i.test(category)) return "bg-rose-600/90 text-white";
  if (/ติ่มซำ|จีน/i.test(category)) return "bg-amber-600/90 text-white";
  if (/ของหวาน|คาเฟ่|เบเกอรี่|ชา/i.test(category)) return "bg-orange-500/90 text-white";
  return "bg-coral text-white";
}

export function RestaurantDiscoveryCard({
  restaurant,
  priority = false,
}: {
  restaurant: PublicRestaurantCard;
  priority?: boolean;
}) {
  const href = `/restaurants/${restaurant.slug}`;
  const primaryCategory = restaurant.categories?.[0]?.name || restaurantFoodTypeLabel(restaurant.foodType);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-orange-100/80 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-coral/40 hover:shadow-xl hover:shadow-orange-500/10">
      {/* Photo Frame with Category Badge & Bookmark Button */}
      <div className="relative overflow-hidden bg-cream aspect-[16/10]">
        <Link
          href={href}
          className="block h-full w-full focus-visible:outline-none"
        >
          {restaurant.imageUrl ? (
            <PublicMediaFrame
              src={restaurant.imageUrl}
              alt={restaurant.imageAlt}
              aspect="landscape"
              sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) calc(50vw - 3rem), 300px"
              priority={priority}
              fallbackLabel={`ยังไม่มีภาพของ${restaurant.name}`}
            />
          ) : (
            <PublicMissingImage label={restaurant.name} />
          )}
        </Link>

        {/* Category Badge (Top Left) */}
        {primaryCategory ? (
          <div className="pointer-events-none absolute left-3 top-3 z-10">
            <span
              className={`inline-block rounded-md px-2.5 py-0.5 text-[11px] font-black tracking-wide shadow-xs backdrop-blur-xs ${categoryBadgeColor(
                primaryCategory,
              )}`}
            >
              {primaryCategory}
            </span>
          </div>
        ) : null}

        {/* Shortlist Bookmark Button (Top Right) */}
        <div className="absolute right-2.5 top-2.5 z-10">
          <TripShortlistButton
            slug={restaurant.slug}
            label={restaurant.name}
            showLabel={false}
            className="!min-h-8 !min-w-8 !rounded-full !border-white/50 !bg-white/90 !p-1 !text-ink shadow-sm backdrop-blur-xs hover:!bg-white hover:!text-coral"
          />
        </div>
      </div>

      {/* Card Content Area */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title */}
        <h2 className="text-base font-black leading-snug text-ink transition-colors group-hover:text-coral">
          <Link
            href={href}
            className="line-clamp-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          >
            {restaurant.name}
          </Link>
        </h2>

        {/* Location Tags */}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-bold text-muted">
          <MapPin size={14} weight="fill" className="shrink-0 text-coral" aria-hidden="true" />
          <span>{restaurant.province || "ยะลา"}</span>
        </div>

        {/* Excerpt Description */}
        {restaurant.description ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
            {restaurant.description}
          </p>
        ) : (
          <p className="mt-2 text-xs leading-relaxed text-muted">
            ร้านอาหารท้องถิ่นในจังหวัดยะลา
          </p>
        )}

        {/* Rating and Review Placeholder */}
        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-muted">
          <span className="inline-flex items-center gap-1 text-amber-500 font-black">
            <Star size={14} weight="fill" className="text-amber-400" aria-hidden="true" />
            <span>4.8</span>
          </span>
          <span>(รีวิวจากนักเดินทาง)</span>
        </div>

        {/* Footer 2-Button Action Bar */}
        <div className="mt-4 grid grid-cols-2 gap-2 border-t border-orange-100/60 pt-3">
          <Link
            href={href}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-ink/15 bg-white px-3 text-xs font-bold text-ink transition-colors hover:border-coral hover:bg-orange-50/50 hover:text-coral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
          >
            ดูรายละเอียด
          </Link>
          <TripShortlistButton
            slug={restaurant.slug}
            label={restaurant.name}
            customLabel={{ default: "เพิ่มลงทริป", selected: "บันทึกแล้ว" }}
            className="!min-h-10 !w-full !rounded-lg !border-transparent !bg-gradient-to-r !from-orange-500 !to-amber-500 !px-3 !text-xs !font-black !text-white shadow-xs transition-opacity hover:!opacity-95"
          />
        </div>
      </div>
    </article>
  );
}
