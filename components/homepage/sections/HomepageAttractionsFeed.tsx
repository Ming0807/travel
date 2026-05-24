import Image from "next/image";
import Link from "next/link";
import { homepageAttractions } from "../homepage-data";
import type { AttractionCard } from "@/types/tourism";

export function HomepageAttractionsFeed({ attractions = homepageAttractions }: { attractions?: AttractionCard[] }) {
  const topDestinations = (attractions.length > 0 ? attractions : homepageAttractions).slice(0, 4);

  return (
    <section id="attractions" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-white rounded-[3rem] my-8 shadow-sm border border-ink/5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="text-4xl font-black text-ink tracking-tight">สถานที่ยอดนิยม</h2>
          <div className="mt-6 flex gap-6 text-sm font-bold text-muted">
            <span className="text-coral border-b-2 border-coral pb-1">ทั้งหมด</span>
            <span className="hover:text-ink cursor-pointer transition-colors">ยะลา</span>
            <span className="hover:text-ink cursor-pointer transition-colors">ปัตตานี</span>
            <span className="hover:text-ink cursor-pointer transition-colors">นราธิวาส</span>
          </div>
        </div>
        <Link
          href="/attractions"
          className="inline-flex rounded-full border border-ink/10 px-6 py-3 text-sm font-bold text-ink hover:bg-cream hover:text-coral transition-colors"
        >
          สำรวจทุกสถานที่ &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {topDestinations.map((attraction) => (
          <Link href={`/attractions/${attraction.slug}`} key={attraction.slug} className="group flex flex-col">
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[2rem] mb-5 shadow-md border border-ink/5 bg-cream">
              <Image
                src={attraction.imageUrl}
                alt={attraction.imageAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full text-ink hover:text-coral transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </div>
            </div>
            <h3 className="text-xl font-black text-ink leading-tight group-hover:text-coral transition-colors">{attraction.name}</h3>
            <p className="text-xs font-bold text-muted mt-2 uppercase tracking-wider">{attraction.province}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
