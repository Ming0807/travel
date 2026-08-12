import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicCtaBand } from "@/components/public/PublicCtaBand";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicPagination } from "@/components/public/PublicPagination";
import { PublicEmptyState, PublicErrorState } from "@/components/public/PublicStates";
import { PublicDirectoryIntro } from "@/components/public/directory/PublicDirectoryIntro";
import { PublicDirectoryToolbar } from "@/components/public/directory/PublicDirectoryToolbar";
import { RestaurantFilterBar } from "@/components/restaurants/RestaurantFilterBar";
import { RestaurantCategoryNav } from "@/components/restaurants/RestaurantCategoryNav";
import { RestaurantDirectoryItem } from "@/components/restaurants/RestaurantDirectoryItem";
import { RestaurantCategoryRail } from "@/components/restaurants/RestaurantCategoryRail";
import { launchSafeAttractionsCopy } from "@/lib/attractions/discovery-copy";
import { groupRestaurantsForDirectory } from "@/lib/hospitality/restaurant-directory";
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
    "ค้นหาร้านอาหารท้องถิ่นและเลือกมื้อที่เหมาะกับแผนเดินทางของคุณ",
  );
  const hasFilters = Boolean(query || categorySlug || legacyFoodType || province);
  const restaurantGroups = groupRestaurantsForDirectory(restaurantPage.items);
  const categoryOptions = categoryAvailability.items.map((category) => ({ value: category.slug, label: category.name }));
  const categoryNavItems = [
    { value: "", label: "ทั้งหมด", href: restaurantHref({ query, province }) },
    ...categoryAvailability.items.filter((category) => category.isFeatured).map((category) => ({
      value: category.slug,
      label: category.name,
      href: restaurantHref({ query, categorySlug: category.slug, province }),
    })),
  ];
  const sidebarCategoryItems = [
    { value: "", label: "ร้านอาหารทั้งหมด" },
    ...categoryOptions,
  ].map((option) => ({
    ...option,
    href: restaurantHref({ query, categorySlug: option.value || undefined, province }),
  }));
  const hasSidebarCategories = sidebarCategoryItems.length > 1;

  return (
    <div className="min-h-screen bg-[var(--public-canvas)] text-[var(--public-ink)]">
      <PublicPageFrame variant="directory">
        <PublicDirectoryIntro
          breadcrumbs={[{ label: "หน้าแรก", href: "/" }, { label: "ร้านอาหาร" }]}
          title={title}
          description={description}
          scope="ขอบเขตข้อมูลปัจจุบัน: จังหวัดยะลา"
        />

        {categoryNavItems.length > 1 ? (
          <div className="mt-7">
            <RestaurantCategoryNav activeValue={categorySlug} items={categoryNavItems} />
          </div>
        ) : null}

        <div className="mt-5">
          <PublicDirectoryToolbar label="ค้นหาและกรองร้านอาหาร">
            <RestaurantFilterBar
              query={query}
              categorySlug={categorySlug}
              foodType={legacyFoodType}
              province={province}
              provinces={provinceOptions}
              categories={legacyFoodType ? undefined : categoryOptions}
            />
          </PublicDirectoryToolbar>
        </div>

        <section aria-labelledby="restaurant-results-heading" className="mt-8">
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
                action={<PublicButton href={restaurantHref({ query, categorySlug, foodType: legacyFoodType, province })} variant="secondary">ลองโหลดอีกครั้ง</PublicButton>}
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
              <div className={hasSidebarCategories
                ? "mt-6 xl:grid xl:grid-cols-[13rem_minmax(0,1fr)] xl:gap-8"
                : "mt-6"
              }>
                {hasSidebarCategories ? <aside aria-label="หมวดหมู่ร้านอาหาร" className="hidden xl:block">
                  <RestaurantCategoryRail items={sidebarCategoryItems} activeValue={categorySlug} />
                </aside> : null}
                <div className="min-w-0">
                  {restaurantGroups.map((group, groupIndex) => (
                    <section
                      key={group.key}
                      aria-labelledby={`restaurant-group-${group.key}`}
                      className="border-b border-black/10 py-6 first:pt-0 last:border-b-0"
                    >
                      <div className="mb-2">
                        <h3 id={`restaurant-group-${group.key}`} className="text-lg font-bold text-[var(--public-teal)]">
                          {group.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-black/55">{group.description}</p>
                      </div>
                      <div className="grid min-w-0 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
                        {group.items.map((restaurant, itemIndex) => (
                          <RestaurantDirectoryItem
                            key={restaurant.slug}
                            restaurant={restaurant}
                            priority={groupIndex === 0 && itemIndex === 0}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                  <PublicPagination
                    page={restaurantPage.page}
                    pageCount={restaurantPage.pageCount}
                    createHref={(nextPage) => restaurantHref({ query, categorySlug, foodType: legacyFoodType, province, page: nextPage })}
                  />
                </div>
              </div>
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
