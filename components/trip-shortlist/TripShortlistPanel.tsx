"use client";

import { ArrowRight, BookmarkSimple, MapPin, Trash } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";

import { createTripPlanHref } from "@/lib/trip-shortlist/navigation";
import { useTripShortlist } from "./TripShortlistProvider";

export interface TripShortlistItem {
  slug: string;
  name: string;
  href: string;
  imageUrl?: string | null;
  district?: string | null;
}

function countLabel(count: number) {
  return `${count.toLocaleString("th-TH")} สถานที่ในทริป`;
}

export function TripShortlistPanel({ items }: { items: TripShortlistItem[] }) {
  const { slugs, hydrated, remove, clear } = useTripShortlist();
  const visibleItems = items.filter((item) => slugs.includes(item.slug));
  const count = hydrated ? slugs.length : 0;
  const planningHref = createTripPlanHref(slugs);

  return (
    <aside
      aria-label="ทริปของฉัน"
      className="rounded-2xl border border-orange-100/90 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-orange-100/70 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-lg bg-orange-50 text-coral">
            <BookmarkSimple size={18} weight="fill" />
          </div>
          <div>
            <h2 className="text-sm font-black text-ink">ทริปของฉัน</h2>
            <p className="text-[11px] font-bold text-coral">{countLabel(count)}</p>
          </div>
        </div>

        {count > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="min-h-8 rounded-lg px-2 text-[11px] font-bold text-muted hover:bg-black/5 hover:text-[#b42318] transition-colors"
          >
            ล้างทั้งหมด
          </button>
        ) : (
          <Link href="/routes" className="text-xs font-bold text-coral hover:underline">
            ดูทั้งหมด &gt;
          </Link>
        )}
      </div>

      {visibleItems.length > 0 ? (
        <ul className="mt-3 divide-y divide-orange-100/60">
          {visibleItems.slice(0, 5).map((item) => (
            <li key={item.slug} className="flex items-center gap-3 py-2.5">
              <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-cream">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-muted">
                    <MapPin size={16} weight="fill" className="text-coral" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={item.href}
                  className="block truncate text-xs font-bold text-ink hover:text-coral transition-colors"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 text-[11px] font-bold text-muted">
                  📍 {item.district || "ยะลา"}
                </p>
              </div>
              <button
                type="button"
                aria-label={`นำ${item.name}ออกจากทริป`}
                onClick={() => remove(item.slug, item.name)}
                className="grid size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-black/5 hover:text-[#b42318] transition-colors"
              >
                <Trash aria-hidden="true" size={15} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-6 text-center">
          <p className="text-xs font-bold text-muted">
            {count > 0
              ? "สถานที่ที่บันทึกไว้อยู่นอกผลลัพธ์หน้านี้"
              : "กดบันทึกสถานที่ที่สนใจเพื่อวางแผนจัดทริป"}
          </p>
        </div>
      )}

      <Link
        href={planningHref}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 text-xs font-black text-white shadow-xs transition-opacity hover:opacity-95"
      >
        <span>{count > 0 ? "วางแผนจากรายการนี้" : "ดูเส้นทางแนะนำ"}</span>
        <ArrowRight aria-hidden="true" size={15} weight="bold" />
      </Link>
    </aside>
  );
}
