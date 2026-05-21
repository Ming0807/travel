import Image from "next/image";
import Link from "next/link";
import { Heart } from "@phosphor-icons/react/dist/ssr";
import { homepageAttractions } from "../homepage-data";

export function HomepageAttractionsFeed() {
  return (
    <section id="attractions" className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-6 lg:py-8">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-sm font-bold text-coral">Explore Feed</p>
          <h2 className="text-2xl font-extrabold lg:text-3xl">แรงบันดาลใจการท่องเที่ยว</h2>
        </div>
        <Link
          className="hidden rounded-full bg-white px-4 py-2 text-sm font-bold text-teal shadow-sm hover:bg-teal hover:text-white sm:block"
          href="/attractions"
        >
          ดูทั้งหมด
        </Link>
      </div>

      <div className="masonry-feed">
        {homepageAttractions.map((attraction) => (
          <article
            key={attraction.slug}
            className="masonry-card overflow-hidden rounded-[1.5rem] bg-white shadow-card"
          >
            <div className="relative">
              <Image
                src={attraction.imageUrl}
                alt={attraction.imageAlt}
                width={700}
                height={500}
                className="h-auto w-full"
                unoptimized
              />
              {attraction.category === "Virtual tour" && (
                <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-teal shadow">
                  360°
                </span>
              )}
              <button className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-ink backdrop-blur">
                <Heart size={16} />
              </button>
            </div>
            <div className="p-4">
              <h3 className="text-sm font-extrabold">{attraction.name}</h3>
              <p
                className={`body-text text-xs ${
                  attraction.province === "ยะลา"
                    ? "text-leaf"
                    : attraction.province === "ปัตตานี"
                      ? "text-coral"
                      : "text-blue-600"
                }`}
              >
                {attraction.province}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
