import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapTrifold, CalendarBlank, CaretRight, NavigationArrow } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { listPublicRoutes } from "@/lib/repositories/public-content.repository";
import { SettingsService } from "@/lib/services/settings.service";

export const metadata: Metadata = {
  title: "เส้นทางแนะนำ | ท่องเที่ยวชายแดนใต้",
  description: "ค้นพบเส้นทางท่องเที่ยวที่คัดสรรมาเป็นอย่างดีในยะลา ปัตตานี และนราธิวาส",
};

export const dynamic = "force-dynamic";

export default async function RoutesPage() {
  const settingsService = new SettingsService();
  const [routes, heroSettings] = await Promise.all([
    listPublicRoutes(20),
    settingsService.getSetting("routes_page_hero", {
      title: "เส้นทางท่องเที่ยว <br/> <span class=\"text-leaf\">ที่แนะนำ</span>",
      description: "ให้เราช่วยคุณวางแผนการเดินทาง ด้วยเส้นทางท่องเที่ยวที่คัดสรรมาเป็นอย่างดี ครอบคลุมทั้งสถานที่ยอดฮิตและจุดหมายลับที่รอคุณไปค้นพบ"
    })
  ]);

  return (
    <div className="bg-background min-h-screen text-ink pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-20">
        
        {/* Breadcrumb */}
        <div className="flex gap-2 text-xs font-bold text-muted uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-coral transition-colors">หน้าแรก</Link>
          <span>›</span>
          <span className="text-ink">เส้นทาง</span>
        </div>

        {/* HERO SECTION */}
        <section className="mb-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-ink mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: heroSettings.title }}>
              </h1>
              <p className="text-muted leading-relaxed text-base md:text-lg">
                {heroSettings.description}
              </p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white border border-ink/10 px-6 py-3 rounded-full text-sm font-bold text-ink hover:bg-cream transition-colors flex items-center gap-2">
                <MapTrifold size={20} /> ดูเส้นทางบนแผนที่
              </button>
            </div>
          </div>
        </section>

        {/* ROUTES GRID */}
        {routes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {routes.map((route) => (
              <Link href={`/routes/${route.slug}`} key={route.slug} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-ink/5">
                <div className="relative h-64 w-full overflow-hidden">
                  {route.imageUrl ? (
                    <Image 
                      src={route.imageUrl} 
                      alt={route.name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-sand/70 text-center text-sm font-semibold text-muted">
                      <MapTrifold size={28} className="text-leaf" />
                      <span>ยังไม่มีรูปภาพ</span>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-ink shadow-sm">
                    <CalendarBlank size={14} className="text-leaf" /> {route.days} วัน
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-black text-ink mb-3 group-hover:text-leaf transition-colors line-clamp-2">
                    {route.name}
                  </h3>
                  <p className="text-sm text-muted mb-6 line-clamp-3 leading-relaxed flex-grow">
                    {route.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-ink/5 mt-auto">
                    <span className="text-sm font-bold text-leaf flex items-center gap-1.5 group-hover:underline">
                      <NavigationArrow size={16} /> ดูแผนการเดินทาง
                    </span>
                    <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-ink group-hover:bg-leaf group-hover:text-white transition-colors">
                      <CaretRight weight="bold" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-2xl border border-ink/5">
            <MapTrifold size={48} className="mx-auto text-muted mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-ink mb-2">ยังไม่มีเส้นทางแนะนำในขณะนี้</h3>
            <p className="text-muted">กำลังเตรียมเส้นทางท่องเที่ยวใหม่ๆ สำหรับคุณ โปรดติดตาม</p>
          </div>
        )}
      </div>
      
      {/* SITE FOOTER */}
      <SiteFooter />
    </div>
  );
}
