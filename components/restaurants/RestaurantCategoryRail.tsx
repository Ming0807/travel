"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";

type CategoryRailItem = { value: string; label: string; href: string };

export function RestaurantCategoryRail({
  items,
  activeValue,
}: {
  items: CategoryRailItem[];
  activeValue?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase("th-TH");
  const filtered = useMemo(() => items.filter((item) => (
    !normalized || item.label.toLocaleLowerCase("th-TH").includes(normalized)
  )), [items, normalized]);
  const visible = normalized || expanded ? filtered : filtered.slice(0, 8);

  return (
    <div className="sticky top-24 border-r border-black/10 pr-6">
      <p className="pb-3 text-sm font-bold text-[var(--public-ink)]">หมวดหมู่ร้านอาหาร</p>
      {items.length > 8 ? (
        <label className="relative mb-3 block">
          <span className="sr-only">ค้นหาหมวดหมู่ร้านอาหาร</span>
          <MagnifyingGlass size={16} aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-black/55" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาหมวดหมู่" className="min-h-11 w-full border border-black/15 bg-white pl-9 pr-2 text-sm outline-none focus:border-[var(--public-teal)] focus:ring-2 focus:ring-[var(--public-teal)]/20" />
        </label>
      ) : null}
      <nav aria-label="ตัวกรองหมวดหมู่ร้านอาหารทั้งหมด">
        <ul className="space-y-1">
          {visible.map((item) => {
            const selected = item.value === (activeValue ?? "");
            return (
              <li key={item.value || "all"}>
                <Link href={item.href} aria-current={selected ? "page" : undefined} className={`flex min-h-11 items-center border px-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)] ${selected
                  ? "border-[var(--public-coral-strong)] bg-[var(--public-coral)]/[0.08] text-[var(--public-coral-strong)]"
                  : "border-transparent text-black/65 hover:border-black/15 hover:bg-black/[0.025] hover:text-[var(--public-ink)]"
                }`}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {!normalized && items.length > 8 ? (
        <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-3 min-h-11 w-full border border-black/15 bg-white px-3 text-sm font-bold text-[var(--public-teal)] hover:bg-black/[0.025]">
          {expanded ? "แสดงน้อยลง" : `ดูทั้งหมด ${items.length.toLocaleString("th-TH")} หมวด`}
        </button>
      ) : null}
      {visible.length === 0 ? <p className="py-4 text-sm text-black/60">ไม่พบหมวดหมู่ที่ค้นหา</p> : null}
    </div>
  );
}
