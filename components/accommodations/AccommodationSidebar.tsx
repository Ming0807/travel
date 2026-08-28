"use client";

import { Article, Compass, MapTrifold, QrCode, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";
import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";

export function AccommodationSidebar() {
  return (
    <div className="space-y-6">
      {/* Card 1: Recommended Travel Routes */}
      <aside
        aria-label="เส้นทางท่องเที่ยวแนะนำ"
        className="rounded-2xl border border-orange-100/90 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 border-b border-orange-100/70 pb-3.5">
          <div className="grid size-8 place-items-center rounded-lg bg-orange-50 text-coral">
            <Compass size={20} weight="fill" />
          </div>
          <div>
            <h2 className="text-sm font-black text-ink">เส้นทางท่องเที่ยวยะลา</h2>
            <p className="text-[11px] font-bold text-coral">ตรวจจุดแวะก่อนเลือกที่พัก</p>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          ดูเส้นทางและจุดแวะที่ทีมงานเผยแพร่ แล้วเลือกที่พักให้เหมาะกับแผนการเดินทางของคุณ
        </p>

        <div className="mt-4 space-y-2">
          <Link
            href="/routes"
            className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/40 p-3 text-xs font-bold text-ink transition-colors hover:bg-orange-100/60 hover:text-coral"
          >
            <span className="flex items-center gap-2">
              <MapTrifold size={16} weight="bold" className="text-coral" />
              <span>ดูเส้นทางท่องเที่ยวทั้งหมด</span>
            </span>
            <span>&gt;</span>
          </Link>
        </div>
      </aside>

      {/* Card 2: Digital Stamp / Passport Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-5 text-white shadow-lg">
        <div className="relative z-10">
          <div className="inline-flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
            <QrCode size={24} weight="bold" className="text-white" />
          </div>

          <h3 className="mt-3 text-base font-black tracking-tight text-white">
            เช็กอินรับสะสมแต้ม
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-white/90">
            เช็กอิน ณ จุดที่กำหนด เพื่อบันทึกการเยี่ยมชมและสะสมตราดิจิทัลตามเงื่อนไข
          </p>

          <PublicCheckinEntryLink
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-coral shadow-sm transition-transform hover:scale-[1.02]"
          >
            <QrCode size={16} weight="bold" />
            <span>สแกน QR เพื่อเช็กอิน</span>
          </PublicCheckinEntryLink>
        </div>
      </div>

      {/* Card 3: Travel Stories & Guide */}
      <aside
        aria-label="เรื่องราวและบทความท่องเที่ยว"
        className="rounded-2xl border border-orange-100/90 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 text-ink">
          <div className="grid size-8 place-items-center rounded-lg bg-orange-50 text-coral">
            <Article size={20} weight="fill" />
          </div>
          <div>
            <h3 className="text-sm font-black text-ink">เรื่องราวการท่องเที่ยว</h3>
            <p className="text-[11px] font-bold text-muted">สัมผัสวิถีชีวิตและวัฒนธรรม</p>
          </div>
        </div>

        <p className="mt-2.5 text-xs text-muted leading-relaxed">
          อ่านบันทึกการเดินทาง เรื่องราววัฒนธรรม และเนื้อหาที่เผยแพร่บนแพลตฟอร์ม
        </p>

        <Link
          href="/stories"
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-ink/15 bg-white px-3.5 text-xs font-bold text-ink transition-colors hover:border-coral hover:bg-orange-50/50 hover:text-coral"
        >
          <Sparkle size={15} weight="bold" className="text-coral" />
          <span>อ่านเรื่องราวทั้งหมด</span>
        </Link>
      </aside>
    </div>
  );
}
