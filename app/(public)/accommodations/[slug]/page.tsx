import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  HospitalityDetailHero,
  HospitalityInfoPanel,
  HospitalityRelatedAttractions,
} from "@/components/hospitality/HospitalityDetail";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicCtaBand } from "@/components/public/PublicCtaBand";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { getPublicAccommodationDetail } from "@/lib/repositories/public-content.repository";

export const revalidate = 60;

const getAccommodation = cache((slug: string) => getPublicAccommodationDetail(slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const accommodation = await getAccommodation(slug);
  if (!accommodation) return { title: "ไม่พบที่พัก" };

  return {
    title: `${accommodation.name} | ที่พักในยะลา`,
    description: accommodation.description?.slice(0, 160)
      ?? `ข้อมูลที่พัก ${accommodation.name} ในจังหวัดยะลา`,
    alternates: { canonical: `/accommodations/${accommodation.slug}` },
  };
}

export default async function AccommodationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const accommodation = await getAccommodation(slug);
  if (!accommodation) notFound();

  return (
    <main className="min-h-screen bg-[var(--public-canvas)] text-[var(--public-ink)]">
      <PublicPageFrame variant="detail" className="pb-16 pt-8 sm:pt-10">
        <nav aria-label="เส้นทางนำทาง" className="flex flex-wrap items-center gap-2 text-sm text-black/65">
          <Link href="/" className="hover:text-[var(--public-teal)]">หน้าแรก</Link>
          <span aria-hidden="true">/</span>
          <Link href="/accommodations" className="hover:text-[var(--public-teal)]">ที่พัก</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="font-semibold text-[var(--public-ink)]">{accommodation.name}</span>
        </nav>

        <HospitalityDetailHero
          name={accommodation.name}
          province={accommodation.province}
          category={accommodation.accommodationType}
          imageUrl={accommodation.imageUrl}
          imageAlt={accommodation.imageAlt}
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="min-w-0 space-y-12">
            <section aria-labelledby="accommodation-about-heading">
              <h2 id="accommodation-about-heading" className="text-2xl font-bold">เกี่ยวกับที่พัก</h2>
              {accommodation.description ? (
                <p className="mt-4 max-w-[70ch] whitespace-pre-line text-base leading-8 text-black/70">
                  {accommodation.description}
                </p>
              ) : (
                <p className="mt-4 text-sm leading-6 text-black/65">ผู้ดูแลยังไม่ได้เพิ่มรายละเอียดที่พัก</p>
              )}
            </section>

            <HospitalityRelatedAttractions items={accommodation.nearbyAttractions} />
          </div>

          <aside className="lg:sticky lg:top-24">
            <HospitalityInfoPanel
              kind="accommodation"
              category={accommodation.accommodationType}
              address={accommodation.addressText}
              openingHours={null}
              priceRange={accommodation.priceRange}
              contactInfo={accommodation.contactInfo}
              latitude={accommodation.latitude}
              longitude={accommodation.longitude}
            />
          </aside>
        </div>

        <PublicCtaBand
          title="วางแผนการเดินทางต่อ"
          description="ค้นหาสถานที่ท่องเที่ยวที่เผยแพร่แล้วในจังหวัดยะลา เพื่อจัดลำดับจุดหมายก่อนออกเดินทาง"
          linkText="ดูสถานที่ท่องเที่ยว"
          linkUrl="/attractions"
        />
      </PublicPageFrame>
      <SiteFooter />
    </main>
  );
}
