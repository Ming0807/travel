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

export async function Homepage() {
  const [attractions, stories, routes] = await Promise.all([
    listPublicAttractionCards(8),
    listPublicStories(4),
    listPublicRoutes(3)
  ]);

  return (
    <>
      <HomepageHero />
      <HomepageAttractionsFeed attractions={attractions} />
      <HomepageHowItWorks />
      <HomepageStories stories={stories} />
      <HomepageSuggestedRoutes routes={routes} />
      <HomepageHighlights />
      <HomepageDashboardPreview />
      <HomepageCertificateCta />
      <HomepageFooter />
    </>
  );
}
