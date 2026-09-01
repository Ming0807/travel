"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  MagnifyingGlass,
  PenNib,
  User,
} from "@phosphor-icons/react";
import Link from "next/link";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";

export function StoryEditorialCta({
  title = "อ่านและแบ่งปันเรื่องราวจากยะลา",
  subtitle = "ค้นหาเรื่องที่สนใจ หรือส่งบันทึกการเดินทางให้ทีมงานตรวจสอบก่อนเผยแพร่",
  linkText = "ดูเรื่องราวทั้งหมด",
  linkUrl = "/stories",
  image,
}: {
  title?: string;
  subtitle?: string;
  linkText?: string;
  linkUrl?: string;
  image?: string | null;
}) {
  const resolvedImageUrl = siteMediaImageUrl(image);
  const capabilities = [
    { icon: MagnifyingGlass, text: "ค้นหาเรื่องจากหัวข้อ" },
    { icon: BookOpen, text: "อ่านเนื้อหาที่เผยแพร่แล้ว" },
    { icon: PenNib, text: "ส่งบันทึกให้ทีมงานตรวจ" },
    { icon: User, text: "ติดตามเรื่องจากหน้าโปรไฟล์" },
  ];

  return (
    <section
      aria-labelledby="story-cta-heading"
      className="mt-16 overflow-hidden rounded-2xl border border-orange-100 bg-[#FFFDF9] p-6 shadow-sm sm:p-8 lg:p-10"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-black text-coral">
            <BookOpen size={16} weight="fill" aria-hidden="true" />
            <span>ศูนย์รวมเรื่องราวการเดินทาง</span>
          </div>

          <h2 id="story-cta-heading" className="mt-2 text-2xl font-black text-ink sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">{subtitle}</p>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.text}
                  className="flex min-h-11 items-center gap-2 rounded-lg border border-orange-100 bg-white px-3 py-2 text-[11px] font-bold text-ink shadow-xs sm:text-xs"
                >
                  <div className="grid size-6 shrink-0 place-items-center rounded-full bg-orange-50 text-coral">
                    <Icon size={13} weight="bold" aria-hidden="true" />
                  </div>
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={linkUrl}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-coral px-6 text-xs font-black text-white shadow-md shadow-orange-500/20 transition-colors hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
            >
              <span>{linkText}</span>
              <ArrowRight aria-hidden="true" size={15} weight="bold" />
            </Link>
            <Link
              href="/stories/share"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-5 text-xs font-bold text-coral transition-colors hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              <PenNib size={15} weight="bold" aria-hidden="true" />
              แบ่งปันเรื่องราว
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-orange-100 bg-orange-50/60">
          {resolvedImageUrl ? (
            <PublicMediaFrame
              src={resolvedImageUrl}
              alt={title}
              aspect="directory"
              sizes="(max-width: 1024px) 100vw, 430px"
              fallbackLabel="ไม่มีภาพประกอบส่วนเรื่องราว"
            />
          ) : (
            <div className="grid aspect-[16/10] place-items-center p-6 text-center">
              <div>
                <div className="mx-auto grid size-12 place-items-center rounded-xl bg-white text-coral shadow-sm">
                  <CheckCircle size={28} weight="duotone" aria-hidden="true" />
                </div>
                <p className="mt-3 text-xs font-black text-ink">เรื่องที่ส่งจะเข้าสู่ขั้นตอนตรวจสอบ</p>
                <p className="mt-1 text-[11px] font-bold text-muted">ระบบเผยแพร่เฉพาะเรื่องที่ผ่านการตรวจแล้ว</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
