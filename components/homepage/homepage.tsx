import { HomepageBackground } from "./sections/HomepageBackground";
import { HomepageHero } from "./sections/HomepageHero";
import { HomepageProvinceFilter } from "./sections/HomepageProvinceFilter";
import { HomepageAttractionsFeed } from "./sections/HomepageAttractionsFeed";
import { HomepageHowItWorks } from "./sections/HomepageHowItWorks";
import { HomepageOverview } from "./sections/HomepageOverview";
import { HomepageCertificateCta } from "./sections/HomepageCertificateCta";
import { HomepageDashboardPreview } from "./sections/HomepageDashboardPreview";
import { HomepagePrivacy } from "./sections/HomepagePrivacy";
import { HomepageStories } from "./sections/HomepageStories";
import { HomepageDataJourney } from "./sections/HomepageDataJourney";
import { HomepageFooter } from "./sections/HomepageFooter";

export function Homepage() {
  return (
    <>
      <HomepageBackground />
      <HomepageHero />
      <HomepageProvinceFilter />
      <HomepageAttractionsFeed />
      <HomepageHowItWorks />
      <HomepageOverview />
      <HomepageCertificateCta />
      <HomepageDashboardPreview />
      <HomepagePrivacy />
      <HomepageStories />
      <HomepageDataJourney />
      <HomepageFooter />
    </>
  );
}
