import Link from "next/link";
import Image from "next/image";
import { MapTrifold } from "@phosphor-icons/react/dist/ssr";
import type { PublicRouteCard } from "@/lib/repositories/public-content.repository";

interface HomepageSuggestedRoutesProps {
  routes: PublicRouteCard[];
}

export function HomepageSuggestedRoutes({ routes }: HomepageSuggestedRoutesProps) {
  if (!routes || routes.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t border-ink/5">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-ink">เส้นทางแนะนำ</h2>
          <p className="mt-2 text-muted">ออกเดินทางสัมผัสประสบการณ์ใหม่ในแบบที่คุณเลือก</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => (
          <article key={route.slug} className="group relative flex flex-col bg-white rounded-2xl p-4 border border-ink/5 hover:shadow-md transition-shadow">
            <div className="relative w-full aspect-video overflow-hidden rounded-2xl mb-4">
              {route.imageUrl ? (
                <Image
                  src={route.imageUrl}
                  alt={route.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-sand/70 text-center text-xs font-semibold text-muted">
                  <MapTrifold size={24} className="text-leaf" />
                  <span>ยังไม่มีรูปภาพ</span>
                </div>
              )}
              <div className="absolute top-2 left-2 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold text-ink">
                {route.days} วัน
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-ink mb-2">{route.name}</h3>
              <p className="text-sm text-muted line-clamp-2 mb-4 flex-1">{route.description}</p>
              <Link
                href={`/routes/${route.slug}`}
                className="inline-flex items-center justify-center rounded-full bg-sand px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-sand-dark w-full"
              >
                ดูรายละเอียดเส้นทาง
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
