import { HomepageEditorial } from "./HomepageEditorial";
import "./homepage-editorial.css";
import { SiteFooter } from "../layout/SiteFooter";
import { SITE_SETTING_DEFAULTS } from "@/lib/config/site-settings";
import {
  listPublicAttractionCards,
  listPublicRestaurants,
  listPublicRoutes,
  listPublicStories,
} from "@/lib/repositories/public-content.repository";
import { getPublicDashboardAnalytics } from "@/lib/services/dashboard.service";
import { SettingsService } from "@/lib/services/settings.service";

export async function Homepage() {
  const settingsService = new SettingsService();
  const [featured, storiesSetting, heroSetting, routeSetting, mediaSetting] = await Promise.all([
    settingsService.getSetting("homepage_featured_attractions", SITE_SETTING_DEFAULTS.homepage_featured_attractions),
    settingsService.getSetting("homepage_stories", SITE_SETTING_DEFAULTS.homepage_stories),
    settingsService.getSetting("homepage_hero", SITE_SETTING_DEFAULTS.homepage_hero),
    settingsService.getSetting("homepage_featured_routes", SITE_SETTING_DEFAULTS.homepage_featured_routes),
    settingsService.getSetting("homepage_highlights", SITE_SETTING_DEFAULTS.homepage_highlights),
  ]);

  const hero = { ...SITE_SETTING_DEFAULTS.homepage_hero, ...heroSetting };
  const media = { ...SITE_SETTING_DEFAULTS.homepage_highlights, ...mediaSetting };
  const routeLimit = Math.max(1, Math.min(12, routeSetting.limit ?? 3));
  const storiesLimit = Math.max(1, Math.min(8, storiesSetting.limit ?? 4));
  const [attractions, restaurants, stories, routeState, analytics] = await Promise.all([
    listPublicAttractionCards(8, { featuredSlugs: featured.slugs ?? [] }).catch(() => []),
    listPublicRestaurants({ limit: 4 }).catch(() => []),
    listPublicStories({ limit: storiesLimit }).catch(() => []),
    (routeSetting.slugs?.length
      ? listPublicRoutes(routeLimit, routeSetting.slugs)
      : listPublicRoutes(routeLimit))
      .then((items) => ({ items, unavailable: false }))
      .catch(() => ({ items: [], unavailable: true })),
    getPublicDashboardAnalytics({}).catch(() => null),
  ]);

  const kpis = new Map(analytics?.kpis.map((kpi) => [kpi.key, kpi.value]) ?? []);
  const stats = [
    { key: "tourist_profiles", label: "นักเดินทางในระบบ" },
    { key: "total_visits", label: "บันทึกการเดินทาง" },
    { key: "certificates_generated", label: "ใบประกาศดิจิทัล" },
  ].flatMap(({ key, label }) => {
    const value = kpis.get(key);
    return value === undefined || value === null ? [] : [{ label, value: String(value) }];
  });

  return <>
    <HomepageEditorial
      hero={hero}
      media={media}
      attractions={attractions}
      restaurants={restaurants}
      routes={routeState.items}
      stories={stories}
      stats={stats}
      routesUnavailable={routeState.unavailable}
    />
    <SiteFooter />
  </>;
}
