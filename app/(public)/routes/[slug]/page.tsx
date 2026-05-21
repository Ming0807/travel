import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPublicRouteDetail } from "@/lib/repositories/public-content.repository";
import { MapPin, CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/SiteFooter";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const route = await getPublicRouteDetail(resolvedParams.slug);

  if (!route) {
    return { title: "Route Not Found" };
  }

  return {
    title: `${route.name} | Southern Border Tourism`,
    description: route.description,
  };
}

export default async function RouteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const route = await getPublicRouteDetail(resolvedParams.slug);

  if (!route) {
    notFound();
  }

  // Group stops by day
  const stopsByDay = route.stops.reduce((acc, stop) => {
    if (!acc[stop.dayNumber]) acc[stop.dayNumber] = [];
    acc[stop.dayNumber].push(stop);
    return acc;
  }, {} as Record<number, typeof route.stops>);

  const days = Object.keys(stopsByDay).map(Number).sort((a, b) => a - b);

  return (
    <>
      <SiteHeader appName="Southern Border Tourism" />
      <main className="min-h-screen bg-sand/30 pb-20 pt-24">
        {/* Hero Section */}
        <div className="relative h-[40vh] min-h-[300px] w-full bg-ink">
          <Image 
            src={route.imageUrl} 
            alt={route.name} 
            fill 
            className="object-cover opacity-70" 
            unoptimized 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
          
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6">
              <span className="inline-block rounded-full bg-leaf px-3 py-1 text-xs font-bold text-white mb-4">
                เส้นทางแนะนำ
              </span>
              <h1 className="text-3xl font-black text-white md:text-5xl">{route.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <CalendarBlank size={18} />
                  <span>{route.days} วัน</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <MapPin size={18} />
                  <span>{route.stops.length} สถานที่</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm md:p-10 mb-12">
            <h2 className="text-xl font-bold text-ink mb-4">ภาพรวมเส้นทาง</h2>
            <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-p:text-muted">
              {route.fullDescription.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="space-y-12">
            <h2 className="text-2xl font-black text-ink">แผนการเดินทาง</h2>
            
            {days.map(day => (
              <div key={day} className="relative">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf text-lg font-black text-white shadow-sm">
                    {day}
                  </div>
                  <h3 className="text-xl font-bold text-ink">วันที่ {day}</h3>
                </div>
                
                <div className="ml-6 space-y-8 border-l-2 border-slate-200 py-4 pl-8">
                  {stopsByDay[day].map((stop, index) => (
                    <div key={stop.sequence} className="relative">
                      <div className="absolute -left-[41px] top-4 h-4 w-4 rounded-full border-4 border-white bg-leaf shadow-sm" />
                      
                      <Link href={`/attractions/${stop.attractionSlug}`} className="group flex flex-col sm:flex-row gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md">
                        <div className="relative h-48 sm:h-32 w-full sm:w-48 shrink-0 overflow-hidden rounded-xl">
                          <Image 
                            src={stop.attractionImage} 
                            alt={stop.attractionName} 
                            fill 
                            className="object-cover transition duration-500 group-hover:scale-105" 
                            unoptimized 
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-sm font-bold text-leaf mb-1">จุดที่ {index + 1}</p>
                          <h4 className="text-lg font-bold text-ink group-hover:text-leaf transition-colors">{stop.attractionName}</h4>
                          <span className="mt-2 text-sm text-slate-500 font-medium group-hover:underline">ดูรายละเอียดสถานที่ →</span>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
