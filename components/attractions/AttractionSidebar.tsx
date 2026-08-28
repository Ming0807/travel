"use client";

import { BookOpenText, QrCode } from "@phosphor-icons/react";
import Link from "next/link";

import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";
import { TripShortlistPanel, type TripShortlistItem } from "@/components/trip-shortlist/TripShortlistPanel";

export function AttractionSidebar({ shortlistItems }: { shortlistItems: TripShortlistItem[] }) {
  return (
    <div className="space-y-6">
      {/* Card 1: My Trip / Shortlist Panel */}
      <TripShortlistPanel items={shortlistItems} />

      {/* Card 2: Digital Stamp / Passport Incentive Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-5 text-white shadow-lg">
        {/* Subtle decorative circles */}
        <div className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-white/10 blur-xl" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 size-28 rounded-full bg-black/10 blur-xl" />

        <div className="relative z-10">
          <div className="inline-flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
            <QrCode size={24} weight="bold" className="text-white" />
          </div>

          <h3 className="mt-3 text-base font-black tracking-tight text-white">
            เช็กอินสะสมแต้ม
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-white/90">
            สแกน QR ณ จุดที่กำหนด เพื่อบันทึกการเยี่ยมชมและสะสมตราดิจิทัล
          </p>

          <PublicCheckinEntryLink
            className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-coral shadow-sm transition-transform hover:scale-[1.02]"
          >
            <QrCode size={16} weight="bold" />
            <span>สแกน QR เพื่อเช็กอิน</span>
          </PublicCheckinEntryLink>
        </div>
      </div>

      {/* Card 3: Real editorial content entry */}
      <div className="rounded-2xl border border-orange-100/90 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-ink">
          <div className="grid size-7 place-items-center rounded-lg bg-orange-50 text-coral">
            <BookOpenText size={18} weight="fill" />
          </div>
          <h3 className="text-sm font-black text-ink">เรื่องเล่าจากยะลา</h3>
        </div>
        <p className="mt-1.5 text-xs text-muted leading-relaxed">
          อ่านประสบการณ์ วัฒนธรรม และคำแนะนำจากเรื่องราวที่เผยแพร่จริง
        </p>
        <Link href="/stories" className="mt-3.5 inline-flex min-h-10 w-full items-center justify-center border border-orange-200 bg-orange-50 px-4 text-xs font-black text-coral hover:bg-orange-100">
          ดูบทความและเรื่องราว
        </Link>
      </div>
    </div>
  );
}
