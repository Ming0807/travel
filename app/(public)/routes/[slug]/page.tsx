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
import { RouteStopsMap } from "@/components/routes/RouteStopsMap";
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
    <div className="min-h-screen bg-[#fffdfa] text-[#263036]">
      <PublicPageFrame variant="detail" className="pb-16 pt-7 sm:pt-9">
        <nav aria-label="เส้นทางนำทาง" className="flex flex-wrap items-center gap-2 text-sm text-[#687076]">
          <Link href="/" className="hover:text-[#9b4e38]">หน้าแรก</Link>
          <span aria-hidden="true">/</span>
          <Link href="/routes" className="hover:text-[#9b4e38]">เส้นทางแนะนำ</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="line-clamp-1 font-semibold text-[#263036]">{route.name}</span>
        </nav>

        <header className="mt-8">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9b4e38]">
            <MapTrifold size={19} weight="fill" aria-hidden="true" />
            แผนการเดินทางแนะนำ
          </p>
          <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-tight text-balance sm:text-4xl lg:text-5xl">
            {route.name}
          </h1>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-[#5f6668]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarBlank size={18} weight="bold" aria-hidden="true" />
              {route.days.toLocaleString("th-TH")} วัน
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={18} weight="fill" aria-hidden="true" />
              {route.stopCount.toLocaleString("th-TH")} จุดแวะ
            </span>
          </div>
          <div className="mt-7 overflow-hidden rounded-md">
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

        <div className="mt-11 grid gap-10 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
          <div>
            {paragraphs.length > 0 ? (
              <section aria-labelledby="route-overview-heading" className="border-b border-[#e6e2dc] pb-8">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9b4e38]">THE JOURNEY</p>
                <h2 id="route-overview-heading" className="mt-2 text-2xl font-bold">ภาพรวมเส้นทาง</h2>
                <div className="mt-4 max-w-[70ch] space-y-4 text-base leading-7 text-[#5f6668]">
                  {paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
                </div>
              </section>
            ) : null}

            <section aria-labelledby="route-timeline-heading" className="mt-9 scroll-mt-24">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9b4e38]">YOUR ITINERARY</p>
              <h2 id="route-timeline-heading" className="mt-2 text-2xl font-bold">ลำดับการเดินทาง</h2>
              <p className="mt-2 max-w-[65ch] text-sm leading-6 text-[#5f6668]">
                ทีมงานจัดลำดับจุดแวะไว้ให้แล้ว เปิดแต่ละสถานที่เพื่อดูข้อมูลล่าสุดก่อนออกเดินทาง
              </p>
              <div className="mt-6">
                <PublicRouteTimeline stops={route.stops} />
              </div>
            </section>

            <RouteStopsMap stops={route.stops} />
          </div>

          <aside className="border-y border-[#e6e2dc] py-6 lg:sticky lg:top-24 lg:border-l lg:border-y-0 lg:pl-6">
            <h2 className="text-lg font-bold">ออกเดินทางตามเส้นทาง</h2>
            <p className="mt-2 text-sm leading-6 text-[#5f6668]">
              เลือกดูจุดแวะก่อน แล้วเปิดนำทางเมื่อพร้อมเดินทางจริง
            </p>
            <a href="#route-timeline-heading" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#783823] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9b4e38]">
              ดูลำดับจุดแวะ
            </a>
            {route.mapUrl ? (
              <PublicButton
                href={route.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full gap-2"
              >
                เปิดเส้นทางใน Google Maps
                <ArrowSquareOut size={17} weight="bold" aria-hidden="true" />
              </PublicButton>
            ) : route.mapSegments.length > 1 ? (
              <div className="mt-4">
                <p className="text-sm font-semibold text-[#5f6668]">
                  เส้นทางมีหลายจุดแวะ เปิดนำทางทีละช่วงเพื่อไม่ให้จุดใดหายไปบนมือถือ
                </p>
                <ol className="mt-3 space-y-2">
                  {route.mapSegments.map((segment, index) => (
                    <li key={`${segment.startIndex}-${segment.endIndex}`}>
                      <a
                        href={segment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 w-full items-center justify-between gap-2 rounded border border-[#d8c9be] bg-white px-3 text-sm font-bold text-[#783823] hover:bg-[#f8efe9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#9b4e38]"
                      >
                        <span>ช่วงที่ {(index + 1).toLocaleString("th-TH")} · จุด {(segment.startIndex + 1).toLocaleString("th-TH")}–{(segment.endIndex + 1).toLocaleString("th-TH")}</span>
                        <ArrowSquareOut size={17} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <p className="mt-5 border-l-2 border-[#9b4e38] pl-3 text-sm font-semibold leading-6 text-[#5f6668]">
                พิกัดยังไม่ครบทุกจุด เปิดข้อมูลสถานที่แต่ละแห่งเพื่อดูตำแหน่งก่อนเดินทาง
              </p>
            )}
          </aside>
        </div>
      </PublicPageFrame>
      <SiteFooter />
    </div>
  );
}
