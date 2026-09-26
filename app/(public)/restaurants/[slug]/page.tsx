import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AttractionReviews } from "@/components/attractions/attraction-reviews";
import {
  HospitalityDetailHero,
  HospitalityInfoPanel,
  HospitalityRelatedAttractions,
} from "@/components/hospitality/HospitalityDetail";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicCtaBand } from "@/components/public/PublicCtaBand";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { HospitalityGallery, HospitalityRichContent } from "@/components/hospitality/HospitalityRichContent";
import { plainTextFromLegacyHtml } from "@/lib/content/plain-text";
import { ReviewSubmissionForm } from "@/components/reviews/ReviewSubmissionForm";
import { getPublicRestaurantDetail } from "@/lib/repositories/public-content.repository";
import { getPublicRestaurantReviews } from "@/lib/repositories/public-review.repository";

export const revalidate = 60;

const getRestaurant = cache((slug: string) => getPublicRestaurantDetail(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);
  if (!restaurant) return { title: "ไม่พบร้านอาหาร" };

  return {
    title: `${restaurant.name} | ร้านอาหารในยะลา`,
    description: restaurant.description ? plainTextFromLegacyHtml(restaurant.description).slice(0, 160)
      : `ข้อมูลร้านอาหาร ${restaurant.name} ในจังหวัดยะลา`,
    alternates: { canonical: `/restaurants/${restaurant.slug}` },
  };
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);
  if (!restaurant) notFound();

  const reviews = await getPublicRestaurantReviews(restaurant.restaurantId);

  return (
    <main className="hospitality-detail min-h-screen">
      <PublicPageFrame variant="detail" className="pb-16 pt-5 sm:pt-8">
        <nav aria-label="เส้นทางนำทาง" className="flex flex-wrap items-center gap-2 text-sm text-[#5f6668]">
          <Link href="/" className="hover:text-[#9b4e38]">หน้าแรก</Link>
          <span aria-hidden="true">/</span>
          <Link href="/restaurants" className="hover:text-[#9b4e38]">ร้านอาหาร</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-[#263036]">{restaurant.name}</span>
        </nav>

        <HospitalityDetailHero
          name={restaurant.name}
          province={restaurant.province}
          category={restaurant.foodType}
          imageUrl={restaurant.imageUrl}
          imageAlt={restaurant.imageAlt}
        />

        <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-12">
          <div className="min-w-0 space-y-12 lg:space-y-16">
            <section aria-labelledby="restaurant-about-heading">
              <h2 id="restaurant-about-heading" className="hospitality-section-title text-2xl font-bold">เกี่ยวกับร้านอาหาร</h2>
              {restaurant.description ? (
                <HospitalityRichContent content={restaurant.description} />
              ) : (
                <p className="mt-4 text-sm leading-6 text-[#5f6668]">ผู้ดูแลยังไม่ได้เพิ่มรายละเอียดร้านอาหาร</p>
              )}
            </section>

            <HospitalityGallery images={restaurant.gallery} />

            <HospitalityRelatedAttractions items={restaurant.nearbyAttractions} />

            <AttractionReviews
              state={reviews.state}
              stats={reviews.stats}
              reviews={reviews.items}
              title="รีวิวร้านอาหาร"
            >
              <ReviewSubmissionForm restaurantId={restaurant.restaurantId} />
            </AttractionReviews>
          </div>

          <aside className="lg:sticky lg:top-24">
            <HospitalityInfoPanel
              kind="restaurant"
              category={restaurant.foodType}
              address={restaurant.addressText}
              openingHours={restaurant.openingHours}
              priceRange={null}
              contactInfo={restaurant.contactInfo}
              latitude={restaurant.latitude}
              longitude={restaurant.longitude}
            />
          </aside>
        </div>

        <PublicCtaBand
          title="วางแผนจุดแวะถัดไป"
          description="ดูสถานที่ท่องเที่ยวที่เผยแพร่แล้วในจังหวัดยะลา และเลือกจุดหมายที่เหมาะกับทริปของคุณ"
          linkText="ดูสถานที่ท่องเที่ยว"
          linkUrl="/attractions"
        />
      </PublicPageFrame>
      <SiteFooter />
    </main>
  );
}
