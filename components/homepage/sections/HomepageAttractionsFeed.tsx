import Image from "next/image";
import Link from "next/link";
import { homepageAttractions } from "../homepage-data";
import type { AttractionCard } from "@/types/tourism";

export function HomepageAttractionsFeed({ attractions = homepageAttractions }: { attractions?: AttractionCard[] }) {
  const topDestinations = (attractions.length > 0 ? attractions : homepageAttractions).slice(0, 4);

  return (
    <section id="attractions" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-ink">จุดหมายปลายทางยอดนิยม</h2>
          <div className="mt-4 flex gap-4 text-sm font-medium text-muted">
            <span className="text-ink font-semibold border-b-2 border-coral pb-1">ฮิตที่สุด</span>
            <span className="hover:text-ink cursor-pointer">ยะลา</span>
            <span className="hover:text-ink cursor-pointer">ปัตตานี</span>
            <span className="hover:text-ink cursor-pointer">นราธิวาส</span>
          </div>
        </div>
        <Link
          href="/attractions"
          className="inline-flex rounded-full border border-ink/20 px-6 py-2.5 text-sm font-semibold text-ink hover:bg-ink hover:text-white transition-colors"
        >
          สำรวจทุกสถานที่
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topDestinations.map((attraction) => (
          <Link href={`/attractions/${attraction.slug}`} key={attraction.slug} className="group flex flex-col">
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-3xl mb-4 shadow-sm">
              <Image
                src={attraction.imageUrl}
                alt={attraction.imageAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
            </div>
            <h3 className="text-lg font-bold text-ink leading-tight">{attraction.name}</h3>
            <p className="text-sm text-muted mt-1">{attraction.province}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
