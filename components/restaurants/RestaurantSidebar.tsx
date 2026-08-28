"use client";

import { BookOpenText, ForkKnife, MapPin, QrCode, Trash } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";
import { useTripShortlist } from "@/components/trip-shortlist/TripShortlistProvider";
import { createRestaurantPlanHref } from "@/lib/trip-shortlist/navigation";

export interface RestaurantShortlistItem {
  slug: string;
  name: string;
  href: string;
  imageUrl?: string | null;
  province?: string | null;
}

export function RestaurantSidebar({ shortlistItems }: { shortlistItems: RestaurantShortlistItem[] }) {
  const { slugs, hydrated, remove, clear } = useTripShortlist();
  const visibleItems = shortlistItems.filter((item) => slugs.includes(item.slug));
  const count = hydrated ? slugs.length : 0;
  const planningHref = createRestaurantPlanHref(slugs);

  return (
    <div className="space-y-6">
      {/* Card 1: My Trip / Food Shortlist Panel */}
      <aside
        aria-label="ทริปของฉัน"
        className="rounded-2xl border border-orange-100/90 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-orange-100/70 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-orange-50 text-coral">
              <ForkKnife size={18} weight="fill" />
            </div>
            <div>
              <h2 className="text-sm font-black text-ink">ทริปของฉัน</h2>
              <p className="text-[11px] font-bold text-coral">
                {count > 0 ? `มื้อที่บันทึกไว้ ${count.toLocaleString("th-TH")} รายการ` : "ยังไม่มีรายการที่บันทึก"}
              </p>
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
                    📍 {item.province || "ยะลา"}
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
                ? "รายการที่บันทึกไว้อยู่นอกผลลัพธ์หน้านี้"
                : "กดบันทึกร้านอาหารที่สนใจเพื่อจัดเส้นทางกินเที่ยว"}
            </p>
          </div>
        )}

        <Link
          href={planningHref}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 text-xs font-black text-white shadow-xs transition-opacity hover:opacity-95"
        >
          <ForkKnife size={16} weight="bold" />
          <span>{count > 0 ? "วางแผนจากร้านที่บันทึก" : "ดูเส้นทางแนะนำ"}</span>
        </Link>
      </aside>

      {/* Card 2: Digital Stamp / Passport Incentive Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-5 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-6 -top-6 size-28 rounded-full bg-white/10 blur-xl" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 size-28 rounded-full bg-black/10 blur-xl" />

        <div className="relative z-10">
          <div className="inline-flex size-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
            <QrCode size={24} weight="bold" className="text-white" />
          </div>

          <h3 className="mt-3 text-base font-black tracking-tight text-white">
            เช็กอินรับสะสมแต้ม
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
          <h3 className="text-sm font-black text-ink">เรื่องรสชาติและวิถีชีวิต</h3>
        </div>
        <p className="mt-1.5 text-xs text-muted leading-relaxed">
          อ่านเรื่องราวอาหาร วัฒนธรรม และประสบการณ์ในยะลาที่เผยแพร่จริง
        </p>
        <Link href="/stories" className="mt-3.5 inline-flex min-h-10 w-full items-center justify-center border border-orange-200 bg-orange-50 px-4 text-xs font-black text-coral hover:bg-orange-100">
          ดูบทความและเรื่องราว
        </Link>
      </div>
    </div>
  );
}
