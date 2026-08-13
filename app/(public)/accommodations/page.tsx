import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ACCOMMODATION_TYPES,
  AccommodationFilterBar,
} from "@/components/accommodations/AccommodationFilterBar";
import { AccommodationDirectoryHero } from "@/components/accommodations/AccommodationDirectoryHero";
import {
  AccommodationFeaturedResult,
  AccommodationResultCard,
} from "@/components/accommodations/AccommodationResultCard";
import { AccommodationTypeRail } from "@/components/accommodations/AccommodationTypeRail";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicCtaBand } from "@/components/public/PublicCtaBand";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicPagination } from "@/components/public/PublicPagination";
import { PublicEmptyState, PublicErrorState } from "@/components/public/PublicStates";
import { PublicDirectoryToolbar } from "@/components/public/directory/PublicDirectoryToolbar";
import { launchSafeAttractionsCopy } from "@/lib/attractions/discovery-copy";
import { selectFeaturedHospitality } from "@/lib/hospitality/featured-result";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";
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
  const [accommodationPage, heroSettings, ctaSettings, homepageHeroSettings, liveProvinces] = await Promise.all([
    listPublicAccommodationPage({
      query,
      accommodationType,
      province: requestedProvince,
      page,
      pageSize: 12,
    }),
    settingsService.getSetting("accommodations_page_hero", {
      title: "ที่พักในจังหวัดยะลา",
      description: "เปรียบเทียบประเภทและช่วงราคาจากข้อมูลที่ผู้ดูแลเผยแพร่",
      image: "",
    }),
    settingsService.getSetting("accommodations_page_cta", {
      title: "ต้องการเพิ่มข้อมูลที่พัก?",
      subtitle: "ส่งข้อมูลให้ทีมงานตรวจสอบก่อนเผยแพร่บนแพลตฟอร์ม",
      linkText: "ติดต่อทีมงาน",
      linkUrl: "/contact",
      image: "",
    }),
    settingsService.getSetting("homepage_hero", { images: [] as string[] }),
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
    "เปรียบเทียบประเภทและช่วงราคาจากข้อมูลที่ผู้ดูแลเผยแพร่",
  );
  const hasFilters = Boolean(query || accommodationType || province);
  const featuredAccommodation = page === 1 ? selectFeaturedHospitality(accommodationPage.items) : null;
  const standardAccommodations = featuredAccommodation
    ? accommodationPage.items.filter((accommodation) => accommodation.slug !== featuredAccommodation.slug)
    : accommodationPage.items;
  const managedDirectoryImage = siteMediaImageUrl(heroSettings.image);
  const homepageFallbackImage = siteMediaImageUrl(homepageHeroSettings.images?.[0]);
  const heroImageUrl = featuredAccommodation?.imageUrl || managedDirectoryImage || homepageFallbackImage;
  const heroUsesDirectoryFallback = !featuredAccommodation?.imageUrl;

  return (
    <div className="min-h-screen bg-[var(--public-canvas)] text-[var(--public-ink)]">
      <PublicPageFrame variant="listing" className="pb-16 pt-5 sm:pt-7">
        <AccommodationDirectoryHero
          title={title}
          description={description}
          scope="ขอบเขตข้อมูลปัจจุบัน: จังหวัดยะลา"
          imageUrl={heroImageUrl}
          imageAlt={featuredAccommodation?.imageAlt || "ภาพบรรยากาศการท่องเที่ยวในจังหวัดยะลา"}
          imageContext={heroUsesDirectoryFallback && heroImageUrl ? "ภาพบรรยากาศจังหวัดยะลา" : undefined}
        />

        <div className="border-x border-b border-black/10 bg-white">
          <PublicDirectoryToolbar label="ค้นหาและกรองที่พัก" className="rounded-none border-0 border-b border-black/10">
            <AccommodationFilterBar query={query} accommodationType={accommodationType} province={province} provinces={provinceOptions} />
          </PublicDirectoryToolbar>
          <AccommodationTypeRail
            query={query}
            selectedType={accommodationType}
            province={province}
            types={ACCOMMODATION_TYPES}
          />
        </div>

        <section aria-labelledby="accommodation-results-heading" className="mt-9">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-4">
            <div>
              <h2 id="accommodation-results-heading" className="text-2xl font-black sm:text-3xl">ที่พักที่ค้นพบ</h2>
              <p className="mt-1 text-sm leading-6 text-black/65" aria-live="polite">
                {accommodationPage.state === "unavailable"
                  ? "ยังไม่สามารถสรุปจำนวนที่พักได้"
                  : `พบทั้งหมด ${accommodationPage.total.toLocaleString("th-TH")} แห่ง${hasFilters ? " ตามตัวกรองที่เลือก" : " ในจังหวัดยะลา"}`}
              </p>
            </div>
            {accommodationPage.pageCount > 1 ? (
              <p className="text-sm font-semibold text-black/65">
                หน้า {accommodationPage.page.toLocaleString("th-TH")} จาก {accommodationPage.pageCount.toLocaleString("th-TH")}
              </p>
            ) : null}
          </div>

          {accommodationPage.state === "unavailable" ? (
            <div className="mt-6">
              <PublicErrorState
                title="โหลดรายการที่พักไม่ได้ในขณะนี้"
                description="กรุณาลองใหม่อีกครั้ง ระบบจะไม่แสดงว่าไม่มีที่พักเมื่อฐานข้อมูลไม่พร้อม"
                action={<PublicButton href={accommodationHref({ query, accommodationType, province })} variant="secondary">ลองโหลดอีกครั้ง</PublicButton>}
              />
            </div>
          ) : accommodationPage.items.length === 0 ? (
            <div className="mt-6">
              <PublicEmptyState
                title={hasFilters ? "ไม่พบที่พักที่ตรงกับตัวกรอง" : "ยังไม่มีที่พักที่เผยแพร่"}
                description={hasFilters ? "ลองเปลี่ยนคำค้นหรือประเภทที่พัก" : "เมื่อทีมงานเผยแพร่ข้อมูล รายการจะปรากฏที่หน้านี้"}
                action={hasFilters ? <PublicButton href="/accommodations" variant="secondary">ล้างตัวกรอง</PublicButton> : undefined}
              />
            </div>
          ) : (
            <>
              {featuredAccommodation && featuredAccommodation.imageUrl ? (
                <div className="mt-6">
                  <AccommodationFeaturedResult accommodation={featuredAccommodation} />
                </div>
              ) : null}
              {standardAccommodations.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {standardAccommodations.map((accommodation, index) => (
                    <AccommodationResultCard
                      key={accommodation.slug}
                      accommodation={accommodation}
                      priority={!featuredAccommodation && index === 0}
                    />
                  ))}
                </div>
              ) : null}
              <PublicPagination
                page={accommodationPage.page}
                pageCount={accommodationPage.pageCount}
                createHref={(nextPage) => accommodationHref({ query, accommodationType, province, page: nextPage })}
              />
            </>
          )}
        </section>

        <PublicCtaBand
          title={launchSafeAttractionsCopy(ctaSettings.title, "ต้องการเพิ่มข้อมูลที่พัก?")}
          description={launchSafeAttractionsCopy(ctaSettings.subtitle, "ส่งข้อมูลให้ทีมงานตรวจสอบก่อนเผยแพร่บนแพลตฟอร์ม")}
          linkText={launchSafeAttractionsCopy(ctaSettings.linkText, "ติดต่อทีมงาน")}
          linkUrl={safeInternalHref(ctaSettings.linkUrl, "/contact")}
          image={ctaSettings.image}
        />
      </PublicPageFrame>
      <SiteFooter />
    </div>
  );
}
