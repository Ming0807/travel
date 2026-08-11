import Link from "next/link";
import { MapPin } from "@phosphor-icons/react/dist/ssr";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import type { PublicRouteStop } from "@/lib/routes/public-route";

export function PublicRouteTimeline({ stops }: { stops: PublicRouteStop[] }) {
  const orderedStops = stops.slice().sort((left, right) =>
    left.dayNumber - right.dayNumber || left.sequence - right.sequence,
  );
  const days = Array.from(new Set(orderedStops.map((stop) => stop.dayNumber)));

  return (
    <div className="space-y-10">
      {days.map((day) => {
        const dayStops = orderedStops.filter((stop) => stop.dayNumber === day);
        return (
          <section key={day} aria-labelledby={`route-day-${day}`}>
            <div className="flex items-center gap-3 border-b border-black/10 pb-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center bg-[var(--public-teal)] text-base font-bold text-white">
                {day.toLocaleString("th-TH")}
              </span>
              <div>
                <h3 id={`route-day-${day}`} className="text-xl font-bold">วันที่ {day.toLocaleString("th-TH")}</h3>
                <p className="mt-0.5 text-sm text-black/65">{dayStops.length.toLocaleString("th-TH")} จุดแวะ</p>
              </div>
            </div>

            <ol className="mt-5 space-y-4">
              {dayStops.map((stop, index) => (
                <li key={`${stop.dayNumber}-${stop.sequence}-${stop.attractionId}`}>
                  <Link
                    href={`/attractions/${stop.attractionSlug}`}
                    className="group grid gap-4 border border-black/10 bg-white p-4 transition-colors hover:border-[var(--public-coral)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)] sm:grid-cols-[180px_minmax(0,1fr)]"
                    aria-label={`ดูสถานที่ ${stop.attractionName}`}
                  >
                    <PublicMediaFrame
                      src={stop.attractionImage}
                      alt={stop.attractionImageAlt}
                      aspect="landscape"
                      sizes="(max-width: 639px) calc(100vw - 4rem), 180px"
                      fallbackLabel="ยังไม่มีรูปสถานที่"
                    />
                    <div className="self-center">
                      <p className="text-sm font-semibold text-[var(--public-coral-strong)]">
                        จุดที่ {(index + 1).toLocaleString("th-TH")}
                      </p>
                      <h4 className="mt-1 text-lg font-bold leading-7 group-hover:text-[var(--public-teal)]">
                        {stop.attractionName}
                      </h4>
                      <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-black/65">
                        <MapPin size={17} weight="fill" aria-hidden="true" />
                        ดูข้อมูลสถานที่
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
