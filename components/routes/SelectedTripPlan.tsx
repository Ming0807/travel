import { ArrowSquareOut, MapPin, PencilSimpleLine } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { createGoogleMapsTripHref } from "@/lib/trip-shortlist/navigation";
import type { AttractionCard } from "@/types/tourism";

export function SelectedTripPlan({ attractions }: { attractions: AttractionCard[] }) {
  const mapsHref = createGoogleMapsTripHref(attractions);

  return (
    <section aria-labelledby="selected-trip-heading" className="mt-8 border-y border-orange-200 bg-[#fffaf3] py-6 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-coral">ทริปของฉัน</p>
          <h2 id="selected-trip-heading" className="mt-1 text-2xl font-black text-ink">
            วางแผนจากสถานที่ที่บันทึก
          </h2>
          <p className="mt-1 text-sm text-muted">
            ระบบเรียงจุดแวะตามลำดับที่คุณเลือก และส่งต่อไปยัง Google Maps ได้ทันที
          </p>
        </div>
        <Link href="/attractions" className="inline-flex min-h-11 items-center gap-2 border border-orange-200 bg-white px-4 text-sm font-bold text-coral hover:bg-orange-50">
          <PencilSimpleLine aria-hidden="true" size={18} />
          แก้รายการสถานที่
        </Link>
      </div>

      {attractions.length > 0 ? (
        <>
          <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {attractions.map((attraction, index) => (
              <li key={attraction.slug} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 border border-orange-100 bg-white p-3">
                <div className="relative aspect-square overflow-hidden bg-cream">
                  {attraction.imageUrl ? (
                    <PublicMediaFrame
                      src={attraction.imageUrl}
                      alt={attraction.imageAlt}
                      aspect="square"
                      sizes="56px"
                      fallbackLabel=""
                    />
                  ) : (
                    <span className="grid size-full place-items-center text-coral"><MapPin aria-hidden="true" size={20} /></span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-coral">จุดที่ {(index + 1).toLocaleString("th-TH")}</p>
                  <Link href={`/attractions/${attraction.slug}`} className="mt-0.5 block truncate text-sm font-bold text-ink hover:text-coral">
                    {attraction.name}
                  </Link>
                  <p className="mt-1 truncate text-xs text-muted">{attraction.district || attraction.province}</p>
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
              เปิดเส้นทางใน Google Maps
              <ArrowSquareOut aria-hidden="true" size={18} />
            </a>
          ) : null}
          {attractions.length > 10 ? (
            <p className="mt-2 text-xs text-muted">Google Maps เปิดได้ครั้งละ 10 จุดแรก ส่วนรายการทั้งหมดจะยังแสดงอยู่ในหน้านี้</p>
          ) : null}
        </>
      ) : (
        <div className="mt-5 border border-dashed border-orange-200 bg-white p-5 text-sm text-muted">
          ไม่พบสถานที่ที่เผยแพร่จากรายการนี้ อาจมีบางรายการถูกปิดเผยแพร่แล้ว กรุณากลับไปเลือกสถานที่อีกครั้ง
        </div>
      )}
    </section>
  );
}
