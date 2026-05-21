import Link from "next/link";
import { MapPin, SealCheck } from "@phosphor-icons/react/dist/ssr";
import type { SafePassportStamp } from "@/lib/services/passport.service";

export function StampCard({ stamp }: { stamp: SafePassportStamp }) {
  const earnedDate = new Date(stamp.earnedAt).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const content = (
    <article className="rounded-[1.5rem] border border-white bg-white p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold ring-4 ring-gold/10">
          <SealCheck size={32} weight="fill" />
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base font-black text-ink">{stamp.stampName}</h3>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-coral">
            <MapPin weight="fill" /> {stamp.provinceName}
          </p>
          <p className="mt-2 text-sm text-muted">{stamp.attractionName}</p>
          <p className="mt-2 text-xs font-semibold text-teal">ได้รับเมื่อ {earnedDate}</p>
        </div>
      </div>
    </article>
  );

  if (!stamp.attractionSlug) return content;
  return <Link href={`/attractions/${stamp.attractionSlug}`}>{content}</Link>;
}
