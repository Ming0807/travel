import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicPagination } from "@/components/public/PublicPagination";
import { PublicEmptyState, PublicErrorState } from "@/components/public/PublicStates";
import { RestaurantDirectoryClient } from "@/components/restaurants/RestaurantDirectoryClient";
import { RestaurantDiscoveryCta } from "@/components/restaurants/RestaurantDiscoveryCta";
import { RestaurantDiscoveryFilters } from "@/components/restaurants/RestaurantDiscoveryFilters";
import { RestaurantHero } from "@/components/restaurants/RestaurantHero";
import { launchSafeAttractionsCopy } from "@/lib/attractions/discovery-copy";
import {
  listAvailablePublicRestaurantCategories,
  listPublicRestaurantPage,
  PUBLIC_HOSPITALITY_MAX_PAGE,
} from "@/lib/repositories/public-content.repository";
import { listLiveDestinationProvinces } from "@/lib/repositories/destination-scope.repository";
import { SettingsService } from "@/lib/services/settings.service";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ร้านอาหารในยะลา",
  description: "ค้นหาร้านอาหารท้องถิ่นในจังหวัดยะลาจากข้อมูลที่เผยแพร่แล้ว",
  alternates: { canonical: "/restaurants" },
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

function restaurantHref({
  query,
  categorySlug,
  foodType,
  province,
  page,
}: {
  query?: string;
  categorySlug?: string;
  foodType?: string;
  province?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (categorySlug) params.set("category", categorySlug);
  else if (foodType) params.set("foodType", foodType);
  if (province) params.set("province", province);
  if (page && page > 1) params.set("page", String(page));
  const queryString = params.toString();
  return queryString ? `/restaurants?${queryString}` : "/restaurants";
}

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = getParam(params, "q");
  const requestedCategorySlug = getParam(params, "category");
  const requestedFoodType = getParam(params, "foodType");
  const requestedProvince = getParam(params, "province");
  const requestedPage = getParam(params, "page");
  const page = parsePage(requestedPage);

  if (requestedPage !== undefined && requestedPage !== String(page)) {
    redirect(restaurantHref({ query, province: requestedProvince }));
  }

  const settingsService = new SettingsService();
  const [restaurantPage, categoryAvailability, heroSettings, ctaSettings, liveProvinces] = await Promise.all([
    listPublicRestaurantPage({
      query,
      categorySlug: requestedCategorySlug,
      foodType: requestedCategorySlug ? undefined : requestedFoodType,
      province: requestedProvince,
      page,
      pageSize: 12,
    }),
    listAvailablePublicRestaurantCategories({ province: requestedProvince }),
    settingsService.getSetting("restaurants_page_hero", {
      title: "ร้านอาหารในจังหวัดยะลา",
      description: "ค้นหาร้านอร่อยท้องถิ่นและเมนูขึ้นชื่อ เลือกมื้อที่ใช่สำหรับการเดินทางของคุณ",
    }),
    settingsService.getSetting("restaurants_page_cta", {
      title: "วางแผนมื้ออร่อยของคุณ",
      subtitle: "สร้างเส้นทางกินเที่ยวในจังหวัดยะลาในแบบของคุณ เลือกมื้ออร่อย จัดเส้นทาง และแพลนทริปได้ง่าย ๆ",
      linkText: "เริ่มวางแผนมื้ออร่อย",
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

  const matchedLegacyCategory = requestedFoodType
    ? categoryAvailability.items.find((category) => (
      category.nameEn?.toLocaleLowerCase() === requestedFoodType.toLocaleLowerCase()
      || category.name.toLocaleLowerCase() === requestedFoodType.toLocaleLowerCase()
    ))
    : undefined;
  if (requestedFoodType) {
    if (matchedLegacyCategory) {
      redirect(restaurantHref({ query, categorySlug: matchedLegacyCategory.slug, province }));
    }
  }
  const legacyFoodType = requestedFoodType && !matchedLegacyCategory ? requestedFoodType : undefined;
  const categorySlug = categoryAvailability.items.some((category) => category.slug === requestedCategorySlug)
    ? requestedCategorySlug
    : undefined;
  if (requestedCategorySlug && !categorySlug && categoryAvailability.state === "available") {
    redirect(restaurantHref({ query, province }));
  }

  if (requestedProvince && !province) {
    redirect(restaurantHref({ query, categorySlug, foodType: legacyFoodType }));
  }

  if (page > Math.max(restaurantPage.pageCount, 1)) {
    redirect(restaurantHref({
      query,
      categorySlug,
      foodType: legacyFoodType,
      province,
      page: restaurantPage.pageCount > 1 ? restaurantPage.pageCount : undefined,
    }));
  }

  const title = launchSafeAttractionsCopy(heroSettings.title, "ร้านอาหารในจังหวัดยะลา");
  const description = launchSafeAttractionsCopy(
    heroSettings.description,
    "ค้นหาร้านอร่อยท้องถิ่นและเมนูขึ้นชื่อ เลือกมื้อที่ใช่สำหรับการเดินทางของคุณ",
  );
  const hasFilters = Boolean(query || categorySlug || legacyFoodType || province);
  const categoryOptions = categoryAvailability.items.map((category) => ({ value: category.slug, label: category.name }));
  const selectedCategoryLabel = categoryOptions.find((opt) => opt.value === (categorySlug || legacyFoodType))?.label;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-ink">
      {/* 1. Panoramic Hero Section */}
      <RestaurantHero
        title={title}
        description={description}
      />

      {/* 2. Floating Search and Filter Bar */}
      <RestaurantDiscoveryFilters
        query={query}
        categorySlug={categorySlug}
        foodType={legacyFoodType}
        province={province}
        categoryOptions={categoryOptions}
        categoryParam={legacyFoodType ? "foodType" : "category"}
      />

      {/* 3. Main Discovery Workspace Frame */}
      <PublicPageFrame variant="directory">
        {hasFilters ? (
          <div role="status" className="mb-6 rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-xs font-bold text-muted shadow-xs">
            <span className="font-black text-coral">ตัวกรองที่ใช้:</span>
            {query ? ` คำค้น “${query}”` : ""}
            {query && selectedCategoryLabel ? "," : ""}
            {selectedCategoryLabel ? ` หมวดหมู่ ${selectedCategoryLabel}` : ""}
          </div>
        ) : null}

        <section aria-labelledby="restaurant-results-heading" className="mt-4 sm:mt-6">
          {/* Section Heading & Result Summary */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-orange-100/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-coral">
                <span className="text-amber-500">❖</span>
                <span>{hasFilters ? "ผลการค้นหา" : "ร้านอาหารแนะนำ"}</span>
                <span className="text-amber-500">❖</span>
              </div>
              <h2 id="restaurant-results-heading" className="mt-1 text-2xl font-black text-ink sm:text-3xl">
                {hasFilters ? "รายการร้านอาหารที่ตรงกับเงื่อนไข" : "ร้านอาหารแนะนำ"}
              </h2>
              <p className="mt-1 text-xs font-bold text-muted" aria-live="polite">
                {restaurantPage.state === "unavailable"
                  ? "ยังไม่สามารถสรุปจำนวนร้านอาหารได้"
                  : `พบทั้งหมด ${restaurantPage.total.toLocaleString("th-TH")} ร้าน${hasFilters ? " ตามตัวกรองที่เลือก" : " ในจังหวัดยะลา"}`}
              </p>
            </div>

            {restaurantPage.pageCount > 1 ? (
              <p className="text-xs font-bold text-muted">
                หน้า {restaurantPage.page.toLocaleString("th-TH")} จาก {restaurantPage.pageCount.toLocaleString("th-TH")}
              </p>
            ) : null}
          </div>

          {restaurantPage.state === "unavailable" ? (
            <div className="mt-8">
              <PublicErrorState
                title="โหลดรายการร้านอาหารไม่ได้ในขณะนี้"
                description="กรุณาลองใหม่อีกครั้ง ระบบจะไม่แสดงว่าไม่มีร้านเมื่อฐานข้อมูลไม่พร้อม"
                action={
                  <PublicButton
                    href={restaurantHref({ query, categorySlug, foodType: legacyFoodType, province })}
                    variant="secondary"
                  >
                    ลองโหลดอีกครั้ง
                  </PublicButton>
                }
              />
            </div>
          ) : restaurantPage.items.length === 0 ? (
            <div className="mt-8">
              <PublicEmptyState
                title={hasFilters ? "ไม่พบร้านอาหารที่ตรงกับตัวกรอง" : "ยังไม่มีร้านอาหารที่เผยแพร่"}
                description={hasFilters ? "ลองเปลี่ยนคำค้นหรือประเภทอาหาร" : "เมื่อทีมงานเผยแพร่ข้อมูล รายการจะปรากฏที่หน้านี้"}
                action={hasFilters ? <PublicButton href="/restaurants" variant="secondary">ล้างตัวกรอง</PublicButton> : undefined}
              />
            </div>
          ) : (
            <>
              <RestaurantDirectoryClient items={restaurantPage.items} />
              <PublicPagination
                page={restaurantPage.page}
                pageCount={restaurantPage.pageCount}
                createHref={(nextPage) => restaurantHref({
                  query,
                  categorySlug,
                  foodType: legacyFoodType,
                  province,
                  page: nextPage,
                })}
              />
            </>
          )}
        </section>

        {/* 4. Food Route Planning Bottom Callout Banner */}
        <RestaurantDiscoveryCta
          title={
            !ctaSettings.title || ctaSettings.title.includes("เจ้าของ") || ctaSettings.title.includes("เพิ่มข้อมูล")
              ? "วางแผนมื้ออร่อยของคุณ"
              : launchSafeAttractionsCopy(ctaSettings.title, "วางแผนมื้ออร่อยของคุณ")
          }
          subtitle={
            !ctaSettings.subtitle || ctaSettings.subtitle.includes("เจ้าของ") || ctaSettings.subtitle.includes("ตรวจสอบ")
              ? "สร้างเส้นทางกินเที่ยวในจังหวัดยะลาในแบบของคุณ เลือกมื้ออร่อย จัดเส้นทาง และแพลนทริปได้ง่าย ๆ"
              : launchSafeAttractionsCopy(ctaSettings.subtitle, "สร้างเส้นทางกินเที่ยวในจังหวัดยะลาในแบบของคุณ เลือกมื้ออร่อย จัดเส้นทาง และแพลนทริปได้ง่าย ๆ")
          }
          linkText={
            !ctaSettings.linkText || ctaSettings.linkText.includes("ติดต่อ") || ctaSettings.linkText.includes("ลงทะเบียน")
              ? "เริ่มวางแผนมื้ออร่อย"
              : launchSafeAttractionsCopy(ctaSettings.linkText, "เริ่มวางแผนมื้ออร่อย")
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
