import Link from "next/link";
import { CheckCircle, MapPin, SealCheck } from "@phosphor-icons/react/dist/ssr";
import type { SafePassportStampTarget } from "@/lib/services/passport.service";

export function StampCard({ target }: { target: SafePassportStampTarget }) {
  const earnedDate = target.earnedAt
    ? new Date(target.earnedAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })
    : null;

  const content = (
    <article
      className={`h-full rounded-lg border p-4 transition-colors sm:p-5 ${
        target.isEarned
          ? "border-teal/25 bg-white hover:border-teal/50"
          : "border-ink/10 bg-white hover:border-coral/40"
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-md border ${
            target.isEarned ? "border-teal/20 bg-teal/10 text-teal" : "border-ink/10 bg-background text-ink/35"
          }`}
        >
          <SealCheck size={30} weight={target.isEarned ? "fill" : "regular"} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-base font-black leading-6 text-ink">{target.stampName}</h3>
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${
                target.isEarned ? "bg-teal/10 text-teal" : "bg-ink/[0.06] text-muted"
              }`}
            >
              {target.isEarned && <CheckCircle size={14} weight="fill" aria-hidden="true" />}
              {target.isEarned ? "ได้รับแล้ว" : "ยังไม่ได้รับ"}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-ink/75">{target.attractionName}</p>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-muted">
            <MapPin size={14} weight="fill" className="text-coral" aria-hidden="true" />
            {target.provinceName}
          </p>
          {earnedDate && <p className="mt-3 text-xs font-semibold text-teal">ได้รับเมื่อ {earnedDate}</p>}
        </div>
      </div>
    </article>
  );

  if (!target.attractionSlug) return content;
  return (
    <Link
      href={`/attractions/${target.attractionSlug}`}
      aria-label={`${target.attractionName} ${target.isEarned ? "ได้รับตราแล้ว" : "ยังไม่ได้รับตรา"}`}
      className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
    >
      {content}
    </Link>
  );
}
