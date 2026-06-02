import Image from "next/image";
import Link from "next/link";
import {
  MagnifyingGlass,
  MapPin,
  Star,
  ForkKnife,
  PaperPlaneRight
} from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { RestaurantFilterBar } from "@/components/restaurants/RestaurantFilterBar";
import { listPublicRestaurants } from "@/lib/repositories/public-content.repository";
import { SettingsService } from "@/lib/services/settings.service";

export const dynamic = "force-dynamic";

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const foodType = typeof resolvedParams.foodType === 'string' ? resolvedParams.foodType : undefined;
  const province = typeof resolvedParams.province === 'string' ? resolvedParams.province : undefined;

  const settingsService = new SettingsService();
  const [restaurants, heroSettings, featureSettings, ctaSettings] = await Promise.all([
    listPublicRestaurants({ search, foodType, province }),
    settingsService.getSetting("restaurants_page_hero", {
      title: "ค้นพบ <span class=\"text-coral\">รสชาติท้องถิ่น</span><br/>ใน 3 จังหวัดชายแดนใต้",
      description: "จากร้านอาหารพื้นเมืองสูตรโบราณสู่คาเฟ่สุดชิค ค้นพบรสชาติที่แท้จริงของชายแดนใต้ ที่จะทำให้การเดินทางของคุณสมบูรณ์แบบยิ่งขึ้น"
    }),
    settingsService.getSetting("restaurants_page_feature", {
      title: "Taste the Culture",
      subtitle: "จากข้าวยำปักษ์ใต้ สู่โรตีกรอบ สูตรเด็ดที่สืบทอดกันมาหลายชั่วอายุคน",
      image: ""
    }),
    settingsService.getSetting("restaurants_page_cta", {
      title: "เป็นเจ้าของร้านอาหาร?",
      subtitle: "เข้าร่วมแพลตฟอร์มของเราและเชื่อมต่อกับนักท่องเที่ยวที่มาเยือน 3 จังหวัดชายแดนใต้",
      linkText: "ลงทะเบียนร้านอาหาร",
      linkUrl: "/contact",
      image: ""
    })
  ]);


  return (
    <div className="bg-background min-h-screen text-ink pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">

        {/* Breadcrumb */}
        <div className="flex gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-coral transition-colors">หน้าแรก</Link>
          <span>/</span>
          <span className="text-ink">ร้านอาหาร</span>
        </div>

        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 items-start mb-20">
          <div className="lg:w-1/2 pt-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-200 px-4 py-1.5 text-xs font-bold text-orange-700 mb-6">
              <ForkKnife size={14} weight="fill" />
              เศรษฐกิจท้องถิ่น
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-ink mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: heroSettings.title }}>
            </h1>
            <p className="text-muted leading-relaxed text-base md:text-lg max-w-md mb-8">
              {heroSettings.description}
            </p>

            {/* Search */}
            <form action="/restaurants" method="GET" className="bg-white p-2 rounded-full border border-ink/5 flex items-center mb-6 max-w-xl">
              <MagnifyingGlass size={20} className="text-muted ml-3" weight="bold" />
              <input
                type="text"
                name="q"
                defaultValue={search || ""}
                placeholder="ค้นหาร้านอาหาร ประเภทอาหาร หรือจังหวัด..."
                className="w-full bg-transparent px-3 py-2 text-sm text-ink outline-none"
              />
              <button type="submit" className="bg-coral text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-coral/90 transition-colors whitespace-nowrap">
                ค้นหา
              </button>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <RestaurantFilterBar foodType={foodType} province={province} />
              {(search || foodType || province) && (
                <Link href="/restaurants" className="px-4 py-2 text-xs font-bold text-coral hover:underline transition-colors">
                  ดูร้านอาหารทั้งหมด &rarr;
                </Link>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="lg:w-1/2 w-full">
            <div className="relative w-full h-[350px] rounded-2xl overflow-hidden shadow-md border border-ink/5">
              {featureSettings.image ? (
                <Image
                  src={featureSettings.image}
                  alt={featureSettings.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-ink" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <h2 className="text-3xl font-black mb-2 leading-tight">
                  {featureSettings.title}
                </h2>
                <p className="text-sm text-white/90 line-clamp-2 max-w-sm mb-6">
                  {featureSettings.subtitle}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Restaurant Grid */}
        <section className="mb-20">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-black text-ink">ร้านยอดนิยม</h2>
              <p className="text-sm text-muted mt-1">
                {restaurants.length} {restaurants.length === 1 ? "ร้าน" : "ร้าน"} ที่พบ
              </p>
            </div>
          </div>

          {restaurants.length === 0 ? (
            <div className="text-center py-20">
              <ForkKnife size={48} className="mx-auto text-muted mb-4" weight="light" />
              <h3 className="text-xl font-black text-ink mb-2">ไม่พบร้านอาหาร</h3>
              <p className="text-muted text-sm mb-6">ลองปรับการค้นหาหรือตัวกรองของคุณ</p>
              <Link href="/restaurants" className="bg-coral text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-coral/90 transition-colors">
                ค้นหาร้านอาหารใกล้เคียง
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((restaurant) => (
                <Link
                  href={`/restaurants/${restaurant.slug}`}
                  key={restaurant.slug}
                  className="group block bg-white rounded-xl overflow-hidden border border-ink/5 hover:shadow-md transition-all"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-cream">
                    {restaurant.imageUrl ? (
                      <Image
                        src={restaurant.imageUrl}
                        alt={restaurant.imageAlt}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs font-semibold text-muted">
                        ยังไม่มีรูปภาพ
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm text-ink px-3 py-1 text-[10px] font-bold shadow-sm">
                        {restaurant.foodType}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-black text-ink mb-1 group-hover:text-coral transition-colors line-clamp-1">
                        {restaurant.name}
                      </h3>
                      <span className="text-[10px] font-bold text-teal uppercase tracking-wider group-hover:underline whitespace-nowrap ml-2">ดูรายละเอียด &rarr;</span>
                    </div>
                    <p className="text-xs font-bold text-muted flex items-center gap-1 mb-3 uppercase tracking-wider">
                      <MapPin size={12} weight="fill" className="text-coral" />
                      {restaurant.province}
                    </p>
                    <p className="text-sm text-muted line-clamp-2 leading-relaxed mb-4">
                      {restaurant.description}
                    </p>
                    {restaurant.rating && (
                      <div className="flex items-center gap-1 text-xs font-bold">
                        <Star size={14} weight="fill" className="text-[#F5B041]" />
                        {restaurant.rating.toFixed(1)}
                        {restaurant.reviewCount && (
                          <span className="text-muted font-normal">({restaurant.reviewCount})</span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="mb-20">
          <div className="relative w-full rounded-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-12 shadow-md bg-ink">
            {ctaSettings.image ? (
              <Image
                src={ctaSettings.image}
                alt={ctaSettings.title}
                fill
                className="object-cover opacity-20"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(243,112,76,0.2),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(10,107,98,0.28),transparent_42%)]" />
            )}
            <div className="relative z-10 mb-6 md:mb-0 md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
                {ctaSettings.title}
              </h2>
              <p className="text-white/80 text-sm">
                {ctaSettings.subtitle}
              </p>
            </div>
            <div className="relative z-10">
              <Link
                href={ctaSettings.linkUrl}
                className="bg-white text-ink px-6 py-3 rounded-full text-sm font-bold shadow-sm hover:bg-cream transition-colors inline-flex items-center gap-2 whitespace-nowrap"
              >
                {ctaSettings.linkText} <PaperPlaneRight weight="fill" />
              </Link>
            </div>
          </div>
        </section>

      </div>

      <SiteFooter />
    </div>
  );
}
