import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AttractionDirectoryClient } from "@/components/attractions/AttractionDirectoryClient";
import { AttractionDiscoveryCta } from "@/components/attractions/AttractionDiscoveryCta";
import { AttractionDiscoveryFilters } from "@/components/attractions/AttractionDiscoveryFilters";
import { AttractionHero } from "@/components/attractions/AttractionHero";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicPagination } from "@/components/public/PublicPagination";
import { PublicEmptyState } from "@/components/public/PublicStates";
import { PublicResultSummary } from "@/components/public/directory/PublicResultSummary";
import { launchSafeAttractionsCopy, safeAttractionsBannerHref } from "@/lib/attractions/discovery-copy";
import { resolveAttractionTypeOptions } from "@/lib/attractions/discovery-query";
import { selectFeaturedAttraction } from "@/lib/attractions/featured-result";
import { listPublicAttractionPage, PUBLIC_ATTRACTION_MAX_PAGE } from "@/lib/repositories/public-content.repository";
import { SettingsService } from "@/lib/services/settings.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "สถานที่ท่องเที่ยวในยะลา",
  description: "ค้นหาและเลือกสถานที่ท่องเที่ยวในจังหวัดยะลาจากข้อมูลที่เผยแพร่แล้ว",
  alternates: { canonical: "/attractions" },
};

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(params: SearchParams, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parsePage(value?: string) {
  const parsed = value ? Number(value) : 1;
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= PUBLIC_ATTRACTION_MAX_PAGE ? parsed : 1;
}

function attractionDiscoveryHref({ query, type, page }: { query?: string; type?: string; page?: number }) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (type) params.set("type", type);
  if (page && page > 1) params.set("page", String(page));
  const queryString = params.toString();
  return queryString ? `/attractions?${queryString}` : "/attractions";
}

export default async function AttractionsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const resolvedParams = await searchParams;
  const query = getParam(resolvedParams, "q");
  const requestedType = getParam(resolvedParams, "type");
  const requestedProvince = getParam(resolvedParams, "province");
  const requestedPage = getParam(resolvedParams, "page");
  const page = parsePage(requestedPage);

  if (requestedProvince || (requestedPage !== undefined && requestedPage !== String(page))) {
    redirect(attractionDiscoveryHref({ query, type: requestedType, page }));
  }

  const settingsService = new SettingsService();
  const supabase = await createSupabaseServerClient();
  const [attractionPage, heroSettings, bannerSettings, typesResult] = await Promise.all([
    listPublicAttractionPage({ query, type: requestedType, page, pageSize: 12 }),
    settingsService.getSetting("attractions_page_hero", {
      title: "สถานที่ท่องเที่ยวในจังหวัดยะลา",
      description: "ค้นพบสถานที่ท่องเที่ยวที่น่าประทับใจในจังหวัดยะลา วัฒนธรรม ธรรมชาติ และวิถีชีวิตที่มีเอกลักษณ์",
    }),
    settingsService.getSetting("attractions_page_banner", {
      title: "วางแผนต่อจากสถานที่ที่เลือก",
      subtitle: "สร้างเส้นทางท่องเที่ยวในแบบของคุณ เลือกสถานที่ที่สนใจ แล้วให้เราช่วยวางแผนการเดินทางที่ดีที่สุด",
      linkText: "ดูเส้นทางแนะนำ",
      linkUrl: "/routes",
      image: "",
    }),
    supabase
      .from("attraction_types")
      .select("type_name_en, type_name_th")
      .eq("is_active", true)
      .order("display_order", { ascending: true, nullsFirst: false })
      .order("type_name_th", { ascending: true }),
  ]);

  const typeOptions = resolveAttractionTypeOptions(typesResult.data ?? [], typesResult.error);
  const selectedType = typeOptions.some((option) => option.value === requestedType) ? requestedType : undefined;

  if (requestedType && !selectedType) redirect(attractionDiscoveryHref({ query }));
  if (page > Math.max(attractionPage.pageCount, 1)) {
    redirect(attractionDiscoveryHref({
      query,
      type: selectedType,
      page: attractionPage.pageCount > 1 ? attractionPage.pageCount : undefined,
    }));
  }

  const title = launchSafeAttractionsCopy(heroSettings.title, "สถานที่ท่องเที่ยวในจังหวัดยะลา");
  const description = launchSafeAttractionsCopy(
    heroSettings.description,
    "ค้นพบสถานที่ท่องเที่ยวที่น่าประทับใจในจังหวัดยะลา วัฒนธรรม ธรรมชาติ และวิถีชีวิตที่มีเอกลักษณ์",
  );
  const hasFilters = Boolean(query || selectedType);
  const selectedTypeLabel = typeOptions.find((option) => option.value === selectedType)?.label;
  const featured = selectFeaturedAttraction(attractionPage.items);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-ink">
      {/* 1. Panoramic Hero Section */}
      <AttractionHero
        title={title}
        description={description}
      />

      {/* 2. Floating Search and Filter Bar */}
      <AttractionDiscoveryFilters
        query={query}
        selectedType={selectedType}
        typeOptions={typeOptions}
      />

      {/* 3. Main Discovery Workspace Frame */}
      <PublicPageFrame variant="directory">
        {hasFilters ? (
          <div role="status" className="mb-6 rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-xs font-bold text-muted shadow-xs">
            <span className="font-black text-coral">ตัวกรองที่ใช้:</span>
            {query ? ` คำค้น “${query}”` : ""}
            {query && selectedTypeLabel ? "," : ""}
            {selectedTypeLabel ? ` ประเภท ${selectedTypeLabel}` : ""}
          </div>
        ) : null}

        <section aria-labelledby="attraction-results-heading" className="mt-4 sm:mt-6">
          {/* Section Heading & Result Summary */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-orange-100/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-coral">
                <span className="text-amber-500">❖</span>
                <span>{hasFilters ? "ผลการค้นหา" : "สถานที่แนะนำ"}</span>
                <span className="text-amber-500">❖</span>
              </div>
              <h2 id="attraction-results-heading" className="mt-1 text-2xl font-black text-ink sm:text-3xl">
                {hasFilters ? "รายการสถานที่ที่ตรงกับเงื่อนไข" : "สถานที่แนะนำ"}
              </h2>
              <PublicResultSummary count={attractionPage.total} noun="สถานที่" className="mt-1 font-bold text-muted" />
            </div>

            {attractionPage.pageCount > 1 ? (
              <p className="text-xs font-bold text-muted">
                หน้า {attractionPage.page.toLocaleString("th-TH")} จาก {attractionPage.pageCount.toLocaleString("th-TH")}
              </p>
            ) : null}
          </div>

          {attractionPage.items.length > 0 ? (
            <>
              <AttractionDirectoryClient
                items={attractionPage.items}
                featuredSlug={featured?.slug ?? null}
              />
              <PublicPagination
                page={attractionPage.page}
                pageCount={attractionPage.pageCount}
                createHref={(nextPage) => attractionDiscoveryHref({ query, type: selectedType, page: nextPage })}
              />
            </>
          ) : (
            <div className="mt-8">
              <PublicEmptyState
                title={hasFilters ? "ไม่พบสถานที่ที่ตรงกับตัวกรอง" : "ยังไม่มีสถานที่ที่เผยแพร่"}
                description={hasFilters ? "ลองเปลี่ยนคำค้นหรือเลือกประเภทอื่น แล้วค้นหาอีกครั้ง" : "เมื่อทีมงานเผยแพร่ข้อมูลสถานที่ รายการจะปรากฏที่หน้านี้"}
                action={hasFilters ? <PublicButton href="/attractions" variant="secondary">ล้างตัวกรอง</PublicButton> : undefined}
              />
            </div>
          )}
        </section>

        {/* 4. Trip Planning Bottom Callout Banner */}
        <AttractionDiscoveryCta
          title={launchSafeAttractionsCopy(bannerSettings.title, "วางแผนต่อจากสถานที่ที่เลือก")}
          subtitle={launchSafeAttractionsCopy(bannerSettings.subtitle, "สร้างเส้นทางท่องเที่ยวในแบบของคุณ เลือกสถานที่ที่สนใจ แล้วให้เราช่วยวางแผนการเดินทางที่ดีที่สุด")}
          linkText={launchSafeAttractionsCopy(bannerSettings.linkText, "ดูเส้นทางแนะนำ")}
          linkUrl={safeAttractionsBannerHref(bannerSettings.linkUrl)}
          image={bannerSettings.image}
        />
      </PublicPageFrame>

      {/* 5. Footer */}
      <SiteFooter />
    </div>
  );
}
