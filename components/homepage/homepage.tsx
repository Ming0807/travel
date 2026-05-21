import { HomepageHero } from "./sections/HomepageHero";
import { HomepageAttractionsFeed } from "./sections/HomepageAttractionsFeed";
import { HomepageHowItWorks } from "./sections/HomepageHowItWorks";
import { HomepageStories } from "./sections/HomepageStories";
import { HomepageHighlights } from "./sections/HomepageHighlights";
import { HomepageDashboardPreview } from "./sections/HomepageDashboardPreview";
import { HomepageCertificateCta } from "./sections/HomepageCertificateCta";
import { SiteFooter as HomepageFooter } from "../layout/SiteFooter";
import { listPublicAttractionCards, listPublicStories } from "@/lib/repositories/public-content.repository";

export async function Homepage() {
  const [attractions, stories] = await Promise.all([
    listPublicAttractionCards(8),
    listPublicStories(4)
  ]);

  return (
    <>
      <HomepageHero />
      <HomepageAttractionsFeed attractions={attractions} />
      <HomepageHowItWorks />
      <HomepageStories stories={stories} />
      <HomepageHighlights />
      <HomepageDashboardPreview />
      <HomepageCertificateCta />
      <HomepageFooter />
    </>
  );
}
