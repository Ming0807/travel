import { Suspense } from "react";
import { HomepageHero, HomepageSections, HomepageStats, type HomepageEditorialProps } from "./HomepageEditorial";
import { HomepageMotion } from "./HomepageMotion";
import { HomepageLoading } from "./HomepageLoading";
import "./homepage-editorial.css";
import { SiteFooter } from "../layout/SiteFooter";
import { SITE_SETTING_DEFAULTS } from "@/lib/config/site-settings";
import {
  listPublicAttractionCards, listAvailablePublicRestaurantCategories,
  listPublicAccommodations, listPublicRestaurants, listPublicStories,
} from "@/lib/repositories/public-content.repository";
import { getPublicDashboardAnalytics } from "@/lib/services/dashboard.service";
import { loadHomepageRoutes } from "@/lib/services/homepage-routes.service";
import { SettingsService } from "@/lib/services/settings.service";

type HomeData = Omit<HomepageEditorialProps, "hero" | "media" | "stats">;

export async function loadHomepageContent(settingsService = new SettingsService()): Promise<HomeData> {
  const [featured, storiesSetting, routeSetting] = await Promise.all([
    settingsService.getSetting("homepage_featured_attractions", SITE_SETTING_DEFAULTS.homepage_featured_attractions),
    settingsService.getSetting("homepage_stories", SITE_SETTING_DEFAULTS.homepage_stories),
    settingsService.getSetting("homepage_featured_routes", SITE_SETTING_DEFAULTS.homepage_featured_routes),
  ]);
  const cafe = listAvailablePublicRestaurantCategories()
    .catch(() => ({ items: [], state: "unavailable" as const }))
    .then(async (categories) => {
      const category = categories.items.find((item) => item.sectionKey === "cafes");
      const restaurants = category ? await listPublicRestaurants({ categorySlug: category.slug, limit: 1 }).catch(() => []) : [];
      return { cafeRestaurant: restaurants[0] ?? null, cafeCategorySlug: category?.slug ?? null };
    });
  const [attractions, discoveryAttractions, restaurants, accommodations, stories, routeState, cafeState] = await Promise.all([
    listPublicAttractionCards(8, { featuredSlugs: featured.slugs ?? [] }).catch(() => []),
    listPublicAttractionCards(24).catch(() => []),
    listPublicRestaurants({ limit: 4 }).catch(() => []),
    listPublicAccommodations({ limit: 1 }).catch(() => []),
    listPublicStories({ limit: Math.max(1, Math.min(8, storiesSetting.limit ?? 4)) }).catch(() => []),
    loadHomepageRoutes(routeSetting.limit ?? 3, routeSetting.slugs ?? []),
    cafe,
  ]);
  return { attractions, discoveryAttractions, restaurants, accommodations, stories, routes: routeState.items, routesUnavailable: routeState.unavailable, ...cafeState };
}

export async function HomepageEvidence() {
  const analytics = await getPublicDashboardAnalytics({}).catch(() => null);
  const kpis = new Map(analytics?.kpis.map((kpi) => [kpi.key, kpi.value]) ?? []);
  const stats = [
    { key: "tourist_profiles", label: "นักเดินทางในระบบ" },
    { key: "total_visits", label: "บันทึกการเดินทาง" },
    { key: "certificates_generated", label: "ใบประกาศดิจิทัล" },
  ].flatMap(({ key, label }) => {
    const value = kpis.get(key);
    return value === undefined || value === null ? [] : [{ label, value: String(value) }];
  });
  return <HomepageStats stats={stats} />;
}

export async function HomepageContent({ data, hero, media }: Pick<HomepageEditorialProps, "hero" | "media"> & { data: Promise<HomeData> }) {
  return <HomepageSections {...await data} hero={hero} media={media} stats={[]}
    evidence={<Suspense fallback={<span role="status">กำลังโหลดข้อมูลสรุป…</span>}><HomepageEvidence /></Suspense>} />;
}

export async function Homepage() {
  const settingsService = new SettingsService();
  // Begin lower-page work concurrently, without making it a prerequisite for Hero.
  const data = loadHomepageContent(settingsService);
  const [heroSetting, mediaSetting] = await Promise.all([
    settingsService.getSetting("homepage_hero", SITE_SETTING_DEFAULTS.homepage_hero),
    settingsService.getSetting("homepage_highlights", SITE_SETTING_DEFAULTS.homepage_highlights),
  ]);
  const hero = { ...SITE_SETTING_DEFAULTS.homepage_hero, ...heroSetting };
  const media = { ...SITE_SETTING_DEFAULTS.homepage_highlights, ...mediaSetting };
  return <>
    <main className="home-editorial"><HomepageMotion /><HomepageHero hero={hero} />
      <Suspense fallback={<HomepageLoading />}><HomepageContent data={data} hero={hero} media={media} /></Suspense>
    </main>
    <SiteFooter />
  </>;
}
