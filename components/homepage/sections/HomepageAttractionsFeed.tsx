"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { AttractionCard } from "@/types/tourism";

const PROVINCE_FILTERS = [
  { value: "all", label: "ทั้งหมด", href: "/attractions", aliases: [] },
  { value: "Yala", label: "ยะลา", href: "/attractions?province=Yala", aliases: ["Yala", "\u0e22\u0e30\u0e25\u0e32"] },
  { value: "Pattani", label: "ปัตตานี", href: "/attractions?province=Pattani", aliases: ["Pattani", "\u0e1b\u0e31\u0e15\u0e15\u0e32\u0e19\u0e35"] },
  { value: "Narathiwat", label: "นราธิวาส", href: "/attractions?province=Narathiwat", aliases: ["Narathiwat", "\u0e19\u0e23\u0e32\u0e18\u0e34\u0e27\u0e32\u0e2a"] },
];

function matchesProvince(attraction: AttractionCard, province: string) {
  if (province === "all") return true;
  const filter = PROVINCE_FILTERS.find((item) => item.value === province);
  const provinceName = attraction.province.toLowerCase();
  return (filter?.aliases ?? [province]).some((alias) => provinceName === alias.toLowerCase());
}

export function HomepageAttractionsFeed({ attractions = [] }: { attractions?: AttractionCard[] }) {
  const [activeProvince, setActiveProvince] = useState("all");
  const activeFilter = PROVINCE_FILTERS.find((item) => item.value === activeProvince) ?? PROVINCE_FILTERS[0]!;
  const filteredAttractions = useMemo(
    () => attractions.filter((attraction) => matchesProvince(attraction, activeProvince)),
    [activeProvince, attractions]
  );
  const topDestinations = filteredAttractions.slice(0, 4);

  return (
    <section id="attractions" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-white rounded-2xl my-8 border border-ink/5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
        <div>
          <h2 className="text-4xl font-black text-ink tracking-tight">สถานที่ยอดนิยม</h2>
          <div className="mt-6 flex gap-6 text-sm font-bold text-muted">
            {PROVINCE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveProvince(filter.value)}
                className={`border-b-2 pb-1 transition-colors ${
                  activeProvince === filter.value
                    ? "border-coral text-coral"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <Link
          href={activeFilter.href}
          className="inline-flex rounded-full border border-ink/10 px-6 py-3 text-sm font-bold text-ink hover:bg-cream hover:text-coral transition-colors"
        >
          สำรวจทุกสถานที่ &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {topDestinations.length > 0 ? topDestinations.map((attraction, index) => (
          <Link href={`/attractions/${attraction.slug}`} key={attraction.slug} className="group flex flex-col">
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl mb-5 shadow-md border border-ink/5 bg-cream">
              {attraction.imageUrl ? (
                <Image
                  src={attraction.imageUrl}
                  alt={attraction.imageAlt}
                  fill
                  priority={index < 2}
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-semibold text-muted">
                  Image not added
                </div>
              )}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full text-ink hover:text-coral transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </div>
            </div>
            <h3 className="text-xl font-black text-ink leading-tight group-hover:text-coral transition-colors">{attraction.name}</h3>
            <p className="text-xs font-bold text-muted mt-2 uppercase tracking-wider">{attraction.province}</p>
          </Link>
        )) : (
          <div className="rounded-2xl border border-dashed border-ink/10 bg-cream p-8 text-center text-sm font-semibold text-muted sm:col-span-2 lg:col-span-4">
            <p>
              {activeProvince === "all"
                ? "สถานที่ท่องเที่ยวที่เผยแพร่แล้วจะปรากฏที่นี่หลังจากเพิ่มเนื้อหาในฐานข้อมูล"
                : `ยังไม่มีสถานที่แนะนำสำหรับ${activeFilter.label}`}
            </p>
            {activeProvince !== "all" ? (
              <button
                type="button"
                onClick={() => setActiveProvince("all")}
                className="mt-4 inline-flex rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-black text-ink transition hover:text-coral"
              >
                ดูทั้งหมด
              </button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
