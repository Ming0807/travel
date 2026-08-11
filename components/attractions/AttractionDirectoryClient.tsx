"use client";

import { TripShortlistBar } from "@/components/trip-shortlist/TripShortlistBar";
import { TripShortlistPanel } from "@/components/trip-shortlist/TripShortlistPanel";
import { TripShortlistProvider } from "@/components/trip-shortlist/TripShortlistProvider";
import type { PublicAttractionCard } from "@/lib/repositories/public-content.repository";
import { AttractionDiscoveryCard } from "./AttractionDiscoveryCard";
import { AttractionFeaturedResult } from "./AttractionFeaturedResult";

export function AttractionDirectoryClient({ items, featuredSlug }: { items: PublicAttractionCard[]; featuredSlug: string | null }) {
  const featured = items.find((item) => item.slug === featuredSlug && Boolean(item.imageUrl?.trim())) ?? null;
  const standardItems = featured ? items.filter((item) => item.slug !== featured.slug) : items;
  const shortlistItems = items.map((item) => ({ slug: item.slug, name: item.name, href: `/attractions/${item.slug}` }));

  return (
    <TripShortlistProvider>
      {featured ? <AttractionFeaturedResult attraction={featured} /> : null}

      <div className={`${featured ? "mt-6" : ""} grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_17rem]`}>
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {standardItems.map((attraction) => (
            <AttractionDiscoveryCard key={attraction.slug} attraction={attraction} />
          ))}
        </div>
        <div className="hidden xl:sticky xl:top-24 xl:block">
          <TripShortlistPanel items={shortlistItems} />
        </div>
      </div>

      <TripShortlistBar />
    </TripShortlistProvider>
  );
}
