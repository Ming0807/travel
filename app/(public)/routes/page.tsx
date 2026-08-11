import type { Metadata } from "next";
import Link from "next/link";
import { MapTrifold, MapPin } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicEmptyState, PublicErrorState } from "@/components/public/PublicStates";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicRouteCard } from "@/components/routes/PublicRouteCard";
import { launchSafeAttractionsCopy } from "@/lib/attractions/discovery-copy";
import { listPublicRoutes } from "@/lib/repositories/public-content.repository";
import { SettingsService } from "@/lib/services/settings.service";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "เส้นทางท่องเที่ยวแนะนำในยะลา",
  description: "วางแผนเที่ยวจังหวัดยะลาด้วยเส้นทางและจุดแวะที่ทีมงานเผยแพร่จากข้อมูลสถานที่จริง",
};

export default async function RoutesPage() {
  const settingsService = new SettingsService();
  const [routeState, heroSettings] = await Promise.all([
    listPublicRoutes(24)
      .then((items) => ({ items, loadError: false }))
      .catch(() => ({ items: [], loadError: true })),
    settingsService.getSetting("routes_page_hero", {
      title: "เส้นทางท่องเที่ยวแนะนำในยะลา",
      description: "เลือกแผนการเดินทางจากจุดแวะที่ทีมงานจัดลำดับไว้ แล้วเปิดรายละเอียดของแต่ละสถานที่ก่อนออกเดินทาง",
    }),
  ]);
  const routes = routeState.items;
  const title = launchSafeAttractionsCopy(heroSettings.title, "เส้นทางท่องเที่ยวแนะนำในยะลา");
  const description = launchSafeAttractionsCopy(
    heroSettings.description,
    "เลือกแผนการเดินทางจากจุดแวะที่ทีมงานจัดลำดับไว้ แล้วเปิดรายละเอียดของแต่ละสถานที่ก่อนออกเดินทาง",
  );

  return (
    <div className="min-h-screen bg-[var(--public-canvas)] text-[var(--public-ink)]">
      <PublicPageFrame variant="listing" className="pb-16 pt-8 sm:pt-10">
        <nav aria-label="เส้นทางนำทาง" className="flex items-center gap-2 text-sm text-black/65">
          <Link href="/" className="hover:text-[var(--public-teal)]">หน้าแรก</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-[var(--public-ink)]">เส้นทางแนะนำ</span>
        </nav>

        <header className="mt-7 grid gap-5 border-b border-black/10 pb-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--public-coral-strong)]">
              <MapTrifold size={19} weight="fill" aria-hidden="true" />
              แผนเที่ยวจากสถานที่จริง
            </p>
            <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-[70ch] text-base leading-7 text-black/65 sm:text-lg">{description}</p>
          </div>
          <p className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--public-teal)]">
            <MapPin size={20} weight="fill" aria-hidden="true" />
            ขอบเขตข้อมูล: จังหวัดยะลา
          </p>
        </header>

        <section aria-labelledby="routes-result-heading" className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-4">
            <div>
              <h2 id="routes-result-heading" className="text-2xl font-bold">แผนการเดินทางที่เผยแพร่</h2>
              <p className="mt-1 text-sm leading-6 text-black/65">
                พบ {routes.length.toLocaleString("th-TH")} เส้นทาง ทุกจุดแวะเชื่อมกับหน้าสถานที่จริง
              </p>
            </div>
          </div>

          {routeState.loadError ? (
            <div className="mt-6">
              <PublicErrorState
                title="โหลดเส้นทางท่องเที่ยวไม่สำเร็จ"
                description="ระบบยังตรวจสอบเส้นทางที่เผยแพร่ไม่ได้ในขณะนี้ กรุณาลองโหลดอีกครั้ง"
                action={<PublicButton href="/routes">ลองโหลดอีกครั้ง</PublicButton>}
              />
            </div>
          ) : routes.length > 0 ? (
            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {routes.map((route, index) => (
                <PublicRouteCard key={route.slug} route={route} priority={index === 0} />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <PublicEmptyState
                title="กำลังเตรียมเส้นทางแนะนำ"
                description="เมื่อทีมงานเผยแพร่เส้นทางที่มีจุดแวะครบถ้วน รายการจะปรากฏที่หน้านี้"
                action={<PublicButton href="/attractions" variant="secondary">ดูสถานที่ท่องเที่ยว</PublicButton>}
              />
            </div>
          )}
        </section>
      </PublicPageFrame>
      <SiteFooter />
    </div>
  );
}
