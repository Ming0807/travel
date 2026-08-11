import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowSquareOut, CalendarBlank, MapPin, MapTrifold } from "@phosphor-icons/react/dist/ssr";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { PublicRouteTimeline } from "@/components/routes/PublicRouteTimeline";
import { getPublicRouteDetail } from "@/lib/repositories/public-content.repository";

export const revalidate = 60;

const getRoute = cache((slug: string) => getPublicRouteDetail(slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRoute(slug);
  if (!route) return { title: "ไม่พบเส้นทางท่องเที่ยว" };

  return {
    title: route.name,
    description: route.description || `แผนการเดินทาง ${route.name} ในจังหวัดยะลา`,
    alternates: { canonical: `/routes/${route.slug}` },
  };
}

export default async function RouteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const route = await getRoute(slug);
  if (!route) notFound();

  const paragraphs = route.fullDescription
    .split(/\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[var(--public-canvas)] text-[var(--public-ink)]">
      <PublicPageFrame variant="detail" className="pb-16 pt-8 sm:pt-10">
        <nav aria-label="เส้นทางนำทาง" className="flex flex-wrap items-center gap-2 text-sm text-black/65">
          <Link href="/" className="hover:text-[var(--public-teal)]">หน้าแรก</Link>
          <span aria-hidden="true">/</span>
          <Link href="/routes" className="hover:text-[var(--public-teal)]">เส้นทางแนะนำ</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="line-clamp-1 font-semibold text-[var(--public-ink)]">{route.name}</span>
        </nav>

        <header className="mt-7">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--public-coral-strong)]">
            <MapTrifold size={19} weight="fill" aria-hidden="true" />
            แผนการเดินทางแนะนำ
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-5xl">
            {route.name}
          </h1>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-black/65">
            <span className="inline-flex items-center gap-1.5">
              <CalendarBlank size={18} weight="bold" aria-hidden="true" />
              {route.days.toLocaleString("th-TH")} วัน
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={18} weight="fill" aria-hidden="true" />
              {route.stopCount.toLocaleString("th-TH")} จุดแวะ
            </span>
          </div>
          <div className="mt-7">
            <PublicMediaFrame
              src={route.imageUrl}
              alt={route.imageAlt}
              aspect="detail"
              sizes="(max-width: 1023px) calc(100vw - 2rem), 1152px"
              priority
              fallbackLabel="ยังไม่มีภาพปกเส้นทาง"
            />
          </div>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
          <div>
            {paragraphs.length > 0 ? (
              <section aria-labelledby="route-overview-heading" className="border-b border-black/10 pb-8">
                <h2 id="route-overview-heading" className="text-2xl font-bold">ภาพรวมเส้นทาง</h2>
                <div className="mt-4 max-w-[70ch] space-y-4 text-base leading-7 text-black/70">
                  {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            ) : null}

            <section aria-labelledby="route-timeline-heading" className="mt-9">
              <h2 id="route-timeline-heading" className="text-2xl font-bold">ลำดับการเดินทาง</h2>
              <p className="mt-2 max-w-[65ch] text-sm leading-6 text-black/65">
                เปิดแต่ละจุดเพื่อดูข้อมูล เวลาเปิด และรายละเอียดที่ทีมงานเผยแพร่ล่าสุด
              </p>
              <div className="mt-6">
                <PublicRouteTimeline stops={route.stops} />
              </div>
            </section>
          </div>

          <aside className="border-y border-black/10 py-6 lg:sticky lg:top-24 lg:border lg:bg-white lg:p-6">
            <h2 className="text-lg font-bold">ใช้เส้นทางนี้</h2>
            <p className="mt-2 text-sm leading-6 text-black/65">
              แผนที่จะแสดงเฉพาะเมื่อทุกจุดแวะมีพิกัดครบ เพื่อไม่สร้างเส้นทางที่คลาดเคลื่อน
            </p>
            {route.mapUrl ? (
              <PublicButton
                href={route.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 w-full gap-2"
              >
                เปิดเส้นทางใน Google Maps
                <ArrowSquareOut size={17} weight="bold" aria-hidden="true" />
              </PublicButton>
            ) : (
              <p className="mt-5 border border-black/10 bg-black/[0.03] p-4 text-sm font-semibold leading-6 text-black/65">
                ยังไม่มีพิกัดครบทุกจุด โปรดเปิดข้อมูลของแต่ละสถานที่เพื่อดูแผนที่เฉพาะจุด
              </p>
            )}
          </aside>
        </div>
      </PublicPageFrame>
      <SiteFooter />
    </div>
  );
}
