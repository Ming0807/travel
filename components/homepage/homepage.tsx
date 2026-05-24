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

export async function Homepage() {
  const [attractions, stories, routes] = await Promise.all([
    listPublicAttractionCards(8),
    listPublicStories(4),
    listPublicRoutes(3)
  ]);

  return (
    <>
      <HomepageHero />
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
