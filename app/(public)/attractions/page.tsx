import Link from "next/link";
import Image from "next/image";
import { MapPin, Search } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { homepageAttractions } from "@/components/homepage/homepage-data";
import { TARGET_PROVINCES } from "@/constants/product";

export default function AttractionsPage() {
  return (
    <PageShell
      description="A Phase 01 placeholder for the future published attraction list. Later phases will load active public attractions from Supabase with search, filters, images, and safe public fields only."
      eyebrow="Public tourism portal"
      title="Attractions"
    >
      <div className="rounded-[1.5rem] bg-white p-4 shadow-card">
        <div className="flex items-center gap-3 rounded-2xl bg-[#EEF6F2] px-4 py-3">
          <Search aria-hidden="true" className="text-[#0F766E]" size={18} />
          <input
            aria-label="Search attractions"
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-500"
            placeholder="Search by attraction, province, route, or story"
            type="search"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {TARGET_PROVINCES.map((province) => (
            <button
              className="shrink-0 rounded-full bg-[#EEF6F2] px-4 py-2 text-sm font-black text-[#073F37]"
              key={province.key}
              type="button"
            >
              {province.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {homepageAttractions.slice(0, 3).map((attraction) => (
          <Link
            className="overflow-hidden rounded-[1.5rem] bg-white shadow-card transition hover:-translate-y-1 hover:shadow-soft"
            href={`/attractions/${attraction.slug}`}
            key={attraction.slug}
          >
            <Image
              alt={attraction.imageAlt}
              className="h-48 w-full object-cover"
              height={384}
              src={attraction.imageUrl}
              unoptimized
              width={640}
            />
            <div className="p-5">
              <p className="flex items-center gap-1 text-xs font-black uppercase tracking-[0.16em] text-[#D36B4B]">
                <MapPin aria-hidden="true" size={14} />
                {attraction.province}
              </p>
              <h2 className="mt-2 text-xl font-black text-[#073F37]">{attraction.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{attraction.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
