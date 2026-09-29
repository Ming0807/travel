import Link from "next/link";
import { ArrowSquareOut, ArrowUpRight, MapPin } from "@phosphor-icons/react/dist/ssr";
import { PublicMediaFrame } from "@/components/public/PublicMediaFrame";
import { buildRouteDirectionsFromCurrentUrl, buildRouteStopMapUrl, orderPublicRouteStops, type PublicRouteStop } from "@/lib/routes/public-route";

export function PublicRouteTimeline({ stops }: { stops: PublicRouteStop[] }) {
  const orderedStops = orderPublicRouteStops(stops);
  const days = Array.from(new Set(orderedStops.map((stop) => stop.dayNumber)));

  if (days.length === 0) {
    return (
      <div className="border border-dashed border-black/20 bg-white px-5 py-6">
        <p className="font-bold text-[var(--public-ink)]">เส้นทางนี้ยังไม่มีจุดแวะที่เผยแพร่</p>
        <p className="mt-1 text-sm leading-6 text-black/65">ดูสถานที่ที่เปิดเผยแพร่แล้วเพื่อวางแผนการเดินทางแทน</p>
        <Link
          href="/attractions"
          className="mt-3 inline-flex min-h-11 items-center font-bold text-[var(--public-coral-strong)] underline decoration-current underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
        >
          ดูสถานที่ท่องเที่ยว
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {days.length > 1 ? (
        <nav aria-label="เลือกวันในเส้นทาง" className="flex flex-wrap gap-2">
          {days.map((day) => (
            <a
              key={day}
              href={`#route-day-${day}`}
              className="inline-flex min-h-11 items-center rounded border border-[#dfd7cf] bg-white px-4 text-sm font-bold text-[#783823] transition-colors hover:border-[#9b4e38] hover:bg-[#f8efe9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b4e38]"
            >
              วันที่ {day.toLocaleString("th-TH")}
            </a>
          ))}
        </nav>
      ) : null}

      <div className="space-y-10">
        {days.map((day) => {
          const dayStops = orderedStops.filter((stop) => stop.dayNumber === day);
          return (
            <section key={day} aria-labelledby={`route-day-${day}`}>
              <div className="flex items-end justify-between gap-3 border-b border-[#dedbd5] pb-4">
                <h3 id={`route-day-${day}`} className="scroll-mt-24 text-xl font-bold text-[#263036]">
                  วันที่ {day.toLocaleString("th-TH")}
                </h3>
                <p className="text-sm font-semibold text-[#687076]">{dayStops.length.toLocaleString("th-TH")} จุดแวะ</p>
              </div>

              <ol className="mt-2">
                {dayStops.map((stop) => {
                  const stopIndex = orderedStops.indexOf(stop) + 1;
                  const mapUrl = buildRouteStopMapUrl(stop);
                  const navigationUrl = buildRouteDirectionsFromCurrentUrl([stop]);
                  return (
                  <li id={`route-stop-${stopIndex}`} key={`${stop.dayNumber}-${stop.sequence}-${stop.attractionId}`} className="scroll-mt-24 border-b border-[#e6e2dc] last:border-b-0 target:bg-[#f8efe9]">
                    <Link
                      href={`/attractions/${stop.attractionSlug}`}
                      className="group grid gap-4 py-5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b4e38] sm:grid-cols-[44px_150px_minmax(0,1fr)] sm:items-start"
                      aria-label={`ดูสถานที่ ${stop.attractionName}`}
                    >
                      <span className="hidden pt-1 text-2xl font-bold text-[#9b4e38] sm:block" aria-hidden="true">
                        {String(stopIndex).padStart(2, "0")}
                      </span>
                      <div className="max-w-[220px] sm:max-w-none">
                        <PublicMediaFrame
                          src={stop.attractionImage}
                          alt={stop.attractionImageAlt}
                          aspect="landscape"
                          sizes="(max-width: 639px) 220px, 150px"
                          fallbackLabel="ยังไม่มีรูปสถานที่"
                        />
                      </div>
                      <div className="min-w-0 self-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#9b4e38]">
                          จุดที่ {stopIndex.toLocaleString("th-TH")}
                        </p>
                        <h4 className="mt-1 text-lg font-bold leading-7 text-[#263036] group-hover:text-[#9b4e38]">
                          {stop.attractionName}
                        </h4>
                        {stop.stopNote ? <p className="mt-2 text-sm leading-6 text-[#5f6668]">{stop.stopNote}</p> : null}
                        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#783823]">
                          <MapPin size={16} weight="fill" aria-hidden="true" />
                          ดูข้อมูลสถานที่ <ArrowUpRight size={15} weight="bold" aria-hidden="true" />
                        </p>
                      </div>
                    </Link>
                    <div className="pb-5 sm:pl-[226px]">
                      {mapUrl && navigationUrl ? (
                        <div className="flex flex-wrap gap-x-5 gap-y-1">
                          <a
                            href={navigationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`นำทางจากตำแหน่งปัจจุบันไปจุดที่ ${stopIndex} ใน Google Maps`}
                            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-[#783823] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b4e38]"
                          >
                            นำทางไปจุดนี้ <ArrowSquareOut size={16} aria-hidden="true" />
                          </a>
                          <a
                            href={mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`ดูพิกัดจุดที่ ${stopIndex} ใน Google Maps`}
                            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-[#783823] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b4e38]"
                          >
                            ดูพิกัด <ArrowSquareOut size={16} aria-hidden="true" />
                          </a>
                        </div>
                      ) : <p className="text-sm text-[#687076]">ยังไม่มีพิกัดสำหรับจุดนี้</p>}
                    </div>
                  </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
