import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicDirectoryHero } from "@/components/public/PublicDirectoryHero";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicErrorState } from "@/components/public/PublicStates";
import { PublicResultSummary } from "@/components/public/directory/PublicResultSummary";
import { RouteDiscovery } from "@/components/routes/RouteDiscovery";
import { SelectedRestaurantPlan } from "@/components/routes/SelectedRestaurantPlan";
import { SelectedTripPlan } from "@/components/routes/SelectedTripPlan";
import { launchSafeAttractionsCopy } from "@/lib/attractions/discovery-copy";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";
import { listPublicAttractionCards, listPublicRestaurants, listPublicRoutes } from "@/lib/repositories/public-content.repository";
import { SettingsService } from "@/lib/services/settings.service";
import { parseTripPlanSelection } from "@/lib/trip-shortlist/navigation";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "เส้นทางท่องเที่ยวแนะนำในยะลา",
  description: "วางแผนเที่ยวจังหวัดยะลาด้วยเส้นทางและจุดแวะที่ทีมงานเผยแพร่จากข้อมูลสถานที่จริง",
  alternates: { canonical: "/routes" },
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function RoutesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedParams = await searchParams;
  const selectedParam = typeof resolvedParams.selected === "string" ? resolvedParams.selected : undefined;
  const selectedSlugs = parseTripPlanSelection(selectedParam);
  const restaurantParam = typeof resolvedParams.restaurants === "string" ? resolvedParams.restaurants : undefined;
  const selectedRestaurantSlugs = parseTripPlanSelection(restaurantParam);
  const settingsService = new SettingsService();
  const retryParams = new URLSearchParams();
  if (selectedSlugs.length > 0) retryParams.set("selected", selectedSlugs.join(","));
  if (selectedRestaurantSlugs.length > 0) retryParams.set("restaurants", selectedRestaurantSlugs.join(","));
  const selectionRetryHref = retryParams.size > 0 ? `/routes?${retryParams.toString()}` : "/routes";
  const [routeState, heroSettings, selectedAttractions, selectedRestaurants, homepageMedia] = await Promise.all([
    listPublicRoutes(24)
      .then((items) => ({ items, loadError: false }))
      .catch(() => ({ items: [], loadError: true })),
    settingsService.getSetting("routes_page_hero", {
      title: "เส้นทางท่องเที่ยวแนะนำในยะลา",
      description: "เลือกแผนการเดินทางจากจุดแวะที่ทีมงานจัดลำดับไว้ แล้วเปิดรายละเอียดของแต่ละสถานที่ก่อนออกเดินทาง",
      image: "",
    }),
    selectedSlugs.length > 0
      ? listPublicAttractionCards(selectedSlugs.length, {
          featuredSlugs: selectedSlugs,
          exactFeaturedOnly: true,
          includeReviewSummaries: false,
          preferThumbnails: true,
          failOnError: true,
        }).then((items) => ({ items, loadError: false })).catch(() => ({ items: [], loadError: true }))
      : Promise.resolve({ items: [], loadError: false }),
    selectedRestaurantSlugs.length > 0
      ? listPublicRestaurants({ featuredSlugs: selectedRestaurantSlugs, failOnError: true })
        .then((items) => ({ items, loadError: false })).catch(() => ({ items: [], loadError: true }))
      : Promise.resolve({ items: [], loadError: false }),
    settingsService.getSetting("homepage_highlights", { routesCover: "" }).catch(() => ({ routesCover: "" })),
  ]);
  const routes = routeState.items;
  const title = launchSafeAttractionsCopy(heroSettings.title, "เส้นทางท่องเที่ยวแนะนำในยะลา");
  const description = launchSafeAttractionsCopy(
    heroSettings.description,
    "เลือกแผนการเดินทางจากจุดแวะที่ทีมงานจัดลำดับไว้ แล้วเปิดรายละเอียดของแต่ละสถานที่ก่อนออกเดินทาง",
  );
  const heroImage = siteMediaImageUrl(heroSettings.image)
    ?? siteMediaImageUrl(homepageMedia.routesCover)
    ?? routes.find((route) => route.imageUrl)?.imageUrl
    ?? "/site-media/homepage/yala-belonging-default.webp";

  return (
    <div className="min-h-screen bg-[var(--public-canvas)] text-[var(--public-ink)]">
      <PublicDirectoryHero
        id="routes-hero-heading"
        breadcrumb="เส้นทางแนะนำ"
        eyebrow="PLAN YOUR TRIP"
        title={title}
        description={description}
        imageUrl={heroImage}
        imageAlt="บรรยากาศการเดินทางท่องเที่ยวในจังหวัดยะลา"
        actions={<Link href="/attractions">สำรวจสถานที่ <ArrowRight size={18} aria-hidden="true" /></Link>}
      />
      <PublicPageFrame variant="directory" className="pt-9 sm:pt-11">
        <p className="border-l-2 border-[var(--public-coral)] pl-3 text-sm text-black/65">รายการที่เลือกเชื่อมกับเนื้อหาที่เผยแพร่จริง</p>

        {selectedSlugs.length > 0 ? selectedAttractions.loadError ? (
          <section className="mt-8" aria-label="สถานที่ที่เลือก">
            <PublicErrorState title="โหลดสถานที่ที่เลือกไม่สำเร็จ" description="ยังตรวจสอบสถานที่ในทริปไม่ได้ รายการที่เลือกยังอยู่ กรุณาลองโหลดอีกครั้ง"
              action={<PublicButton href={selectionRetryHref}>ลองโหลดรายการที่เลือกอีกครั้ง</PublicButton>} />
          </section>
        ) : <SelectedTripPlan attractions={selectedAttractions.items} /> : null}
        {selectedRestaurantSlugs.length > 0 ? selectedRestaurants.loadError ? (
          <section className="mt-8" aria-label="ร้านอาหารที่เลือก">
            <PublicErrorState title="โหลดร้านอาหารที่เลือกไม่สำเร็จ" description="ยังตรวจสอบร้านอาหารในทริปไม่ได้ รายการที่เลือกยังอยู่ กรุณาลองโหลดอีกครั้ง"
              action={<PublicButton href={selectionRetryHref}>ลองโหลดรายการที่เลือกอีกครั้ง</PublicButton>} />
          </section>
        ) : <SelectedRestaurantPlan restaurants={selectedRestaurants.items} /> : null}

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
                action={<PublicButton href={selectionRetryHref}>ลองโหลดอีกครั้ง</PublicButton>}
              />
            </div>
          ) : (
            <div className="mt-6">
              <RouteDiscovery routes={routes} />
            </div>
          )}
        </section>
      </PublicPageFrame>
      <SiteFooter />
    </div>
  );
}
