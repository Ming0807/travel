"use client";

import { ArrowRight, BookmarkSimple } from "@phosphor-icons/react";
import Link from "next/link";

import { createTripPlanHref } from "@/lib/trip-shortlist/navigation";
import { useTripShortlist } from "./TripShortlistProvider";

export function TripShortlistBar() {
  const { slugs, hydrated } = useTripShortlist();
  if (!hydrated || slugs.length === 0) return null;

  return (
    <aside
      aria-label="สรุปทริปของฉัน"
      className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 flex min-h-14 items-center gap-3 border border-black/10 bg-white px-4 py-2 shadow-[0_12px_36px_rgba(15,23,42,0.18)] md:hidden"
    >
      <BookmarkSimple aria-hidden="true" size={20} weight="fill" className="shrink-0 text-[var(--public-teal)]" />
      <p className="min-w-0 flex-1 text-sm font-bold text-[var(--public-ink)]">{slugs.length.toLocaleString("th-TH")} สถานที่ในทริป</p>
      <Link href={createTripPlanHref(slugs)} className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-[var(--public-radius-control)] px-2 text-sm font-bold text-[var(--public-teal)]">
        วางแผนจากรายการนี้ <ArrowRight aria-hidden="true" size={16} />
      </Link>
    </aside>
  );
}
