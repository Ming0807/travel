import { ArrowSquareOut, ForkKnife, MapPin, PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import type { PublicRestaurantCard } from "@/lib/repositories/public-content.repository";
import { createGoogleMapsTripHref } from "@/lib/trip-shortlist/navigation";

export function SelectedRestaurantPlan({ restaurants }: { restaurants: PublicRestaurantCard[] }) {
  const mapsHref = createGoogleMapsTripHref(restaurants);

  return (
    <section aria-labelledby="selected-meal-heading" className="mt-8 border-y border-orange-200 bg-[#fffaf3] py-6 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-coral">มื้อที่บันทึก</p>
          <h2 id="selected-meal-heading" className="mt-1 text-2xl font-black text-ink">
            วางแผนจากร้านอาหารที่เลือก
          </h2>
          <p className="mt-1 text-sm text-muted">
            เรียงร้านตามลำดับที่บันทึกไว้ แล้วเปิดเส้นทางไปร้านจริงผ่าน Google Maps
          </p>
        </div>
        <Link href="/restaurants" className="inline-flex min-h-11 items-center gap-2 border border-orange-200 bg-white px-4 text-sm font-bold text-coral hover:bg-orange-50">
          <PencilSimpleLine aria-hidden="true" size={18} />
          แก้รายการร้านอาหาร
        </Link>
      </div>

      {restaurants.length > 0 ? (
        <>
          <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {restaurants.map((restaurant, index) => (
              <li key={restaurant.slug} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 border border-orange-100 bg-white p-3">
                <div className="relative aspect-square overflow-hidden bg-cream">
                  {restaurant.imageUrl ? (
                    <PublicMediaFrame
                      src={restaurant.imageUrl}
                      alt={restaurant.imageAlt}
                      aspect="square"
                      sizes="56px"
                      fallbackLabel=""
                    />
                  ) : (
                    <span className="grid size-full place-items-center text-coral"><ForkKnife aria-hidden="true" size={20} /></span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-coral">มื้อที่ {(index + 1).toLocaleString("th-TH")}</p>
                  <Link href={`/restaurants/${restaurant.slug}`} className="mt-0.5 block truncate text-sm font-bold text-ink hover:text-coral">
                    {restaurant.name}
                  </Link>
                  <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted">
                    <MapPin aria-hidden="true" size={12} />
                    {restaurant.province}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          {mapsHref ? (
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex min-h-11 items-center gap-2 bg-coral px-5 text-sm font-black text-white hover:bg-[#d9472b]"
            >
              เปิดเส้นทางร้านอาหารใน Google Maps
              <ArrowSquareOut aria-hidden="true" size={18} />
            </a>
          ) : null}
          {restaurants.length > 10 ? (
            <p className="mt-2 text-xs text-muted">Google Maps เปิดได้ครั้งละ 10 ร้านแรก ส่วนรายการทั้งหมดจะยังแสดงอยู่ในหน้านี้</p>
          ) : null}
        </>
      ) : (
        <div className="mt-5 border border-dashed border-orange-200 bg-white p-5 text-sm text-muted">
          ไม่พบร้านอาหารที่เผยแพร่จากรายการนี้ ร้านบางแห่งอาจถูกปิดเผยแพร่แล้ว กรุณากลับไปเลือกร้านอีกครั้ง
        </div>
      )}
    </section>
  );
}
