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
    <article className="rounded-[1.5rem] border border-ink/5 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-ink/10 group">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FAF3EE] text-[#E18868] ring-4 ring-[#FAF3EE]/50 group-hover:bg-[#E18868] group-hover:text-white transition-colors">
          <SealCheck size={32} weight="fill" />
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base font-black text-ink">{stamp.stampName}</h3>
          <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#E18868] uppercase tracking-wider">
            <MapPin weight="fill" size={12} /> {stamp.provinceName}
          </p>
          <p className="mt-1.5 text-sm text-muted">{stamp.attractionName}</p>
          <p className="mt-3 text-[10px] font-bold text-ink/60 uppercase tracking-wider">Earned {earnedDate}</p>
        </div>
      </div>
    </article>
  );

  if (!stamp.attractionSlug) return content;
  return <Link href={`/attractions/${stamp.attractionSlug}`}>{content}</Link>;
}
