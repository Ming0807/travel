import Link from "next/link";
import { ArrowUpRight, CalendarBlank, MapPin } from "@phosphor-icons/react/dist/ssr";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import type { PublicRouteCard as PublicRouteCardData } from "@/lib/repositories/public-content.repository";

export function PublicRouteCard({
  route,
  priority = false,
  index,
}: {
  route: PublicRouteCardData;
  priority?: boolean;
  index: number;
}) {
  return (
    <article className="route-directory__card">
      <Link
        href={`/routes/${route.slug}`}
        className="route-directory__link group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--public-coral)]"
        aria-label={`ดูแผนการเดินทาง ${route.name}`}
      >
        <div className="route-directory__image">
          <PublicMediaFrame
            src={route.imageUrl}
            alt={route.imageAlt}
            aspect="directory"
            sizes="(max-width: 767px) calc(100vw - 2rem), (max-width: 1279px) 42vw, 520px"
            priority={priority}
            fallbackLabel="ยังไม่มีภาพปกเส้นทาง"
          />
        </div>
        <div className="route-directory__copy">
          <p className="route-directory__eyebrow">เส้นทางแนะนำ <span>{String(index).padStart(2, "0")}</span></p>
          <h3 className="route-directory__title">{route.name}</h3>
          {route.description ? <p className="route-directory__description">{route.description}</p> : null}
          <div className="route-directory__facts">
            <span><CalendarBlank size={17} weight="bold" aria-hidden="true" />{route.days.toLocaleString("th-TH")} วัน</span>
            <span><MapPin size={17} weight="fill" aria-hidden="true" />{route.stopCount.toLocaleString("th-TH")} จุดแวะ</span>
          </div>
          <p className="route-directory__cta">
            ดูแผนการเดินทาง <ArrowUpRight size={19} weight="bold" aria-hidden="true" />
          </p>
        </div>
      </Link>
    </article>
  );
}
