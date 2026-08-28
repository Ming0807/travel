"use client";

import { Compass, MapTrifold, PenNib, QrCode, User } from "@phosphor-icons/react";
import Link from "next/link";

export function StorySidebar() {
  return (
    <div className="space-y-6">
      {/* Card 1: Share Your Story */}
      <aside
        aria-label="แบ่งปันเรื่องราวของคุณ"
        className="relative overflow-hidden rounded-2xl border border-orange-200/90 bg-gradient-to-br from-[#FFFDF9] via-orange-50/40 to-amber-50/60 p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 border-b border-orange-100 pb-3.5">
          <div className="grid size-8 place-items-center rounded-lg bg-orange-500 text-white shadow-xs">
            <PenNib size={18} weight="bold" />
          </div>
          <div>
            <h2 className="text-sm font-black text-ink">แบ่งปันเรื่องราวของคุณ</h2>
            <p className="text-[11px] font-bold text-coral">เปิดรับบทความจากนักเดินทาง</p>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted">
          ร่วมถ่ายทอดความทรงจำ อาหาร วัฒนธรรม และสถานที่ที่คุณประทับใจในจังหวัดยะลา
        </p>

        <div className="mt-4 space-y-2">
          <Link
            href="/stories/share"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 px-4 text-xs font-black text-white shadow-md shadow-orange-500/20 transition-all hover:scale-[1.02] hover:shadow-orange-500/35"
          >
            <PenNib size={15} weight="bold" />
            <span>เริ่มเขียนเรื่องราว</span>
          </Link>

          <Link
            href="/profile"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-ink/15 bg-white py-2 px-3 text-xs font-bold text-ink transition-colors hover:border-coral hover:bg-orange-50/40 hover:text-coral"
          >
            <User size={14} weight="bold" />
            <span>เรื่องราวของฉัน</span>
          </Link>
        </div>

        <p className="mt-3 text-[10px] font-semibold text-muted text-center">
          *เรื่องราวจะได้รับการตรวจสอบจากทีมงานก่อนเผยแพร่
        </p>
      </aside>

      {/* Card 2: Digital Passport / Stamp Checkin */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-5 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-white/10 blur-xl" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 size-28 rounded-full bg-black/10 blur-xl" />

        <div className="relative z-10">
          <div className="inline-flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
            <QrCode size={24} weight="bold" className="text-white" />
          </div>

          <h3 className="mt-3 text-base font-black tracking-tight text-white">
            เช็กอินตามรอยเรื่องราว
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-white/90">
            สแกน QR เช็กอินสะสมดิจิทัลสแตมป์ตามจุดท่องเที่ยวที่แนะนำในบทความ
          </p>

          <Link
            href="/checkin/try"
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-coral shadow-sm transition-transform hover:scale-[1.02]"
          >
            <QrCode size={16} weight="bold" />
            <span>สแกน QR เพื่อเช็กอิน</span>
          </Link>
        </div>
      </div>

      {/* Card 3: Connected Travel Routes */}
      <aside
        aria-label="เส้นทางท่องเที่ยวแนะนำ"
        className="rounded-2xl border border-orange-100/90 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 text-ink">
          <div className="grid size-8 place-items-center rounded-lg bg-orange-50 text-coral">
            <Compass size={20} weight="fill" />
          </div>
          <div>
            <h3 className="text-sm font-black text-ink">เส้นทางท่องเที่ยวยะลา</h3>
            <p className="text-[11px] font-bold text-muted">เชื่อมโยงเรื่องราวสู่ทริปจริง</p>
          </div>
        </div>

        <p className="mt-2.5 text-xs text-muted leading-relaxed">
          ค้นหาเส้นทางแนะนำที่ร้อยเรียงสถานที่ท่องเที่ยว ร้านอาหาร และที่พักในยะลา
        </p>

        <Link
          href="/routes"
          className="mt-4 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/40 p-3 text-xs font-bold text-ink transition-colors hover:bg-orange-100/60 hover:text-coral"
        >
          <span className="flex items-center gap-2">
            <MapTrifold size={16} weight="bold" className="text-coral" />
            <span>ดูเส้นทางทั้งหมด</span>
          </span>
          <span>&gt;</span>
        </Link>
      </aside>
    </div>
  );
}
