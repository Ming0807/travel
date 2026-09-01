import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicPagination } from "@/components/public/PublicPagination";
import { PublicEmptyState, PublicErrorState } from "@/components/public/PublicStates";
import { StoryDirectoryClient } from "@/components/stories/StoryDirectoryClient";
import { StoryDiscoveryFilters } from "@/components/stories/StoryDiscoveryFilters";
import { StoryEditorialCta } from "@/components/stories/StoryEditorialCta";
import { StoryHero } from "@/components/stories/StoryHero";
import {
  listPublicStoryPage,
  listPublicStoryTopics,
} from "@/lib/repositories/public-content.repository";
import { listLiveDestinationProvinces } from "@/lib/repositories/destination-scope.repository";
import {
  buildPublicStoryHref,
  parsePublicStorySearchParams,
} from "@/lib/content/public-story-query";
import { plainTextFromLegacyHtml } from "@/lib/content/plain-text";
import { launchSafeAttractionsCopy } from "@/lib/attractions/discovery-copy";
import { SettingsService } from "@/lib/services/settings.service";

export const metadata: Metadata = {
  title: "เรื่องราวจากยะลา | ท่องเที่ยวชายแดนใต้",
  description:
    "บทความ คู่มือ และเรื่องราวจากจังหวัดยะลา ซึ่งผ่านการเผยแพร่ในระบบแล้ว",
  alternates: { canonical: "/stories" },
};

export const revalidate = 60;

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const engagementEnabled = Boolean(
    process.env.CONTENT_ENGAGEMENT_HASH_SECRET,
  );
  const rawSearchParams = await searchParams;
  const parsedQuery = parsePublicStorySearchParams(rawSearchParams);
  const liveProvinces = await listLiveDestinationProvinces();
  const provinceOptions = liveProvinces.map((province) => ({
    value: province.nameEn,
    label: province.nameTh,
  }));
  const query = {
    ...parsedQuery,
    province: provinceOptions.some(
      (province) => province.value === parsedQuery.province,
    )
      ? parsedQuery.province
      : undefined,
  };
  const hasFilters = Boolean(
    query.search || query.province || query.topic || query.authorType,
  );
  const settingsService = new SettingsService();
  const [storyPage, topics, heroSettings, ctaSettings, heroFallbackPage] = await Promise.all([
    listPublicStoryPage(query),
    listPublicStoryTopics(),
    settingsService.getSetting("stories_page_hero", {
      title: "เรื่องราวและแรงบันดาลใจ สำหรับทุกการเดินทาง",
      description:
        "อ่านพื้นที่ผ่านผู้คน อาหาร วัฒนธรรม และประสบการณ์จากนักเดินทางในยะลา",
    }),
    settingsService.getSetting("stories_page_cta", {
      title: "อ่านเรื่องราวเพิ่มเติม",
      subtitle: "ค้นพบมุมมองใหม่ของพื้นที่",
      linkText: "ดูเรื่องราว",
      linkUrl: "/stories",
      image: "",
    }),
    hasFilters
      ? listPublicStoryPage({ page: 1, pageSize: 12 })
      : Promise.resolve(null),
  ]);

  if (
    !storyPage.loadError &&
    query.page > 1 &&
    (storyPage.totalPages === 0 || query.page > storyPage.totalPages)
  ) {
    redirect(
      buildPublicStoryHref(query, {
        page: storyPage.totalPages > 1 ? storyPage.totalPages : 1,
      }),
    );
  }

  const showLatest = !hasFilters && query.page === 1 && storyPage.items.length > 0;
  const latestStory = showLatest ? storyPage.items[0] : null;
  const stories = showLatest ? storyPage.items.slice(1) : storyPage.items;
  const heroStory =
    storyPage.items.find((story) => story.imageUrl || story.thumbnailUrl) ??
    heroFallbackPage?.items.find((story) => story.imageUrl || story.thumbnailUrl) ??
    null;
  const heroTitle = launchSafeAttractionsCopy(
    plainTextFromLegacyHtml(heroSettings.title),
    "เรื่องราวจากยะลา",
  );
  const heroDescription = launchSafeAttractionsCopy(
    plainTextFromLegacyHtml(heroSettings.description),
    "อ่านพื้นที่ผ่านผู้คน อาหาร วัฒนธรรม และประสบการณ์จากนักเดินทางในยะลา",
  );

  const activeTopicLabel = query.topic
    ? topics.find((t) => t.key === query.topic)?.name || query.topic
    : undefined;

  const activeAuthorLabel = query.authorType === "admin"
    ? "จากกองบรรณาธิการ"
    : query.authorType === "tourist"
      ? "จากนักเดินทาง"
      : undefined;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-ink">
      {/* 1. Panoramic Editorial Hero Banner */}
      <StoryHero
        title={heroTitle}
        description={heroDescription}
        imageUrl={heroStory?.imageUrl ?? heroStory?.thumbnailUrl ?? null}
        imageAlt={heroStory?.imageAlt}
      />

      {/* 2. Floating Search and Filter Toolbar */}
      <StoryDiscoveryFilters
        query={query}
        topics={topics}
        provinces={provinceOptions.length > 1 ? provinceOptions : []}
      />

      {/* 3. Main Discovery Workspace Frame */}
      <PublicPageFrame variant="directory">
        {hasFilters ? (
          <div role="status" className="mb-6 rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-xs font-bold text-muted shadow-xs">
            <span className="font-black text-coral">ตัวกรองที่ใช้:</span>
            {query.search ? ` คำค้น “${query.search}”` : ""}
            {query.search && activeTopicLabel ? "," : ""}
            {activeTopicLabel ? ` หัวข้อ ${activeTopicLabel}` : ""}
            {(query.search || activeTopicLabel) && activeAuthorLabel ? "," : ""}
            {activeAuthorLabel ? ` ผู้เขียน ${activeAuthorLabel}` : ""}
          </div>
        ) : null}

        <section aria-labelledby="story-results-heading" className="mt-4 sm:mt-6">
          {/* Section Heading & Result Summary */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-orange-100/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-coral">
                <span className="text-amber-500">❖</span>
                <span>{hasFilters ? "ผลการค้นหา" : "เรื่องราวที่ค้นพบ"}</span>
                <span className="text-amber-500">❖</span>
              </div>
              <h2 id="story-results-heading" className="mt-1 text-2xl font-black text-ink sm:text-3xl">
                {hasFilters ? "เรื่องราวที่ตรงกับเงื่อนไข" : "เรื่องที่ค้นพบ"}
              </h2>
              <p className="mt-1 text-xs font-bold text-muted" aria-live="polite">
                {storyPage.loadError
                  ? "ยังไม่สามารถสรุปจำนวนเรื่องราวได้"
                  : `พบทั้งหมด ${storyPage.total.toLocaleString("th-TH")} เรื่อง${hasFilters ? " ตามตัวกรองที่เลือก" : " ที่เผยแพร่แล้ว"}`}
              </p>
            </div>

            {storyPage.totalPages > 1 ? (
              <p className="text-xs font-bold text-muted">
                หน้า {storyPage.page.toLocaleString("th-TH")} จาก {storyPage.totalPages.toLocaleString("th-TH")}
              </p>
            ) : null}
          </div>

          {storyPage.loadError ? (
            <div className="mt-8">
              <PublicErrorState
                title="โหลดรายการเรื่องราวไม่ได้ในขณะนี้"
                description="กรุณาลองใหม่อีกครั้ง ระบบจะไม่แสดงว่าไม่มีเรื่องราวเมื่อการเชื่อมต่อมีปัญหา"
                action={
                  <PublicButton
                    href={buildPublicStoryHref(query, { page: query.page })}
                    variant="secondary"
                  >
                    ลองโหลดอีกครั้ง
                  </PublicButton>
                }
              />
            </div>
          ) : storyPage.items.length === 0 ? (
            <div className="mt-8">
              <PublicEmptyState
                title={hasFilters ? "ยังไม่พบเรื่องราวตามตัวกรองนี้" : "ยังไม่มีเรื่องราวที่เผยแพร่"}
                description={hasFilters ? "ลองเปลี่ยนคำค้น หัวข้อ หรือประเภทผู้เขียน" : "เมื่อทีมงานตรวจสอบและเผยแพร่เรื่องราว รายการจะปรากฏที่นี่"}
                action={
                  hasFilters ? (
                    <PublicButton href="/stories" variant="secondary">
                      ล้างตัวกรอง
                    </PublicButton>
                  ) : (
                    <PublicButton href="/stories/share" variant="secondary">
                      ส่งเรื่องให้ทีมตรวจสอบ
                    </PublicButton>
                  )
                }
              />
            </div>
          ) : (
            <>
              {/* Directory Client with Spotlight Cover and 2-Column Grid + Sidebar */}
              <StoryDirectoryClient
                latestStory={latestStory}
                stories={stories}
                engagementEnabled={engagementEnabled}
              />

              {/* Numbered Pagination */}
              <PublicPagination
                page={storyPage.page}
                pageCount={storyPage.totalPages}
                createHref={(nextPage) => buildPublicStoryHref(query, { page: nextPage })}
              />
            </>
          )}
        </section>

        {/* 4. Editorial Bottom Participation Banner */}
        <StoryEditorialCta
          title={launchSafeAttractionsCopy(
            plainTextFromLegacyHtml(ctaSettings.title),
            "อ่านและแบ่งปันเรื่องราวจากยะลา",
          )}
          subtitle={launchSafeAttractionsCopy(
            plainTextFromLegacyHtml(ctaSettings.subtitle),
            "ค้นหาเรื่องที่สนใจ หรือส่งบันทึกการเดินทางให้ทีมงานตรวจสอบก่อนเผยแพร่",
          )}
          linkText={launchSafeAttractionsCopy(
            plainTextFromLegacyHtml(ctaSettings.linkText),
            "ดูเรื่องราวทั้งหมด",
          )}
          linkUrl={
            typeof ctaSettings.linkUrl === "string" &&
            ctaSettings.linkUrl.startsWith("/") &&
            !ctaSettings.linkUrl.startsWith("//")
              ? ctaSettings.linkUrl
              : "/stories"
          }
          image={ctaSettings.image}
        />
      </PublicPageFrame>

      {/* 5. Footer */}
      <SiteFooter />
    </div>
  );
}
