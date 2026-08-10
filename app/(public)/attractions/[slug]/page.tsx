import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { Compass, MapPinLine } from "@phosphor-icons/react/dist/ssr";
import { AttractionCardsRow } from "@/components/attractions/attraction-cards-row";
import { AttractionCTA } from "@/components/attractions/attraction-cta";
import { AttractionGallery } from "@/components/attractions/attraction-gallery";
import { AttractionHeader } from "@/components/attractions/attraction-header";
import { AttractionInfoSidebar } from "@/components/attractions/attraction-info-sidebar";
import { AttractionReviews } from "@/components/attractions/attraction-reviews";
import { AttractionTabs } from "@/components/attractions/attraction-tabs";
import { AttractionTips } from "@/components/attractions/attraction-tips";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { ReviewSubmissionForm } from "@/components/reviews/ReviewSubmissionForm";
import { buildAttractionSectionNavigation, getAttractionSectionLabel } from "@/lib/content/attraction-sections";
import { getPublicAttractionDetail } from "@/lib/repositories/public-content.repository";
import { getPublicAttractionReviews } from "@/lib/repositories/public-review.repository";

export const revalidate = 60;

const loadAttraction = cache(getPublicAttractionDetail);

type AttractionDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: AttractionDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const attraction = await loadAttraction(slug);
  if (!attraction) return { title: "ไม่พบสถานที่ท่องเที่ยว" };

  const description = attraction.description || `ข้อมูลการเดินทางและรีวิวของ ${attraction.name} จังหวัด${attraction.province}`;
  return {
    title: attraction.name,
    description: description.slice(0, 160),
    alternates: { canonical: `/attractions/${attraction.slug}` },
    openGraph: {
      title: attraction.name,
      description: description.slice(0, 160),
      type: "article",
      images: attraction.mainImage ? [{ url: attraction.mainImage.url, alt: attraction.mainImage.alt || attraction.name }] : undefined,
    },
  };
}

export default async function AttractionDetailPage({ params }: AttractionDetailPageProps) {
  const { slug } = await params;
  const data = await loadAttraction(slug);
  if (!data) notFound();

  const reviewBundle = await getPublicAttractionReviews(data.attractionId);
  const sections = buildAttractionSectionNavigation(data, {
    locale: "th",
    includeReviews: true,
    includeMissingRequired: false,
  });
  const sectionLabel = (key: Parameters<typeof getAttractionSectionLabel>[0]) =>
    getAttractionSectionLabel(key, "th");
  const hasCoordinates = data.latitude !== null && data.longitude !== null;
  const mapsUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
    : null;

  return (
    <>
      <PublicPageFrame variant="detail" className="py-6 sm:py-10">
        <AttractionHeader
          name={data.name}
          province={data.province}
          attractionType={data.attractionType}
          reviewState={reviewBundle.state}
          rating={reviewBundle.stats?.averageRating ?? null}
          reviewCount={reviewBundle.stats?.totalReviews ?? null}
        />

        <AttractionGallery
          mainImage={data.mainImage}
          gallery={data.gallery}
          attractionName={data.name}
        />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div className="order-2 min-w-0 lg:order-1">
            <AttractionTabs sections={sections} mobileLabel="ไปยังส่วนของหน้านี้" />

            <div className="space-y-14">
              {data.description ? (
                <section id="overview" className="scroll-mt-36">
                  <h2 className="text-2xl font-bold text-[var(--public-ink)]">{sectionLabel("overview")}</h2>
                  <p className="mt-4 max-w-[72ch] whitespace-pre-wrap text-base leading-8 text-slate-700">
                    {data.description}
                  </p>
                </section>
              ) : null}

              {data.thingsToDo.length > 0 ? (
                <AttractionCardsRow
                  id="things-to-do"
                  title={sectionLabel("things_to_do")}
                  items={data.thingsToDo}
                  viewAllText="ดูสถานที่ทั้งหมด"
                  linkPrefix="/attractions"
                />
              ) : null}

              {data.whereToStay.length > 0 ? (
                <AttractionCardsRow
                  id="where-to-stay"
                  title={sectionLabel("where_to_stay")}
                  items={data.whereToStay}
                  viewAllText="ดูที่พักทั้งหมด"
                  linkPrefix="/accommodations"
                />
              ) : null}

              {data.foodAndDrink.length > 0 ? (
                <AttractionCardsRow
                  id="food"
                  title={sectionLabel("food_drink")}
                  items={data.foodAndDrink}
                  viewAllText="ดูร้านอาหารทั้งหมด"
                  linkPrefix="/restaurants"
                />
              ) : null}

              {data.travelTips.length > 0 ? (
                <AttractionTips tips={data.travelTips} title={sectionLabel("travel_tips")} />
              ) : null}

              {data.howToGetThere ? (
                <section id="how-to-get-there" className="scroll-mt-36">
                  <h2 className="text-2xl font-bold text-[var(--public-ink)]">{sectionLabel("how_to_get_there")}</h2>
                  <p className="mt-4 max-w-[72ch] whitespace-pre-wrap text-base leading-8 text-slate-700">
                    {data.howToGetThere}
                  </p>
                  <div className="mt-5 border border-slate-200 bg-white p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <MapPinLine aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--public-coral)]" size={24} weight="fill" />
                        <div>
                          <p className="font-semibold text-[var(--public-ink)]">ตำแหน่งสถานที่</p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {data.addressText || (hasCoordinates ? `${data.latitude}, ${data.longitude}` : "ยังไม่มีพิกัดสำหรับเปิดแผนที่")}
                          </p>
                        </div>
                      </div>
                      {mapsUrl ? (
                        <PublicButton href={mapsUrl} target="_blank" rel="noopener noreferrer" variant="secondary">
                          เปิดใน Google Maps
                        </PublicButton>
                      ) : null}
                    </div>
                  </div>
                </section>
              ) : null}

              <AttractionReviews
                state={reviewBundle.state}
                stats={reviewBundle.stats}
                reviews={reviewBundle.items}
                title={sectionLabel("reviews")}
              >
                <div className="mt-8">
                  <ReviewSubmissionForm attractionId={data.attractionId} />
                </div>
              </AttractionReviews>

              {data.articles.length > 0 ? (
                <AttractionCardsRow
                  id="articles"
                  title={sectionLabel("articles")}
                  items={data.articles}
                  viewAllText="ดูเรื่องราวทั้งหมด"
                  linkPrefix="/stories"
                />
              ) : null}
            </div>
          </div>

          <aside className="order-1 space-y-4 lg:order-2 lg:sticky lg:top-24">
            <AttractionInfoSidebar
              province={data.province}
              attractionType={data.attractionType}
              address={data.addressText}
              openingHours={data.openingHours}
              contactInfo={data.contactInfo}
            />
            {data.virtualTour ? (
              <section className="border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2">
                  <Compass aria-hidden="true" size={22} weight="fill" className="text-[var(--public-teal)]" />
                  <h2 className="font-bold text-[var(--public-ink)]">ชมมุมมอง 360°</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  เปิดสื่อพาโนรามาหรือทัวร์เสมือนจริงที่แอดมินเผยแพร่สำหรับสถานที่นี้
                </p>
                <PublicButton
                  href={data.virtualTour.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  className="mt-4 w-full"
                >
                  เปิดมุมมอง 360°
                </PublicButton>
              </section>
            ) : null}
          </aside>
        </div>

        <AttractionCTA name={data.name} />
      </PublicPageFrame>

      <SiteFooter />
    </>
  );
}
