import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicEmptyState, PublicErrorState } from "@/components/public/PublicStates";
import { PublicDirectoryIntro } from "@/components/public/directory/PublicDirectoryIntro";
import { PublicResultSummary } from "@/components/public/directory/PublicResultSummary";
import { PublicRouteCard } from "@/components/routes/PublicRouteCard";
import { launchSafeAttractionsCopy } from "@/lib/attractions/discovery-copy";
import { listPublicRoutes } from "@/lib/repositories/public-content.repository";
import { SettingsService } from "@/lib/services/settings.service";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "เส้นทางท่องเที่ยวแนะนำในยะลา",
  description: "วางแผนเที่ยวจังหวัดยะลาด้วยเส้นทางและจุดแวะที่ทีมงานเผยแพร่จากข้อมูลสถานที่จริง",
  alternates: { canonical: "/routes" },
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
      <PublicPageFrame variant="directory">
        <PublicDirectoryIntro
          breadcrumbs={[{ label: "หน้าแรก", href: "/" }, { label: "เส้นทางแนะนำ" }]}
          title={title}
          description={description}
          scope="ทุกจุดแวะเชื่อมกับหน้าสถานที่ที่เผยแพร่จริง"
        />

        <section aria-labelledby="routes-result-heading" className="mt-9">
          <div className="border-b border-black/10 pb-4">
            <h2 id="routes-result-heading" className="text-2xl font-bold">แผนการเดินทางที่เผยแพร่</h2>
            {!routeState.loadError ? <PublicResultSummary count={routes.length} noun="เส้นทาง" className="mt-1" /> : null}
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
              {routes.map((route, index) => <PublicRouteCard key={route.slug} route={route} priority={index === 0} />)}
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
