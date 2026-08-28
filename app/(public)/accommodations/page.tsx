import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicPagination } from "@/components/public/PublicPagination";
import { PublicEmptyState, PublicErrorState } from "@/components/public/PublicStates";
import { AccommodationDirectoryClient } from "@/components/accommodations/AccommodationDirectoryClient";
import { AccommodationDiscoveryCta } from "@/components/accommodations/AccommodationDiscoveryCta";
import { AccommodationDiscoveryFilters } from "@/components/accommodations/AccommodationDiscoveryFilters";
import {
  ACCOMMODATION_TYPES,
} from "@/components/accommodations/AccommodationFilterBar";
import { AccommodationHero } from "@/components/accommodations/AccommodationHero";
import { launchSafeAttractionsCopy } from "@/lib/attractions/discovery-copy";
import { accommodationTypeLabel } from "@/lib/hospitality/labels";
import {
  listPublicAccommodationPage,
  PUBLIC_HOSPITALITY_MAX_PAGE,
} from "@/lib/repositories/public-content.repository";
import { listLiveDestinationProvinces } from "@/lib/repositories/destination-scope.repository";
import { SettingsService } from "@/lib/services/settings.service";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ที่พักในยะลา",
  description: "ค้นหาที่พักในจังหวัดยะลาจากข้อมูลที่เผยแพร่แล้ว",
  alternates: { canonical: "/accommodations" },
};

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(params: SearchParams, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, 100)
    : undefined;
}

function parsePage(value?: string) {
  const parsed = value ? Number(value) : 1;
  return Number.isSafeInteger(parsed)
    && parsed > 0
    && parsed <= PUBLIC_HOSPITALITY_MAX_PAGE
    ? parsed
    : 1;
}

function safeInternalHref(value: string, fallback: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

function accommodationHref({
  query,
  accommodationType,
  province,
  page,
}: {
  query?: string;
  accommodationType?: string;
  province?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (accommodationType) params.set("accommodationType", accommodationType);
  if (province) params.set("province", province);
  if (page && page > 1) params.set("page", String(page));
  const queryString = params.toString();
  return queryString ? `/accommodations?${queryString}` : "/accommodations";
}

export default async function AccommodationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = getParam(params, "q");
  const requestedType = getParam(params, "accommodationType");
  const requestedProvince = getParam(params, "province");
  const requestedPage = getParam(params, "page");
  const page = parsePage(requestedPage);

  const accommodationType = ACCOMMODATION_TYPES.some((option) => option.value === requestedType)
    ? requestedType
    : undefined;

  if (
    (requestedType && !accommodationType)
    || (requestedPage !== undefined && requestedPage !== String(page))
  ) {
    redirect(accommodationHref({ query, province: requestedProvince }));
  }

  const settingsService = new SettingsService();
  const [accommodationPage, heroSettings, ctaSettings, liveProvinces] = await Promise.all([
    listPublicAccommodationPage({
      query,
      accommodationType,
      province: requestedProvince,
      page,
      pageSize: 12,
    }),
    settingsService.getSetting("accommodations_page_hero", {
      title: "ที่พักในจังหวัดยะลา",
      description: "เปรียบเทียบประเภทที่พัก ช่วงราคา และเลือกที่พักที่เหมาะกับแผนการเดินทางของคุณ",
      image: "",
    }),
    settingsService.getSetting("accommodations_page_cta", {
      title: "วางแผนที่พักให้เหมาะกับทริปของคุณ",
      subtitle: "เลือกประเภทที่พักให้ตรงกับสไตล์และงบประมาณ เพื่อการเดินทางที่คุ้มค่าและประทับใจ",
      linkText: "ค้นหาเส้นทางท่องเที่ยว",
      linkUrl: "/routes",
      image: "",
    }),
    listLiveDestinationProvinces(),
  ]);

  const provinceOptions = liveProvinces.map((province) => ({
    value: province.nameEn,
    label: province.nameTh,
  }));
  const province = provinceOptions.some((option) => option.value === requestedProvince)
    ? requestedProvince
    : undefined;

  if (requestedProvince && !province) {
    redirect(accommodationHref({ query, accommodationType }));
  }

  if (page > Math.max(accommodationPage.pageCount, 1)) {
    redirect(accommodationHref({
      query,
      accommodationType,
      province,
      page: accommodationPage.pageCount > 1 ? accommodationPage.pageCount : undefined,
    }));
  }

  const title = launchSafeAttractionsCopy(heroSettings.title, "ที่พักในจังหวัดยะลา");
  const description = launchSafeAttractionsCopy(
    heroSettings.description,
    "เปรียบเทียบประเภทที่พัก ช่วงราคา และเลือกที่พักที่เหมาะกับแผนการเดินทางของคุณ",
  );
  const hasFilters = Boolean(query || accommodationType || province);
  const selectedTypeLabel = accommodationType ? accommodationTypeLabel(accommodationType) : undefined;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-ink">
      {/* 1. Panoramic Hero Section */}
      <AccommodationHero
        title={title}
        description={description}
        image={heroSettings.image}
      />

      {/* 2. Floating Search and Filter Bar */}
      <AccommodationDiscoveryFilters
        query={query}
        accommodationType={accommodationType}
        province={province}
        provinces={provinceOptions}
        types={ACCOMMODATION_TYPES}
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

        <section aria-labelledby="accommodation-results-heading" className="mt-4 sm:mt-6">
          {/* Section Heading & Result Summary */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-orange-100/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-coral">
                <span className="text-amber-500">❖</span>
                <span>{hasFilters ? "ผลการค้นหา" : "ที่พักที่ค้นพบ"}</span>
                <span className="text-amber-500">❖</span>
              </div>
              <h2 id="accommodation-results-heading" className="mt-1 text-2xl font-black text-ink sm:text-3xl">
                {hasFilters ? "รายการที่พักที่ตรงกับเงื่อนไข" : "ที่พักที่ค้นพบ"}
              </h2>
              <p className="mt-1 text-xs font-bold text-muted" aria-live="polite">
                {accommodationPage.state === "unavailable"
                  ? "ยังไม่สามารถสรุปจำนวนที่พักได้"
                  : `พบทั้งหมด ${accommodationPage.total.toLocaleString("th-TH")} แห่ง${hasFilters ? " ตามตัวกรองที่เลือก" : " ในจังหวัดยะลา"}`}
              </p>
            </div>

            {accommodationPage.pageCount > 1 ? (
              <p className="text-xs font-bold text-muted">
                หน้า {accommodationPage.page.toLocaleString("th-TH")} จาก {accommodationPage.pageCount.toLocaleString("th-TH")}
              </p>
            ) : null}
          </div>

          {accommodationPage.state === "unavailable" ? (
            <div className="mt-8">
              <PublicErrorState
                title="โหลดรายการที่พักไม่ได้ในขณะนี้"
                description="กรุณาลองใหม่อีกครั้ง ระบบจะไม่แสดงว่าไม่มีที่พักเมื่อฐานข้อมูลไม่พร้อม"
                action={
                  <PublicButton
                    href={accommodationHref({ query, accommodationType, province })}
                    variant="secondary"
                  >
                    ลองโหลดอีกครั้ง
                  </PublicButton>
                }
              />
            </div>
          ) : accommodationPage.items.length === 0 ? (
            <div className="mt-8">
              <PublicEmptyState
                title={hasFilters ? "ไม่พบที่พักที่ตรงกับตัวกรอง" : "ยังไม่มีที่พักที่เผยแพร่"}
                description={hasFilters ? "ลองเปลี่ยนคำค้นหรือประเภทที่พัก" : "เมื่อทีมงานเผยแพร่ข้อมูล รายการจะปรากฏที่หน้านี้"}
                action={hasFilters ? <PublicButton href="/accommodations" variant="secondary">ล้างตัวกรอง</PublicButton> : undefined}
              />
            </div>
          ) : (
            <>
              <AccommodationDirectoryClient items={accommodationPage.items} />
              <PublicPagination
                page={accommodationPage.page}
                pageCount={accommodationPage.pageCount}
                createHref={(nextPage) => accommodationHref({
                  query,
                  accommodationType,
                  province,
                  page: nextPage,
                })}
              />
            </>
          )}
        </section>

        {/* 4. Travel Route Planning Bottom Callout Banner */}
        <AccommodationDiscoveryCta
          title={
            !ctaSettings.title || ctaSettings.title.includes("เจ้าของ") || ctaSettings.title.includes("เพิ่มข้อมูล")
              ? "วางแผนที่พักให้เหมาะกับทริปของคุณ"
              : launchSafeAttractionsCopy(ctaSettings.title, "วางแผนที่พักให้เหมาะกับทริปของคุณ")
          }
          subtitle={
            !ctaSettings.subtitle || ctaSettings.subtitle.includes("เจ้าของ") || ctaSettings.subtitle.includes("ตรวจสอบ")
              ? "เลือกประเภทที่พักให้ตรงกับสไตล์และงบประมาณ เพื่อการเดินทางที่คุ้มค่าและประทับใจ"
              : launchSafeAttractionsCopy(ctaSettings.subtitle, "เลือกประเภทที่พักให้ตรงกับสไตล์และงบประมาณ เพื่อการเดินทางที่คุ้มค่าและประทับใจ")
          }
          linkText={
            !ctaSettings.linkText || ctaSettings.linkText.includes("ติดต่อ") || ctaSettings.linkText.includes("ลงทะเบียน")
              ? "ค้นหาเส้นทางท่องเที่ยว"
              : launchSafeAttractionsCopy(ctaSettings.linkText, "ค้นหาเส้นทางท่องเที่ยว")
          }
          linkUrl={
            !ctaSettings.linkUrl || ctaSettings.linkUrl.includes("contact")
              ? "/routes"
              : safeInternalHref(ctaSettings.linkUrl, "/routes")
          }
          image={ctaSettings.image}
        />
      </PublicPageFrame>

      {/* 5. Footer */}
      <SiteFooter />
    </div>
  );
}
