"use client";

import { ArrowRight, BookOpen, Camera, CheckCircle, PenNib, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";

export function StoryEditorialCta() {
  const submissionSteps = [
    { icon: PenNib, text: "เขียนและจัดรูปแบบง่ายดาย" },
    { icon: Camera, text: "แนบภาพถ่ายการเดินทางจริง" },
    { icon: CheckCircle, text: "ตรวจสอบความถูกต้องโดยทีมงาน" },
    { icon: Sparkle, text: "เผยแพร่สู่สายตานักท่องเที่ยว" },
  ];

  return (
    <section
      aria-labelledby="story-cta-heading"
      className="mt-16 overflow-hidden rounded-3xl border border-orange-100 bg-[#FFFDF9] p-6 shadow-sm sm:p-8 lg:p-10"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)] lg:items-center">
        {/* Left Column: Headline, Workflow Steps, Actions */}
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-coral">
            <Sparkle size={16} weight="fill" />
            <span>พื้นที่แบ่งปันประสบการณ์การเดินทาง</span>
            <span>✧</span>
          </div>

          <h2 id="story-cta-heading" className="mt-2 text-2xl font-black text-ink sm:text-3xl">
            ร่วมแบ่งปันเรื่องราวของคุณ
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
            เปิดพื้นที่ให้นักเดินทางร่วมถ่ายทอดความทรงจำ อาหาร วัฒนธรรม และสถานที่ประทับใจในจังหวัดยะลา
            (เรื่องราวที่ส่งเข้ามาจะได้รับการตรวจสอบจากทีมงานก่อนเผยแพร่สู่สาธารณะ)
          </p>

          {/* 4 Benefit Pills */}
          <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-2.5">
            {submissionSteps.map((item, idx) => {
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
              href="/stories/share"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 text-xs font-black text-white shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] hover:shadow-orange-500/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              <PenNib size={15} weight="bold" />
              <span>เริ่มเขียนเรื่องราว</span>
              <ArrowRight aria-hidden="true" size={15} weight="bold" />
            </Link>

            <Link
              href="/routes"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-orange-200 bg-white px-5 text-xs font-bold text-coral transition-colors hover:bg-orange-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              ดูเส้นทางท่องเที่ยวแนะนำ
            </Link>
          </div>
        </div>

        {/* Right Column: Visual Graphic */}
        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-orange-100/80 bg-gradient-to-br from-amber-50 to-orange-100/50 sm:aspect-[2/1] lg:aspect-[16/10]">
          <div className="relative size-full flex items-center justify-center p-6">
            {/* Story Editorial Simulation */}
            <svg className="absolute inset-0 size-full opacity-60" viewBox="0 0 400 250" fill="none">
              <path
                d="M50,180 Q150,60 250,150 T360,80"
                stroke="#F97316"
                strokeWidth="3"
                strokeDasharray="6 6"
                strokeLinecap="round"
              />
              <circle cx="50" cy="180" r="8" fill="#F97316" />
              <circle cx="200" cy="115" r="8" fill="#F59E0B" />
              <circle cx="350" cy="85" r="8" fill="#EA580C" />
            </svg>

            <div className="relative z-10 flex flex-col items-center gap-2 text-center">
              <div className="grid size-12 place-items-center rounded-2xl bg-white text-coral shadow-md">
                <BookOpen size={28} weight="fill" />
              </div>
              <p className="text-xs font-black text-ink">บอกเล่าความประทับใจของคุณ</p>
              <p className="text-[11px] font-bold text-muted">สร้างแรงบันดาลใจให้นักเดินทางคนถัดไป</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
