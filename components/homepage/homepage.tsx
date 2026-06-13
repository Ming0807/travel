import { HomepageHero } from "./sections/HomepageHero";
import { HomepageAttractionsFeed } from "./sections/HomepageAttractionsFeed";
import { HomepageHowItWorks } from "./sections/HomepageHowItWorks";
import { HomepageStories } from "./sections/HomepageStories";
import { HomepageHighlights } from "./sections/HomepageHighlights";
import { HomepageDashboardPreview } from "./sections/HomepageDashboardPreview";
import { HomepageCertificateCta } from "./sections/HomepageCertificateCta";
import { HomepageSuggestedRoutes } from "./sections/HomepageSuggestedRoutes";
import { SiteFooter as HomepageFooter } from "../layout/SiteFooter";
import { listPublicAttractionCards, listPublicStories, listPublicRoutes } from "@/lib/repositories/public-content.repository";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { SettingsService } from "@/lib/services/settings.service";

export async function Homepage() {
  const settingsService = new SettingsService();

  // First fetch the featured attractions slugs
  const featuredAttractionsSetting = await settingsService.getSetting("homepage_featured_attractions", { slugs: [] });
  const featuredSlugs = featuredAttractionsSetting?.slugs || [];

  // Fetch the homepage_stories setting first to get the limit
  const rawStoriesSettings = await settingsService.getSetting("homepage_stories", { limit: 4 });
  const storiesLimit = Math.max(1, Math.min(8, rawStoriesSettings.limit ?? 4));

  const [attractions, stories, routes, heroSettings, routesSettings, howItWorksSettings, highlightsSettings, ctaSettings] = await Promise.all([
    listPublicAttractionCards(8, { featuredSlugs }),
    listPublicStories({ limit: storiesLimit }),
    listPublicRoutes(3),
    settingsService.getSetting("homepage_hero", {
      title: "ค้นพบ<br/>ความมหัศจรรย์<br/>ที่ซ่อนเร้น",
      subtitle: "ออกเดินทางสู่ดินแดนแห่งมนต์เสน่ห์",
      description: "ตามหาช่วงเวลาสุดพิเศษและสถานที่ที่ซ่อนเร้นเพื่อจุดประกายประสบการณ์ที่ไม่มีวันลืม ในยะลา ปัตตานี และนราธิวาส",
      images: ["", "", ""]
    }),
    settingsService.getSetting("homepage_featured_routes", {
      slugs: [] as string[],
      title: "เส้นทางแนะนำ",
      subtitle: "ออกเดินทางสัมผัสประสบการณ์ใหม่ในแบบที่คุณเลือก",
      limit: 3,
    }),
    settingsService.getSetting("homepage_how_it_works", {
      title: "ใช้งานง่ายเหมือนแอป",
      subtitle: "แต่ไม่ต้องโหลดแอป",
      description: "ระบบออกแบบให้เริ่มจากการให้คุณค่าก่อน — นักท่องเที่ยวกรอกน้อยที่สุด รับใบประกาศก่อน แล้วค่อยให้ข้อมูลเพิ่มเติมแบบสมัครใจ"
    }),
    settingsService.getSetting("homepage_highlights", {
      title: "ประสบการณ์จากนักเดินทาง",
      authorName: "Maria Angelica",
      location: "มะนิลา, ฟิลิปปินส์",
      quote: "ฉันไม่เคยคาดคิดเลยว่าชายแดนใต้จะสวยงามขนาดนี้ ทะเลหมอกที่อัยเยอร์เวงนั้นน่าทึ่งมาก ใบประกาศดิจิทัลที่ได้ก็เป็นสิ่งที่ช่วยให้ความทรงจำครั้งนี้พิเศษยิ่งขึ้น แนะนำสุดๆ สำหรับคนที่ชอบการผจญภัย!",
      videoCover: "",
      imageCover: "",
      imageTitle: "ตลาดน้ำเมืองปัตตานี"
    }),
    settingsService.getSetting("homepage_cta", {
      title: "รับแรงบันดาลใจการเดินทาง",
      subtitle: "ส่งตรงถึงคุณ",
      description: "สมัครรับข่าวสารเพื่อค้นพบสถานที่ใหม่ๆ โปรโมชั่นพิเศษ และเรื่องเล่าสุดเอ็กซ์คลูซีฟจากชายแดนใต้",
      bgImage: ""
    })
  ]);

  const featuredRouteSlugs = routesSettings.slugs ?? [];
  const displayRoutes = featuredRouteSlugs.length > 0
    ? await listPublicRoutes(featuredRouteSlugs.length, featuredRouteSlugs)
    : routes;

  return (
    <>
      <HomepageHero {...heroSettings} />
      <RevealOnScroll delay={100}><HomepageAttractionsFeed attractions={attractions} /></RevealOnScroll>
      <RevealOnScroll delay={100}><HomepageHowItWorks {...howItWorksSettings} /></RevealOnScroll>
      <RevealOnScroll delay={100}><HomepageStories stories={stories} title={rawStoriesSettings.title} subtitle={rawStoriesSettings.subtitle} buttonText={rawStoriesSettings.buttonText} /></RevealOnScroll>
      <RevealOnScroll delay={100}><HomepageSuggestedRoutes routes={displayRoutes.slice(0, routesSettings.limit)} title={routesSettings.title} subtitle={routesSettings.subtitle} /></RevealOnScroll>
      <RevealOnScroll delay={100}><HomepageHighlights {...highlightsSettings} /></RevealOnScroll>
      <RevealOnScroll delay={100}><HomepageDashboardPreview /></RevealOnScroll>
      <RevealOnScroll delay={100}><HomepageCertificateCta {...ctaSettings} /></RevealOnScroll>
      <HomepageFooter />
    </>
  );
}
