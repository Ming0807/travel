import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Phone,
  Bed,
  NavigationArrow,
  Compass,
  CurrencyCircleDollar
} from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getPublicAccommodationDetail } from "@/lib/repositories/public-content.repository";

export const dynamic = "force-dynamic";

export default async function AccommodationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const accommodation = await getPublicAccommodationDetail(slug);

  if (!accommodation) {
    notFound();
  }

  return (
    <main className="bg-slate-50 min-h-screen pb-12">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-10">

        {/* Breadcrumb */}
        <div className="flex gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-coral transition-colors">หน้าแรก</Link>
          <span>/</span>
          <Link href="/accommodations" className="hover:text-coral transition-colors">ที่พัก</Link>
          <span>/</span>
          <span className="text-ink">{accommodation.name}</span>
        </div>

        {/* Hero Section */}
        <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-md border border-ink/5 mb-10">
          {accommodation.imageUrl ? (
            <Image
              src={accommodation.imageUrl}
              alt={accommodation.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-ink" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent"></div>
          <div className="absolute bottom-8 left-8 right-8 text-white">
            {accommodation.accommodationType && (
              <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm text-white px-3 py-1 text-[10px] font-bold mb-3 uppercase tracking-wider border border-white/20">
                {accommodation.accommodationType}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-black mb-2 leading-tight">
              {accommodation.name}
            </h1>
            <p className="text-white/80 text-sm flex items-center gap-2">
              <MapPin size={14} weight="fill" />
              {accommodation.province}
            </p>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          {/* Left Column */}
          <div className="min-w-0 space-y-10">

            {/* Description */}
            {accommodation.description && (
              <section>
                <h2 className="text-2xl font-black text-ink mb-4">เกี่ยวกับ</h2>
                <p className="text-base leading-relaxed text-muted whitespace-pre-line">
                  {accommodation.description}
                </p>
              </section>
            )}

            {/* Nearby Attractions */}
            {accommodation.nearbyAttractions.length > 0 && (
              <section>
                <h2 className="text-2xl font-black text-ink mb-6">สถานที่ท่องเที่ยวใกล้เคียง</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {accommodation.nearbyAttractions.map((attraction) => (
                    <Link
                      key={attraction.slug}
                      href={`/attractions/${attraction.slug}`}
                      className="group flex items-center gap-4 bg-white p-3 rounded-xl border border-ink/5 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-cream">
                        {attraction.imageUrl ? (
                          <Image
                            src={attraction.imageUrl}
                            alt={attraction.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] font-semibold text-muted">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-sm text-ink mb-1 group-hover:text-[#E18868] transition-colors leading-tight">
                          {attraction.name}
                        </h3>
                        {attraction.distanceText && (
                          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
                            <NavigationArrow size={10} weight="fill" className="inline mr-1 text-[#E18868]" />
                            {attraction.distanceText}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Right Column - Info Sidebar */}
          <aside className="lg:block">
            <div className="sticky top-24 space-y-6">

              {/* Quick Info Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-ink/5">
                <h3 className="font-black text-ink text-lg mb-6">ข้อมูลที่พัก</h3>

                <div className="space-y-5">
                  {accommodation.accommodationType && (
                    <div className="flex items-start gap-3">
                      <Bed size={20} className="text-[#E18868] mt-0.5 shrink-0" weight="light" />
                      <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">ประเภทที่พัก</p>
                        <p className="text-sm font-bold text-ink">{accommodation.accommodationType}</p>
                      </div>
                    </div>
                  )}

                  {accommodation.priceRange && (
                    <div className="flex items-start gap-3">
                      <CurrencyCircleDollar size={20} className="text-[#E18868] mt-0.5 shrink-0" weight="light" />
                      <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">ช่วงราคา</p>
                        <p className="text-sm font-bold text-ink">{accommodation.priceRange}</p>
                      </div>
                    </div>
                  )}

                  {accommodation.addressText && (
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="text-[#E18868] mt-0.5 shrink-0" weight="light" />
                      <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">ที่อยู่</p>
                        <p className="text-sm font-bold text-ink">{accommodation.addressText}</p>
                      </div>
                    </div>
                  )}

                  {accommodation.contactInfo && (
                    <div className="flex items-start gap-3">
                      <Phone size={20} className="text-[#E18868] mt-0.5 shrink-0" weight="light" />
                      <div>
                        <p className="text-xs font-bold text-muted uppercase tracking-wider">ข้อมูลติดต่อ</p>
                        <p className="text-sm font-bold text-ink">{accommodation.contactInfo}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Map Placeholder */}
              {accommodation.latitude && accommodation.longitude && (
                <div className="bg-teal/5 rounded-2xl p-6 text-center border border-ink/5 relative overflow-hidden h-48">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(243,112,76,0.16),transparent_34%),radial-gradient(circle_at_80%_35%,rgba(10,107,98,0.14),transparent_36%)] pointer-events-none" />
                  <div className="relative z-10 flex flex-col items-center justify-center h-full">
                    <Compass size={32} className="text-[#E18868] mb-2" weight="fill" />
                    <p className="text-sm font-bold text-ink">
                      {accommodation.latitude.toFixed(4)}, {accommodation.longitude.toFixed(4)}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${accommodation.latitude},${accommodation.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 bg-white text-ink px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-cream transition-colors"
                    >
                      <NavigationArrow size={14} weight="fill" /> ดูเส้นทาง
                    </a>
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <h3 className="font-black text-lg mb-2">มาเที่ยวชายแดนใต้ใช่ไหม?</h3>
                <p className="text-sm text-white/90 mb-4">
                  เริ่มต้นการเดินทางและสะสมตราประทับพร้อมรับใบประกาศดิจิทัล
                </p>
                <Link
                  href="/passport"
                  className="inline-flex items-center gap-2 bg-white text-ink px-5 py-2.5 rounded-full text-xs font-bold shadow-sm hover:bg-cream transition-colors"
                >
                  เริ่มต้นใช้งานพาสปอร์ต
                </Link>
              </div>

            </div>
          </aside>
        </div>

      </div>
      <SiteFooter />
    </main>
  );
}
