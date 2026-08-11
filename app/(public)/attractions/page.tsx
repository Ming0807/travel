import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AttractionDirectoryClient } from "@/components/attractions/AttractionDirectoryClient";
import { AttractionDiscoveryCta } from "@/components/attractions/AttractionDiscoveryCta";
import { AttractionDiscoveryFilters } from "@/components/attractions/AttractionDiscoveryFilters";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicPagination } from "@/components/public/PublicPagination";
import { PublicEmptyState } from "@/components/public/PublicStates";
import { PublicDirectoryIntro } from "@/components/public/directory/PublicDirectoryIntro";
import { PublicDirectoryToolbar } from "@/components/public/directory/PublicDirectoryToolbar";
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
      description: "ค้นหาสถานที่ที่เหมาะกับแผนเดินทางของคุณจากข้อมูลที่เผยแพร่แล้ว",
    }),
    settingsService.getSetting("attractions_page_banner", {
      title: "วางแผนต่อจากสถานที่ที่เลือก",
      subtitle: "ดูเส้นทางที่เชื่อมสถานที่ในยะลาเพื่อจัดทริปได้ง่ายขึ้น",
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
    "ค้นหาสถานที่ที่เหมาะกับแผนเดินทางของคุณจากข้อมูลที่เผยแพร่แล้ว",
  );
  const hasFilters = Boolean(query || selectedType);
  const selectedTypeLabel = typeOptions.find((option) => option.value === selectedType)?.label;
  const featured = selectFeaturedAttraction(attractionPage.items);

  return (
    <div className="min-h-screen bg-[var(--public-canvas)] text-[var(--public-ink)]">
      <PublicPageFrame variant="directory">
        <PublicDirectoryIntro
          breadcrumbs={[{ label: "หน้าแรก", href: "/" }, { label: "สถานที่ท่องเที่ยว" }]}
          title={title}
          description={description}
          scope="ขอบเขตข้อมูลปัจจุบัน: จังหวัดยะลา"
        />

        <div className="mt-7">
          <PublicDirectoryToolbar label="ค้นหาและกรองสถานที่">
            <AttractionDiscoveryFilters query={query} selectedType={selectedType} typeOptions={typeOptions} />
          </PublicDirectoryToolbar>
          {hasFilters ? (
            <p role="status" className="mt-3 text-sm leading-6 text-black/65">
              <span className="font-semibold text-[var(--public-ink)]">ตัวกรองที่ใช้:</span>
              {query ? ` คำค้น “${query}”` : ""}
              {query && selectedTypeLabel ? "," : ""}
              {selectedTypeLabel ? ` ประเภท ${selectedTypeLabel}` : ""}
            </p>
          ) : null}
        </div>

        <section aria-labelledby="attraction-results-heading" className="mt-9">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-4">
            <div>
              <h2 id="attraction-results-heading" className="text-2xl font-bold">สถานที่ที่ค้นพบ</h2>
              <PublicResultSummary count={attractionPage.total} noun="สถานที่" className="mt-1" />
            </div>
            {attractionPage.pageCount > 1 ? (
              <p className="text-sm font-semibold text-black/60">
                หน้า {attractionPage.page.toLocaleString("th-TH")} จาก {attractionPage.pageCount.toLocaleString("th-TH")}
              </p>
            ) : null}
          </div>

          {attractionPage.items.length > 0 ? (
            <>
              <div className="mt-6">
                <AttractionDirectoryClient items={attractionPage.items} featuredSlug={featured?.slug ?? null} />
              </div>
              <PublicPagination
                page={attractionPage.page}
                pageCount={attractionPage.pageCount}
                createHref={(nextPage) => attractionDiscoveryHref({ query, type: selectedType, page: nextPage })}
              />
            </>
          ) : (
            <div className="mt-6">
              <PublicEmptyState
                title={hasFilters ? "ไม่พบสถานที่ที่ตรงกับตัวกรอง" : "ยังไม่มีสถานที่ที่เผยแพร่"}
                description={hasFilters ? "ลองเปลี่ยนคำค้นหรือเลือกประเภทอื่น แล้วค้นหาอีกครั้ง" : "เมื่อทีมงานเผยแพร่ข้อมูลสถานที่ รายการจะปรากฏที่หน้านี้"}
                action={hasFilters ? <PublicButton href="/attractions" variant="secondary">ล้างตัวกรอง</PublicButton> : undefined}
              />
            </div>
          )}
        </section>

        <AttractionDiscoveryCta
          title={launchSafeAttractionsCopy(bannerSettings.title, "วางแผนต่อจากสถานที่ที่เลือก")}
          subtitle={launchSafeAttractionsCopy(bannerSettings.subtitle, "ดูเส้นทางที่เชื่อมสถานที่ในยะลาเพื่อจัดทริปได้ง่ายขึ้น")}
          linkText={launchSafeAttractionsCopy(bannerSettings.linkText, "ดูเส้นทางแนะนำ")}
          linkUrl={safeAttractionsBannerHref(bannerSettings.linkUrl)}
          image={bannerSettings.image}
        />
      </PublicPageFrame>
      <SiteFooter />
    </div>
  );
}
