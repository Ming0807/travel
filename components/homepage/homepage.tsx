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
  const [attractions, stories, routes, heroSettings] = await Promise.all([
    listPublicAttractionCards(8),
    listPublicStories(4),
    listPublicRoutes(3),
    settingsService.getSetting("homepage_hero", {
      title: "ค้นพบ<br/>ความมหัศจรรย์<br/>ที่ซ่อนเร้น",
      subtitle: "ออกเดินทางสู่ดินแดนแห่งมนต์เสน่ห์",
      description: "ตามหาช่วงเวลาสุดพิเศษและสถานที่ที่ซ่อนเร้นเพื่อจุดประกายประสบการณ์ที่ไม่มีวันลืม ในยะลา ปัตตานี และนราธิวาส",
      images: [
        "https://images.unsplash.com/photo-1549880181-56a44cf4a9a1?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=800&q=85",
        "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=85"
      ]
    })
  ]);

  return (
    <>
      <HomepageHero {...heroSettings} />
      <RevealOnScroll delay={100}><HomepageAttractionsFeed attractions={attractions} /></RevealOnScroll>
      <RevealOnScroll delay={100}><HomepageHowItWorks /></RevealOnScroll>
      <RevealOnScroll delay={100}><HomepageStories stories={stories} /></RevealOnScroll>
      <RevealOnScroll delay={100}><HomepageSuggestedRoutes routes={routes} /></RevealOnScroll>
      <RevealOnScroll delay={100}><HomepageHighlights /></RevealOnScroll>
      <RevealOnScroll delay={100}><HomepageDashboardPreview /></RevealOnScroll>
      <RevealOnScroll delay={100}><HomepageCertificateCta /></RevealOnScroll>
      <HomepageFooter />
    </>
  );
}
