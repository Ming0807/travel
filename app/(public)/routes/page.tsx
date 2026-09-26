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
        })
      : Promise.resolve([]),
    selectedRestaurantSlugs.length > 0
      ? listPublicRestaurants({ featuredSlugs: selectedRestaurantSlugs })
      : Promise.resolve([]),
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

        {selectedSlugs.length > 0 ? <SelectedTripPlan attractions={selectedAttractions} /> : null}
        {selectedRestaurantSlugs.length > 0 ? <SelectedRestaurantPlan restaurants={selectedRestaurants} /> : null}

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
