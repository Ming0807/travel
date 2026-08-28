"use client";

import { TripShortlistBar } from "@/components/trip-shortlist/TripShortlistBar";
import { TripShortlistProvider } from "@/components/trip-shortlist/TripShortlistProvider";
import type { PublicAttractionCard } from "@/lib/repositories/public-content.repository";
import { AttractionDiscoveryCard } from "./AttractionDiscoveryCard";
import { AttractionDiscoveryCta } from "./AttractionDiscoveryCta";
import { AttractionSidebar } from "./AttractionSidebar";

export function AttractionDirectoryClient({
  items,
  cta,
}: {
  items: PublicAttractionCard[];
  cta?: {
    title: string;
    subtitle: string;
    linkText: string;
    linkUrl: string;
    image?: string | null;
  };
}) {
  const shortlistItems = items.map((item) => ({
    slug: item.slug,
    name: item.name,
    href: `/attractions/${item.slug}`,
    imageUrl: item.imageUrl,
    district: item.district,
  }));

  return (
    <TripShortlistProvider>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Attraction Cards Grid */}
        <div className="min-w-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {items.map((attraction, index) => (
              <AttractionDiscoveryCard key={attraction.slug} attraction={attraction} priority={index < 2} />
            ))}
          </div>
        </div>

        {/* Sticky Right Sidebar */}
        <div className="hidden lg:sticky lg:top-24 lg:block">
          <AttractionSidebar shortlistItems={shortlistItems} />
        </div>
      </div>

      {cta ? <AttractionDiscoveryCta {...cta} /> : null}

      <TripShortlistBar />
    </TripShortlistProvider>
  );
}
