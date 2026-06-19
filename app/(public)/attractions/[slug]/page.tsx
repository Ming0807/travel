import { AttractionHeader } from "@/components/attractions/attraction-header";
import { AttractionGallery } from "@/components/attractions/attraction-gallery";
import { AttractionTabs } from "@/components/attractions/attraction-tabs";
import { AttractionInfoSidebar } from "@/components/attractions/attraction-info-sidebar";
import { AttractionCardsRow } from "@/components/attractions/attraction-cards-row";
import { AttractionTips } from "@/components/attractions/attraction-tips";
import { AttractionReviews } from "@/components/attractions/attraction-reviews";
import { AttractionCTA } from "@/components/attractions/attraction-cta";
import { getPublicAttractionDetail } from "@/lib/repositories/public-content.repository";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { notFound } from "next/navigation";
import {
  getReviewStatsByAttraction,
  listPublicReviewsByAttraction,
} from "@/lib/repositories/admin-review.repository";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ReviewSubmissionForm } from "@/components/reviews/ReviewSubmissionForm";
import { VISTA_360_EXTERNAL_URL } from "@/constants/product";
import { buildAttractionSectionNavigation, getAttractionSectionLabel } from "@/lib/content/attraction-sections";
import { Compass, MapPinLine } from "@phosphor-icons/react/dist/ssr";

export const dynamic = "force-dynamic";

export default async function AttractionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPublicAttractionDetail(slug);

  if (!data) {
    notFound();
  }

  // Fetch real reviews from the database
  const client = await createSupabaseServerClient();
  const { data: attractionRow } = await client
    .from("attractions")
    .select("attraction_id")
    .eq("slug", slug)
    .maybeSingle();

  const attractionId = attractionRow?.attraction_id ? Number(attractionRow.attraction_id) : undefined;
  const reviewStats = attractionId ? await getReviewStatsByAttraction(attractionId) : null;
  const publicReviews = attractionId ? await listPublicReviewsByAttraction(attractionId) : [];
  const displayRating = reviewStats && reviewStats.totalReviews > 0 ? reviewStats.averageRating : data.rating;
  const displayReviewsCount = reviewStats && reviewStats.totalReviews > 0 ? String(reviewStats.totalReviews) : data.reviewsCount;
  const locale = "th";
  const sections = buildAttractionSectionNavigation(data, { locale, includeReviews: true });
  const sectionLabel = (key: Parameters<typeof getAttractionSectionLabel>[0]) =>
    getAttractionSectionLabel(key, locale);
  const hasCoordinates = data.latitude !== null && data.longitude !== null;
  const mapsUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${data.latitude},${data.longitude}`
    : null;

  return (
    <main className="bg-white min-h-screen pb-24 lg:pb-12">
      {/*
        We don't use PageShell here because the layout is edge-to-edge for the gallery
        on mobile, and has specific max-width constraints matching the design.
      */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 lg:pt-10">

        <AttractionHeader
          name={data.name}
          province={data.province}
          rating={displayRating}
          reviewsCount={displayReviewsCount}
          bestTimeToVisit={data.bestTimeToVisit}
        />

        <AttractionGallery
          mainImage={data.mainImage}
          gallery={data.gallery}
        />

        {/* Main Content Area - Grid Layout */}
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">

          {/* Left Column (Main Content) */}
          <div className="min-w-0">
            <AttractionTabs sections={sections} mobileLabel="เลือกส่วนของหน้า" />

            {/* Sections */}
            <div className="flex flex-col gap-12">
              {/* Overview */}
              <section id="overview" className="scroll-mt-28">
                <h2 className="mb-4 text-2xl font-bold text-ink">{sectionLabel("overview")}</h2>
                <p className="text-base leading-relaxed text-muted">
                  {data.description || "ยังไม่ได้เพิ่มคำอธิบายสำหรับสถานที่นี้"}
                </p>
              </section>

              {/* Things to Do */}
              {data.thingsToDo.length > 0 && (
                <AttractionCardsRow
                  id="things-to-do"
                  title={sectionLabel("things_to_do")}
                  items={data.thingsToDo}
                  viewAllText="ดูกิจกรรมทั้งหมด"
                  linkPrefix="/attractions"
                />
              )}

              {/* Where to Stay - Hidden until module is ready */}
              {data.whereToStay.length > 0 && (
                <AttractionCardsRow
                  id="where-to-stay"
                  title={sectionLabel("where_to_stay")}
                  items={data.whereToStay}
                  viewAllText="ดูที่พักทั้งหมด"
                  linkPrefix="/accommodations"
                />
              )}

              {/* Food & Drink */}
              {data.foodAndDrink.length > 0 && (
                <AttractionCardsRow
                  id="food"
                  title={sectionLabel("food_drink")}
                  items={data.foodAndDrink}
                  viewAllText="ดูร้านอาหารทั้งหมด"
                  linkPrefix="/restaurants"
                />
              )}

              {/* Tips */}
              {data.travelTips.length > 0 && <AttractionTips tips={data.travelTips} title={sectionLabel("travel_tips")} />}

              {/* How to Get There */}
              <section id="how-to-get-there" className="scroll-mt-28 pt-8">
                <h2 className="mb-4 text-2xl font-bold text-ink">{sectionLabel("how_to_get_there")}</h2>
                <p className="mb-6 text-sm leading-relaxed text-muted whitespace-pre-wrap">
                  {data.howToGetThere || "ยังไม่ได้เพิ่มรายละเอียดการเดินทาง"}
                </p>
                {hasCoordinates ? (
                  <div className="rounded-2xl border border-ink/10 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-coral text-white">
                          <MapPinLine size={22} weight="bold" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-ink">พิกัดสถานที่</p>
                          <p className="mt-1 text-sm leading-6 text-muted">
                            {data.addressText || `${data.latitude!.toFixed(5)}, ${data.longitude!.toFixed(5)}`}
                          </p>
                          <p className="mt-1 font-mono text-xs text-muted">
                            {data.latitude!.toFixed(5)}, {data.longitude!.toFixed(5)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={mapsUrl ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 py-2 text-sm font-bold text-white transition hover:bg-coral"
                      >
                        เปิดแผนที่
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
                    <div className="flex items-start gap-3">
                      <MapPinLine className="mt-0.5 shrink-0 text-amber-700" size={22} weight="duotone" />
                      <div>
                        <p className="text-sm font-black">ยังไม่ได้เพิ่มพิกัด</p>
                        <p className="mt-1 text-sm leading-6">
                          หน้านี้จะแสดงแผนที่จริงได้หลังจากแอดมินเพิ่ม latitude และ longitude ใน CMS
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Reviews */}
              <AttractionReviews
                rating={displayRating}
                reviewsCount={displayReviewsCount}
                stats={reviewStats ?? undefined}
                reviews={publicReviews.length > 0 ? publicReviews : undefined}
                title={sectionLabel("reviews")}
              >
                <div className="mt-8">
                  <ReviewSubmissionForm attractionId={attractionId ?? undefined} />
                </div>
              </AttractionReviews>

              {/* Articles (Re-using Cards Row) */}
              {data.articles && data.articles.length > 0 && (
                <AttractionCardsRow
                  id="articles"
                  title={sectionLabel("articles")}
                  items={data.articles}
                  viewAllText="ดูบทความทั้งหมด"
                  linkPrefix="/stories"
                />
              )}
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <AttractionInfoSidebar info={data.info} />

              {/* 360 Vista — แสดงเฉพาะสถานที่ในยะลา */}
              {data.province === "ยะลา" || data.province === "Yala" ? (
                <div className="mt-6 rounded-2xl border border-ink/5 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <Compass size={16} weight="fill" />
                    </div>
                    <h3 className="font-bold text-sm text-ink">360° Virtual Tour</h3>
                  </div>
                  <p className="text-xs text-muted mb-4 leading-relaxed">
                    ชมบรรยากาศสถานที่ท่องเที่ยวในจังหวัดยะลาแบบ 360 องศา เสมือนจริง
                  </p>
                  <a
                    href={VISTA_360_EXTERNAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    <Compass size={14} weight="fill" />
                    ดู 360° Virtual Tour
                  </a>
                  <p className="mt-2 text-[10px] text-muted text-center">
                    ระบบภายนอกโดย 360 Vista
                  </p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>

        {/* Call to Action */}
        <AttractionCTA name={data.name} />
      </div>

      <SiteFooter />
    </main>
  );
}
