import Image from "next/image";
import Link from "next/link";
import {
  MagnifyingGlass,
  MapPin,
  Star,
  CaretDown,
  PaperPlaneRight,
  MapTrifold,
  ShieldCheck,
  Users,
  CalendarCheck,
  ArrowRight,
  Heart
} from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { listPublicAttractionCards } from "@/lib/repositories/public-content.repository";
import { SettingsService } from "@/lib/services/settings.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AttractionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const province = typeof resolvedParams.province === 'string' ? resolvedParams.province : undefined;

  const settingsService = new SettingsService();
  const [attractions, heroSettings, bannerSettings] = await Promise.all([
    listPublicAttractionCards(16, { search, province }),
    settingsService.getSetting("attractions_page_hero", {
      title: "สำรวจ <span class=\"text-coral\">สถานที่ท่องเที่ยว</span><br/>ใน 3 จังหวัดชายแดนใต้",
      description: "จากเมืองท่องเที่ยวสุดฮิตสู่สถานที่ลึกลับที่รอการค้นพบ ค้นหาสถานที่สร้างแรงบันดาลใจและทริปต่อไปของคุณ"
    }),
    settingsService.getSetting("attractions_page_banner", {
      title: "Sea of Mist Aiyerweng",
      subtitle: "Discover the breathtaking views above the clouds.",
      linkText: "Learn more",
      linkUrl: "/attractions/aiyerweng",
      image: ""
    })
  ]);

  const featured = attractions[0] || null;
  const topDestinations = attractions.slice(1, 7);
  const trending = attractions.slice(7, 9).length > 0 ? attractions.slice(7, 9) : attractions.slice(0, 2);
  const emptyMessage = search || province
    ? "ไม่พบสถานที่ท่องเที่ยวที่ตรงกับเงื่อนไขที่ค้นหา"
    : "ยังไม่มีสถานที่ท่องเที่ยวที่เผยแพร่ในขณะนี้";

  const supabase = await createSupabaseServerClient();
  const { data: provincesData } = await supabase.from('provinces').select('province_name_en, province_name_th').eq('is_active', true).eq('is_target_area', true).order('province_name_th');
  
  const provinces = provincesData?.map(p => ({
    name: p.province_name_en,
    label: p.province_name_th,
    places: p.province_name_en
  })) || [
    { name: "Yala", label: "ยะลา", places: "Yala" },
    { name: "Pattani", label: "ปัตตานี", places: "Pattani" },
    { name: "Narathiwat", label: "นราธิวาส", places: "Narathiwat" },
  ];

  return (
    <div className="bg-background min-h-screen text-ink pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">

        {/* Breadcrumb */}
        <div className="flex gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-6">
          <span>หน้าแรก</span>
          <span>›</span>
          <span className="text-ink">สถานที่ท่องเที่ยว</span>
        </div>

        {/* HERO SECTION */}
        <section className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 items-start mb-20">
          <div className="lg:w-1/2 pt-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-ink mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: heroSettings.title }}>
            </h1>
            <p className="text-muted leading-relaxed text-base md:text-lg max-w-md mb-8">
              {heroSettings.description}
            </p>

            {/* Search & Filters */}
            <form action="/attractions" method="GET" className="bg-white p-2 rounded-full border border-ink/5 flex items-center mb-6 max-w-xl">
              <MagnifyingGlass size={20} className="text-muted ml-3" weight="bold" />
              <input
                type="text"
                name="q"
                defaultValue={search || ""}
                placeholder="ค้นหาสถานที่ท่องเที่ยว จังหวัด หรือคำค้นหา..."
                className="w-full bg-transparent px-3 py-2 text-sm text-ink outline-none"
              />
              <button type="submit" className="bg-coral text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-coral/90 transition-colors whitespace-nowrap">
                ค้นหา
              </button>
            </form>

            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 bg-white border border-ink/10 px-4 py-2 rounded-full text-xs font-bold text-ink hover:bg-cream transition-colors">
                จังหวัด <CaretDown weight="bold" />
              </button>
              <button className="flex items-center gap-2 bg-white border border-ink/10 px-4 py-2 rounded-full text-xs font-bold text-ink hover:bg-cream transition-colors">
                สไตล์การท่องเที่ยว <CaretDown weight="bold" />
              </button>
              <button className="flex items-center gap-2 bg-white border border-ink/10 px-4 py-2 rounded-full text-xs font-bold text-ink hover:bg-cream transition-colors">
                ช่วงเวลาแนะนำ <CaretDown weight="bold" />
              </button>
              {(search || province) && (
                <Link href="/attractions" className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-coral hover:underline transition-colors">
                  ล้างตัวกรอง
                </Link>
              )}
            </div>
          </div>

          {/* Featured Destination Card */}
          <div className="lg:w-1/2 w-full">
            {featured ? (
              <div className="relative w-full h-[350px] rounded-2xl overflow-hidden shadow-md border border-ink/5 group">
                {featured.imageUrl ? (
                  <Image
                    src={featured.imageUrl}
                    alt={featured.imageAlt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-cream px-6 text-center text-sm font-semibold text-muted">
                    Image not added
                  </div>
                )}

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent"></div>

                <div className="absolute top-6 left-6">
                  <span className="inline-flex items-center rounded-full bg-coral text-white px-3 py-1 text-[10px] font-black tracking-wider shadow-sm uppercase">
                    สถานที่แนะนำ
                  </span>
                </div>

                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <h2 className="text-3xl font-black mb-2 leading-tight">
                    {featured.name}, {featured.province}
                  </h2>
                  <p className="text-sm text-white/80 line-clamp-2">{featured.description}</p>
                  <Link href={`/attractions/${featured.slug}`} className="bg-white text-ink px-5 py-2.5 rounded-full text-xs font-bold shadow-sm hover:bg-cream transition-colors inline-flex items-center gap-2 mt-4">
                    อ่านเพิ่มเติม <ArrowRight size={14} weight="bold" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="w-full h-[350px] rounded-2xl bg-cream flex items-center justify-center text-muted">
                {emptyMessage}
              </div>
            )}
          </div>
        </section>

        {/* POPULAR REGIONS */}
        <section className="mb-20">
          <h2 className="text-2xl font-black text-ink mb-6">จังหวัดยอดนิยม</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {provinces.map((prov, idx) => (
              <Link href={`/attractions?province=${prov.name}`} key={idx} className="group relative h-40 md:h-48 rounded-xl overflow-hidden bg-white shadow-sm cursor-pointer border border-ink/5 block transition hover:border-coral/30 hover:shadow-md">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(243,112,76,0.16),transparent_42%),linear-gradient(135deg,rgba(10,107,98,0.08),rgba(255,255,255,0.8))]"></div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div>
                    <h3 className="text-ink font-bold text-lg leading-tight mb-1">{prov.label}</h3>
                    <p className="text-muted text-[10px] font-bold uppercase tracking-wider">{prov.places}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-coral/10 flex items-center justify-center text-coral">
                    <span className="text-xs">›</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* MAIN GRID & SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">

          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-16">

            {/* Top Destinations */}
            <section>
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-black text-ink">สถานที่ยอดนิยม</h2>
                <div>
                  <Link href="/attractions" className="text-xs font-bold text-coral hover:underline">ดูสถานที่ทั้งหมด &rarr;</Link>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {topDestinations.length > 0 ? topDestinations.map((dest) => (
                  <Link href={`/attractions/${dest.slug}`} key={dest.slug} className="group block">
                    <div className="relative h-56 w-full rounded-xl overflow-hidden mb-4 bg-cream border border-ink/5">
                      {dest.imageUrl ? (
                        <Image
                          src={dest.imageUrl}
                          alt={dest.imageAlt}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs font-semibold text-muted">
                          ยังไม่มีรูปภาพ
                        </div>
                      )}
                      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-ink hover:text-coral hover:bg-white transition-colors">
                        <Heart size={16} />
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-ink mb-1 group-hover:text-coral transition-colors">{dest.name}</h3>
                    <p className="text-xs font-bold text-muted mb-3 flex items-center gap-1 uppercase tracking-wider">
                      {dest.province}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {dest.tags.map((tag, i) => (
                        <span key={i} className="bg-cream border border-ink/5 px-2 py-1 rounded text-[10px] font-bold text-ink">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-ink/5">
                      <div>
                        <p className="text-[10px] text-muted uppercase font-bold tracking-wider mb-0.5">ช่วงเวลาที่ดีที่สุด</p>
                        <p className="text-xs font-bold text-ink flex items-center gap-1">
                          <CalendarCheck size={14} className="text-coral" /> พ.ย. - เม.ย.
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold flex items-center gap-1 justify-end">
                          <Star size={14} weight="fill" className="text-[#F5B041]" /> 4.8 <span className="text-muted font-normal">(2.3k)</span>
                        </p>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="md:col-span-2 rounded-xl border border-dashed border-ink/10 bg-white p-8 text-center text-sm font-semibold text-muted">
                    {emptyMessage}
                  </div>
                )}
              </div>
            </section>

            {/* Trending Now */}
            {trending.length > 0 && (
            <section>
              <h2 className="text-2xl font-black text-ink mb-6">กำลังมาแรง</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trending.map((trend) => (
                  <Link href={`/attractions/${trend.slug}`} key={trend.slug} className="group bg-white p-3 rounded-xl border border-ink/5 flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-cream">
                      {trend.imageUrl ? (
                        <Image
                          src={trend.imageUrl}
                          alt={trend.imageAlt}
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
                    <div>
                      <h3 className="font-black text-sm text-ink mb-1 group-hover:text-coral transition-colors leading-tight">{trend.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-coral uppercase tracking-wider">{trend.province}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
            )}
          </div>

          {/* SIDEBAR (Right) */}
          <div className="lg:col-span-4 space-y-8">

            {/* Map Widget */}
            <div className="bg-teal/5 rounded-2xl p-8 text-center border border-ink/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(10,107,98,0.12),transparent_36%),radial-gradient(circle_at_80%_30%,rgba(243,112,76,0.12),transparent_32%)] pointer-events-none" />

              <div className="relative z-10">
                <h3 className="font-black text-ink text-xl mb-4">วางแผนการเดินทางวันนี้</h3>
                <p className="text-sm text-ink/80 mb-6 leading-relaxed">
                  สำรวจสถานที่ท่องเที่ยวตามภูมิภาคและวางแผนทริปที่สมบูรณ์แบบของคุณใน 3 จังหวัดชายแดนใต้
                </p>
                <button className="bg-white text-ink border border-ink/10 px-6 py-2.5 rounded-full text-xs font-bold shadow-sm hover:bg-cream transition-colors inline-flex items-center gap-2">
                  ดูบนแผนที่ <MapTrifold weight="bold" />
                </button>
              </div>
            </div>

            {/* Travel With Confidence */}
            <div className="bg-white rounded-2xl p-6 border border-ink/5">
              <h3 className="font-black text-ink text-lg mb-6">เดินทางอย่างมั่นใจ</h3>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="text-coral mt-1 shrink-0"><ShieldCheck size={24} weight="light" /></div>
                  <div>
                    <h4 className="font-bold text-sm text-ink mb-1">สถานที่ที่ได้รับการตรวจสอบแล้ว</h4>
                    <p className="text-xs text-muted leading-relaxed">เราตรวจสอบจุดถ่ายภาพและสถานที่ท่องเที่ยวทั้งหมดเพื่อให้แน่ใจว่าปลอดภัยและเข้าถึงได้จริง</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-coral mt-1 shrink-0"><Users size={24} weight="light" /></div>
                  <div>
                    <h4 className="font-bold text-sm text-ink mb-1">ความเชี่ยวชาญในพื้นที่</h4>
                    <p className="text-xs text-muted leading-relaxed">คัดสรรโดยผู้เชี่ยวชาญด้านการเดินทางในท้องถิ่นที่รู้แหล่งท่องเที่ยวลับที่ดีที่สุด</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="text-coral mt-1 shrink-0"><MapPin size={24} weight="light" /></div>
                  <div>
                    <h4 className="font-bold text-sm text-ink mb-1">ประสบการณ์ที่แท้จริง</h4>
                    <p className="text-xs text-muted leading-relaxed">เชื่อมโยงอย่างลึกซึ้งกับวัฒนธรรม อาหาร และผู้คนในท้องถิ่นเพื่อความทรงจำที่ไม่มีวันลืม</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Image Ad */}
            <Link href={bannerSettings.linkUrl} className="relative h-72 rounded-2xl overflow-hidden border border-ink/5 group cursor-pointer block">
              {bannerSettings.image ? (
                <Image
                  src={bannerSettings.image}
                  alt={bannerSettings.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-ink" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h4 className="text-white font-black text-xl leading-tight mb-2">{bannerSettings.title}</h4>
                <p className="text-white/80 text-xs mb-4">{bannerSettings.subtitle}</p>
                <span className="text-white text-xs font-bold border-b border-white pb-0.5">{bannerSettings.linkText}</span>
              </div>
            </Link>

          </div>
        </div>

        {/* BOTTOM CTA BANNER */}
        <section className="mb-20">
          <div className="relative w-full rounded-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-12 shadow-md bg-ink">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(243,112,76,0.2),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(10,107,98,0.28),transparent_42%)]" />
            <div className="relative z-10 mb-6 md:mb-0 md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">รับแรงบันดาลใจการเดินทางส่งตรงถึงอีเมลคุณ</h2>
              <p className="text-white/80 text-sm">คู่มือการเดินทาง สถานที่ซ่อนเร้น และอัปเดตพิเศษส่งถึงคุณทุกสัปดาห์</p>
            </div>

            <div className="relative z-10 w-full md:w-auto">
              <div className="flex flex-col sm:flex-row gap-3 bg-white/10 p-1.5 rounded-full backdrop-blur-sm border border-white/20">
                <input
                  type="email"
                  placeholder="กรอกอีเมลของคุณ"
                  className="w-full sm:w-64 bg-white rounded-full px-5 py-3 text-sm text-ink outline-none"
                />
                <button type="button" className="bg-coral text-white font-bold rounded-full px-6 py-3 text-sm hover:bg-coral/90 transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
                  ติดตามข่าวสาร <PaperPlaneRight weight="fill" />
                </button>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* SITE FOOTER */}
      <SiteFooter />
    </div>
  );
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );
}
