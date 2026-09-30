import Link from "next/link";
import { ArrowUpRight, ClockCounterClockwise, MapPin } from "@phosphor-icons/react/dist/ssr";
import type { SafePassportVisit } from "@/lib/services/passport.service";

export function RecentPassportVisits({ visits }: { visits: SafePassportVisit[] }) {
  if (visits.length === 0) return null;

  return (
    <section className="passport-recent" aria-labelledby="recent-visits-title">
      <div className="passport-recent-heading">
        <ClockCounterClockwise size={22} weight="bold" aria-hidden="true" />
        <h2 id="recent-visits-title">การเดินทางล่าสุด</h2>
      </div>
      <ol>
        {visits.map((visit, index) => {
          const date = new Date(visit.visitedAt).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          const body = (
            <div className="passport-recent-visit">
              <div>
                <p>{visit.attractionName}</p>
                <p>
                  <MapPin size={13} weight="fill" aria-hidden="true" />
                  {visit.provinceName} · {date}
                </p>
              </div>
              {visit.attractionSlug && <ArrowUpRight size={18} aria-hidden="true" />}
            </div>
          );

          return (
            <li key={`${visit.attractionSlug ?? visit.attractionName}-${visit.visitedAt}-${index}`}>
              {visit.attractionSlug ? (
                <Link
                  href={`/attractions/${visit.attractionSlug}`}
                  className="block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
                >
                  {body}
                </Link>
              ) : body}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
