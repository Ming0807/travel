"use client";

import type { PublicAccommodationCard } from "@/lib/repositories/public-content.repository";
import { AccommodationDiscoveryCard } from "./AccommodationDiscoveryCard";
import { AccommodationSidebar } from "./AccommodationSidebar";

export function AccommodationDirectoryClient({
  items,
}: {
  items: PublicAccommodationCard[];
}) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
      {/* Accommodation Cards Grid */}
      <div className="min-w-0">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((accommodation, idx) => (
            <AccommodationDiscoveryCard
              key={accommodation.slug}
              accommodation={accommodation}
              priority={idx === 0}
            />
          ))}
        </div>
      </div>

      {/* Sticky Right Sidebar */}
      <div className="hidden lg:sticky lg:top-24 lg:block">
        <AccommodationSidebar />
      </div>
    </div>
  );
}
