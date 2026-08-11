"use client";

import { ArrowRight, MapPin, Trash } from "@phosphor-icons/react";
import Link from "next/link";

import { useTripShortlist } from "./TripShortlistProvider";

export interface TripShortlistItem {
  slug: string;
  name: string;
  href: string;
}

function countLabel(count: number) {
  return `${count.toLocaleString("th-TH")} สถานที่ในทริป`;
}

export function TripShortlistPanel({ items }: { items: TripShortlistItem[] }) {
  const { slugs, hydrated, remove, clear } = useTripShortlist();
  const visibleItems = items.filter((item) => slugs.includes(item.slug));

  return (
    <aside aria-label="ทริปของฉัน" className="border border-black/10 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-[var(--public-coral)]">ทริปของฉัน</p>
          <h2 className="mt-1 text-lg font-bold text-[var(--public-ink)]">{countLabel(hydrated ? slugs.length : 0)}</h2>
        </div>
        {slugs.length > 0 ? (
          <button type="button" onClick={clear} className="min-h-11 rounded-[var(--public-radius-control)] px-2 text-sm font-semibold text-black/60 hover:bg-black/5">
            ล้างทั้งหมด
          </button>
        ) : null}
      </div>

      {visibleItems.length > 0 ? (
        <ul className="mt-4 divide-y divide-black/10 border-y border-black/10">
          {visibleItems.map((item) => (
            <li key={item.slug} className="flex items-center gap-2 py-3">
              <MapPin aria-hidden="true" size={17} weight="fill" className="shrink-0 text-[var(--public-coral)]" />
              <Link href={item.href} className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--public-ink)] hover:text-[var(--public-teal)]">
                {item.name}
              </Link>
              <button
                type="button"
                aria-label={`นำ${item.name}ออกจากทริป`}
                onClick={() => remove(item.slug, item.name)}
                className="grid size-11 shrink-0 place-items-center rounded-[var(--public-radius-control)] text-black/55 hover:bg-black/5 hover:text-[#b42318]"
              >
                <Trash aria-hidden="true" size={17} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-6 text-black/60">
          {slugs.length > 0 ? "สถานที่ที่บันทึกไว้อยู่นอกผลลัพธ์หน้านี้" : "กดเก็บสถานที่ที่สนใจไว้เปรียบเทียบระหว่างวางแผนเดินทาง"}
        </p>
      )}

      <Link
        href="/routes"
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--public-radius-control)] bg-[var(--public-coral)] px-4 text-sm font-bold text-[var(--public-ink)] hover:bg-[#d86548]"
      >
        ดูเส้นทางแนะนำ <ArrowRight aria-hidden="true" size={17} />
      </Link>
    </aside>
  );
}
