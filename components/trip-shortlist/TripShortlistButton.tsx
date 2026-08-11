"use client";

import { BookmarkSimple } from "@phosphor-icons/react";

import { useTripShortlist } from "./TripShortlistProvider";

export function TripShortlistButton({ slug, label, className }: { slug: string; label: string; className?: string }) {
  const { has, hydrated, toggle } = useTripShortlist();
  const selected = hydrated && has(slug);
  const accessibleLabel = selected ? `นำ${label}ออกจากทริป` : `บันทึก${label}ไว้ในทริป`;

  return (
    <button
      type="button"
      aria-label={accessibleLabel}
      aria-pressed={selected}
      onClick={() => toggle(slug, label)}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[var(--public-radius-control)] border px-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)] ${
        selected
          ? "border-[var(--public-teal)] bg-[var(--public-teal)] text-white"
          : "border-black/15 bg-white text-[var(--public-ink)] hover:border-[var(--public-teal)]"
      } ${className ?? ""}`.trim()}
    >
      <BookmarkSimple aria-hidden="true" size={18} weight={selected ? "fill" : "regular"} />
      <span className="hidden sm:inline">{selected ? "บันทึกแล้ว" : "เก็บไว้ในทริป"}</span>
    </button>
  );
}
