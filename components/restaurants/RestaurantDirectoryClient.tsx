"use client";

import { TripShortlistBar } from "@/components/trip-shortlist/TripShortlistBar";
import { TripShortlistProvider } from "@/components/trip-shortlist/TripShortlistProvider";
import type { PublicRestaurantCard } from "@/lib/repositories/public-content.repository";
import { RestaurantDiscoveryCard } from "./RestaurantDiscoveryCard";
import { RestaurantSidebar } from "./RestaurantSidebar";

export function RestaurantDirectoryClient({
  items,
}: {
  items: PublicRestaurantCard[];
}) {
  const shortlistItems = items.map((item) => ({
    slug: item.slug,
    name: item.name,
    href: `/restaurants/${item.slug}`,
    imageUrl: item.imageUrl,
    province: item.province,
  }));

  return (
    <TripShortlistProvider>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Restaurant Cards Grid */}
        <div className="min-w-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {items.map((restaurant, idx) => (
              <RestaurantDiscoveryCard
                key={restaurant.slug}
                restaurant={restaurant}
                priority={idx < 3}
              />
            ))}
          </div>
        </div>

        {/* Sticky Right Sidebar */}
        <div className="hidden lg:sticky lg:top-24 lg:block">
          <RestaurantSidebar shortlistItems={shortlistItems} />
        </div>
      </div>

      <TripShortlistBar />
    </TripShortlistProvider>
  );
}
