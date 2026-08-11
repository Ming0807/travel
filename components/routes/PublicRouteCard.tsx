import Link from "next/link";
import { CalendarBlank, MapPin, NavigationArrow } from "@phosphor-icons/react/dist/ssr";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import type { PublicRouteCard as PublicRouteCardData } from "@/lib/repositories/public-content.repository";

export function PublicRouteCard({
  route,
  priority = false,
}: {
  route: PublicRouteCardData;
  priority?: boolean;
}) {
  return (
    <article className="group border border-black/10 bg-white p-4">
      <Link
        href={`/routes/${route.slug}`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
        aria-label={`ดูแผนการเดินทาง ${route.name}`}
      >
        <PublicMediaFrame
          src={route.imageUrl}
          alt={route.imageAlt}
          aspect="wide"
          sizes="(max-width: 767px) calc(100vw - 4rem), (max-width: 1279px) 45vw, 360px"
          priority={priority}
          fallbackLabel="ยังไม่มีภาพปกเส้นทาง"
        />
        <div className="pt-5">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-black/65">
            <span className="inline-flex items-center gap-1.5">
              <CalendarBlank size={17} weight="bold" aria-hidden="true" />
              {route.days.toLocaleString("th-TH")} วัน
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={17} weight="fill" aria-hidden="true" />
              {route.stopCount.toLocaleString("th-TH")} จุดแวะ
            </span>
          </div>
          <h2 className="mt-3 text-xl font-bold leading-7 group-hover:text-[var(--public-teal)]">
            {route.name}
          </h2>
          {route.description ? (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-black/65">{route.description}</p>
          ) : null}
          <p className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--public-coral-strong)]">
            <NavigationArrow size={18} weight="fill" aria-hidden="true" />
            ดูแผนการเดินทาง
          </p>
        </div>
      </Link>
    </article>
  );
}
