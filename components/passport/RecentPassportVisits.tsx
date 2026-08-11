import Link from "next/link";
import { ArrowUpRight, ClockCounterClockwise, MapPin } from "@phosphor-icons/react/dist/ssr";
import type { SafePassportVisit } from "@/lib/services/passport.service";

export function RecentPassportVisits({ visits }: { visits: SafePassportVisit[] }) {
  if (visits.length === 0) return null;

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 sm:p-6" aria-labelledby="recent-visits-title">
      <div className="flex items-center gap-3">
        <ClockCounterClockwise size={22} className="text-coral" weight="bold" aria-hidden="true" />
        <h2 id="recent-visits-title" className="text-xl font-black text-ink">การเดินทางล่าสุด</h2>
      </div>
      <ol className="mt-5 divide-y divide-ink/10">
        {visits.map((visit, index) => {
          const date = new Date(visit.visitedAt).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          const body = (
            <div className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <p className="font-bold text-ink">{visit.attractionName}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                  <MapPin size={13} weight="fill" className="text-coral" aria-hidden="true" />
                  {visit.provinceName} · {date}
                </p>
              </div>
              {visit.attractionSlug && <ArrowUpRight size={18} className="shrink-0 text-ink/45" aria-hidden="true" />}
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
