import { HomepageQuickActions } from "./HomepageQuickActions";
import { HomepageCertificateCta } from "./sections/HomepageCertificateCta";
import { HomepageDashboardPreview } from "./sections/HomepageDashboardPreview";
import { HomepageDiscoveryWorkspace } from "./sections/HomepageDiscoveryWorkspace";
import { HomepageHero } from "./sections/HomepageHero";
import { HomepageHowItWorks } from "./sections/HomepageHowItWorks";
import { HomepageStories } from "./sections/HomepageStories";
import { SiteFooter as HomepageFooter } from "../layout/SiteFooter";
import {
  listPublicAttractionCards,
  listPublicRoutes,
  listPublicStories,
} from "@/lib/repositories/public-content.repository";
import { SettingsService } from "@/lib/services/settings.service";

type HomepageStoriesSetting = {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  limit?: number;
};

export async function Homepage() {
  const settingsService = new SettingsService();
  const [featuredAttractionsSetting, storiesSettings, heroSettings, routesSettings, howItWorksSettings, ctaSettings] = await Promise.all([
    settingsService.getSetting("homepage_featured_attractions", { slugs: [] as string[] }),
    settingsService.getSetting<HomepageStoriesSetting>("homepage_stories", { limit: 4 }),
    settingsService.getSetting("homepage_hero", {
      title: "เที่ยวยะลาให้ลึกกว่าเดิม",
      subtitle: "วางแผนการเดินทางในจังหวัดยะลา",
      description: "ค้นพบสถานที่ท่องเที่ยว อาหารท้องถิ่น เส้นทางน่าสนใจ และเรื่องราวจากผู้คนในพื้นที่ เพื่อให้ทุกการเดินทางมีความหมายมากขึ้น",
      images: ["", "", ""],
    }),
    settingsService.getSetting("homepage_featured_routes", {
      slugs: [] as string[],
      title: "เส้นทางแนะนำ",
      subtitle: "ออกเดินทางในยะลาตามจังหวะที่คุณเลือก",
      limit: 3,
    }),
    settingsService.getSetting("homepage_how_it_works", {
      title: "เริ่มบันทึกการเดินทางได้ใน 3 ขั้นตอน",
      subtitle: "ไม่ต้องติดตั้งแอป",
      description: "รับคุณค่าก่อน แล้วค่อยเลือกแบ่งปันข้อมูลเพื่อช่วยพัฒนาการท่องเที่ยวยะลา",
    }),
    settingsService.getSetting("homepage_cta", {
      title: "ทุกการเดินทางมีเรื่องให้สะสม",
      subtitle: "Digital Passport",
      description: "เก็บตราประจำสถานที่ไว้ใน Digital Passport ดูคะแนนของคุณ และกลับมาค้นพบยะลาในมุมใหม่ได้ทุกครั้ง",
      bgImage: "",
    }),
  ]);

  const storiesLimit = Math.max(1, Math.min(8, storiesSettings.limit ?? 4));
  const routeLimit = Math.max(1, Math.min(12, routesSettings.limit ?? 3));
  const featuredSlugs = featuredAttractionsSetting.slugs ?? [];
  const featuredRouteSlugs = routesSettings.slugs ?? [];

  const routePromise = featuredRouteSlugs.length > 0
    ? listPublicRoutes(routeLimit, featuredRouteSlugs)
    : listPublicRoutes(routeLimit);
  const [attractions, stories, routeState] = await Promise.all([
    listPublicAttractionCards(8, { featuredSlugs }),
    listPublicStories({ limit: storiesLimit }),
    routePromise
      .then((items) => ({ items, unavailable: false }))
      .catch(() => ({ items: [], unavailable: true })),
  ]);

  return (
    <>
      <HomepageHero {...heroSettings} />
      <HomepageQuickActions />
      <HomepageDiscoveryWorkspace
        attractions={attractions}
        routes={routeState.items}
        routesUnavailable={routeState.unavailable}
      />
      <HomepageHowItWorks {...howItWorksSettings} />
      <HomepageStories
        stories={stories}
        title={storiesSettings.title}
        subtitle={storiesSettings.subtitle}
        buttonText={storiesSettings.buttonText}
      />
      <HomepageDashboardPreview />
      <HomepageCertificateCta {...ctaSettings} />
      <HomepageFooter />
    </>
  );
}
