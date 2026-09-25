import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapTrifold } from "@phosphor-icons/react/dist/ssr";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicButton } from "@/components/public/PublicButton";
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
  const heroImage = homepageMedia.routesCover
    ? siteMediaImageUrl(homepageMedia.routesCover)
    : routes.find((route) => route.imageUrl)?.imageUrl ?? "/site-media/homepage/yala-belonging-default.webp";

  return (
    <div className="min-h-screen bg-[var(--public-canvas)] text-[var(--public-ink)]">
      <header className="relative isolate overflow-hidden bg-[#19443d] text-white">
        {heroImage ? (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="z-0 object-cover object-center"
          />
        ) : null}
        <div className="absolute inset-0 z-0 bg-[#103b34]/60" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <nav aria-label="เส้นทางนำทาง" className="flex flex-wrap items-center gap-2 text-sm text-white/85">
            <Link href="/" className="underline-offset-4 hover:underline">หน้าแรก</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">เส้นทางแนะนำ</span>
          </nav>
          <p className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#ffce95]">
            <MapTrifold size={20} weight="fill" aria-hidden="true" /> วางแผนการเดินทาง
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-balance sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-[58ch] text-base leading-7 text-white/90">{description}</p>
          <Link href="/attractions" className="mt-7 inline-flex min-h-11 items-center gap-2 border border-white/65 bg-white/10 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            สำรวจสถานที่ <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </header>
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
