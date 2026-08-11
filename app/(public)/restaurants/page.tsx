import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ForkKnife, MapPin } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { RestaurantDiscoveryCard } from "@/components/hospitality/HospitalityDiscoveryCard";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicCtaBand } from "@/components/public/PublicCtaBand";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicPagination } from "@/components/public/PublicPagination";
import { PublicEmptyState, PublicErrorState } from "@/components/public/PublicStates";
import {
  RESTAURANT_FOOD_TYPES,
  RestaurantFilterBar,
} from "@/components/restaurants/RestaurantFilterBar";
import { launchSafeAttractionsCopy } from "@/lib/attractions/discovery-copy";
import {
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
  foodType,
  province,
  page,
}: {
  query?: string;
  foodType?: string;
  province?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (foodType) params.set("foodType", foodType);
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
  const requestedFoodType = getParam(params, "foodType");
  const requestedProvince = getParam(params, "province");
  const requestedPage = getParam(params, "page");
  const page = parsePage(requestedPage);

  const foodType = RESTAURANT_FOOD_TYPES.some((option) => option.value === requestedFoodType)
    ? requestedFoodType
    : undefined;

  if (
    (requestedFoodType && !foodType)
    || (requestedPage !== undefined && requestedPage !== String(page))
  ) {
    redirect(restaurantHref({ query, province: requestedProvince }));
  }

  const settingsService = new SettingsService();
  const [restaurantPage, heroSettings, ctaSettings, liveProvinces] = await Promise.all([
    listPublicRestaurantPage({
      query,
      foodType,
      province: requestedProvince,
      page,
      pageSize: 12,
    }),
    settingsService.getSetting("restaurants_page_hero", {
      title: "ร้านอาหารในจังหวัดยะลา",
      description: "ค้นหาร้านอาหารท้องถิ่นและเลือกมื้อที่เหมาะกับแผนเดินทางของคุณ",
    }),
    settingsService.getSetting("restaurants_page_cta", {
      title: "ต้องการเพิ่มข้อมูลร้านอาหาร?",
      subtitle: "ส่งข้อมูลให้ทีมงานตรวจสอบก่อนเผยแพร่บนแพลตฟอร์ม",
      linkText: "ติดต่อทีมงาน",
      linkUrl: "/contact",
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
    redirect(restaurantHref({ query, foodType }));
  }

  if (page > Math.max(restaurantPage.pageCount, 1)) {
    redirect(restaurantHref({
      query,
      foodType,
      province,
      page: restaurantPage.pageCount > 1 ? restaurantPage.pageCount : undefined,
    }));
  }

  const title = launchSafeAttractionsCopy(heroSettings.title, "ร้านอาหารในจังหวัดยะลา");
  const description = launchSafeAttractionsCopy(
    heroSettings.description,
    "ค้นหาร้านอาหารท้องถิ่นและเลือกมื้อที่เหมาะกับแผนเดินทางของคุณ",
  );
  const hasFilters = Boolean(query || foodType || province);

  return (
    <div className="min-h-screen bg-[var(--public-canvas)] text-[var(--public-ink)]">
      <PublicPageFrame variant="listing" className="pb-16 pt-8 sm:pt-10">
        <nav aria-label="เส้นทางนำทาง" className="flex items-center gap-2 text-sm text-black/65">
          <Link href="/" className="hover:text-[var(--public-teal)]">หน้าแรก</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-[var(--public-ink)]">ร้านอาหาร</span>
        </nav>

        <header className="mt-7 grid gap-5 border-b border-black/10 pb-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--public-coral-strong)]">
              <ForkKnife size={18} weight="fill" aria-hidden="true" />
              รสชาติและธุรกิจท้องถิ่น
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-[70ch] text-base leading-7 text-black/65 sm:text-lg">
              {description}
            </p>
          </div>
          <p className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--public-teal)]">
            <MapPin size={20} weight="fill" aria-hidden="true" />
            พื้นที่ให้บริการ: จังหวัดยะลา
          </p>
        </header>

        <section aria-labelledby="restaurant-filter-heading" className="mt-7">
          <h2 id="restaurant-filter-heading" className="mb-3 text-lg font-bold">ค้นหาและกรองร้านอาหาร</h2>
          <RestaurantFilterBar
            query={query}
            foodType={foodType}
            province={province}
            provinces={provinceOptions}
          />
        </section>

        <section aria-labelledby="restaurant-results-heading" className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-4">
            <div>
              <h2 id="restaurant-results-heading" className="text-2xl font-bold">ร้านอาหารที่ค้นพบ</h2>
              <p className="mt-1 text-sm leading-6 text-black/65" aria-live="polite">
                {restaurantPage.state === "unavailable"
                  ? "ยังไม่สามารถสรุปจำนวนร้านอาหารได้"
                  : `พบทั้งหมด ${restaurantPage.total.toLocaleString("th-TH")} ร้าน${hasFilters ? " ตามตัวกรองที่เลือก" : " ในจังหวัดยะลา"}`}
              </p>
            </div>
            {restaurantPage.pageCount > 1 ? (
              <p className="text-sm font-semibold text-black/65">
                หน้า {restaurantPage.page.toLocaleString("th-TH")} จาก {restaurantPage.pageCount.toLocaleString("th-TH")}
              </p>
            ) : null}
          </div>

          {restaurantPage.state === "unavailable" ? (
            <div className="mt-6">
              <PublicErrorState
                title="โหลดรายการร้านอาหารไม่ได้ในขณะนี้"
                description="กรุณาลองใหม่อีกครั้ง ระบบจะไม่แสดงว่าไม่มีร้านเมื่อฐานข้อมูลไม่พร้อม"
                action={<PublicButton href={restaurantHref({ query, foodType, province })} variant="secondary">ลองโหลดอีกครั้ง</PublicButton>}
              />
            </div>
          ) : restaurantPage.items.length === 0 ? (
            <div className="mt-6">
              <PublicEmptyState
                title={hasFilters ? "ไม่พบร้านอาหารที่ตรงกับตัวกรอง" : "ยังไม่มีร้านอาหารที่เผยแพร่"}
                description={hasFilters ? "ลองเปลี่ยนคำค้นหรือประเภทอาหาร" : "เมื่อทีมงานเผยแพร่ข้อมูล รายการจะปรากฏที่หน้านี้"}
                action={hasFilters ? <PublicButton href="/restaurants" variant="secondary">ล้างตัวกรอง</PublicButton> : undefined}
              />
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {restaurantPage.items.map((restaurant, index) => (
                  <RestaurantDiscoveryCard
                    key={restaurant.slug}
                    restaurant={restaurant}
                    priority={index === 0}
                  />
                ))}
              </div>
              <PublicPagination
                page={restaurantPage.page}
                pageCount={restaurantPage.pageCount}
                createHref={(nextPage) => restaurantHref({ query, foodType, province, page: nextPage })}
              />
            </>
          )}
        </section>

        <PublicCtaBand
          title={launchSafeAttractionsCopy(ctaSettings.title, "ต้องการเพิ่มข้อมูลร้านอาหาร?")}
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
