"use client";

import { ArrowRight, Car, House, MapPin, ShieldCheck, Sparkle, Wallet } from "@phosphor-icons/react";
import Link from "next/link";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";

export function AccommodationDiscoveryCta({
  title,
  subtitle,
  linkText,
  linkUrl,
  image,
}: {
  title: string;
  subtitle: string;
  linkText: string;
  linkUrl: string;
  image?: string | null;
}) {
  const resolvedImageUrl = siteMediaImageUrl(image);

  const accommodationBenefits = [
    { icon: Wallet, text: "เปรียบเทียบช่วงราคาชัดเจน" },
    { icon: MapPin, text: "ค้นหาที่พักใกล้แหล่งท่องเที่ยว" },
    { icon: Car, text: "แพลนที่พักตามเส้นทางเดินทาง" },
    { icon: ShieldCheck, text: "ข้อมูลเผยแพร่โดยตรงจากผู้ดูแล" },
  ];

  return (
    <section
      aria-labelledby="accommodation-cta-heading"
      className="mt-16 overflow-hidden rounded-3xl border border-orange-100 bg-[#FFFDF9] p-6 shadow-sm sm:p-8 lg:p-10"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)] lg:items-center">
        {/* Left Column: Headline, Value Pills, Actions */}
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-coral">
            <Sparkle size={16} weight="fill" />
            <span>วางแผนที่พักสำหรับการเดินทาง</span>
            <span>✧</span>
          </div>

          <h2 id="accommodation-cta-heading" className="mt-2 text-2xl font-black text-ink sm:text-3xl">
            {title}
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
            {subtitle}
          </p>

          {/* 4 Benefit Pills */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-2.5">
            {accommodationBenefits.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl border border-orange-100 bg-white px-3 py-2 text-[11px] font-bold text-ink shadow-xs sm:text-xs"
                >
                  <div className="grid size-5 shrink-0 place-items-center rounded-full bg-orange-50 text-coral">
                    <Icon size={12} weight="bold" />
                  </div>
                  <span className="truncate">{item.text}</span>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={linkUrl}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 text-xs font-black text-white shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] hover:shadow-orange-500/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              <span>{linkText || "ค้นหาเส้นทางท่องเที่ยว"}</span>
              <ArrowRight aria-hidden="true" size={15} weight="bold" />
            </Link>

            <Link
              href="/stories"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-200 bg-white px-5 text-xs font-bold text-coral transition-colors hover:bg-orange-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              ดูเรื่องราวท่องเที่ยว
            </Link>
          </div>
        </div>

        {/* Right Column: Visual Graphic */}
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-orange-100/80 bg-gradient-to-br from-amber-50 to-orange-100/50 sm:aspect-[2/1] lg:aspect-[16/10]">
          {resolvedImageUrl ? (
            <PublicMediaFrame
              src={resolvedImageUrl}
              alt={title}
              aspect="wide"
              sizes="(max-width: 1024px) 100vw, 450px"
              fallbackLabel=""
            />
          ) : (
            <div className="relative size-full flex items-center justify-center p-6">
              {/* Route Map Simulation */}
              <svg className="absolute inset-0 size-full opacity-60" viewBox="0 0 400 250" fill="none">
                <path
                  d="M40,170 Q140,40 240,160 T370,70"
                  stroke="#F97316"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                />
                <circle cx="40" cy="170" r="8" fill="#F97316" />
                <circle cx="180" cy="120" r="8" fill="#F59E0B" />
                <circle cx="340" cy="90" r="8" fill="#EA580C" />
              </svg>

              <div className="relative z-10 flex flex-col items-center gap-2 text-center">
                <div className="grid size-12 place-items-center rounded-2xl bg-white text-coral shadow-md">
                  <House size={28} weight="fill" />
                </div>
                <p className="text-xs font-black text-ink">วางแผนที่พักและเส้นทางท่องเที่ยว</p>
                <p className="text-[11px] font-bold text-muted">เชื่อมโยงจุดหมายปลายทางในจังหวัดยะลา</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
