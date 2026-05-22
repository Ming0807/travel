import Link from "next/link";
import { MapPin, SealCheck } from "@phosphor-icons/react/dist/ssr";
import type { SafePassportStamp } from "@/lib/services/passport.service";

export function StampCard({ stamp }: { stamp: SafePassportStamp }) {
  const earnedDate = new Date(stamp.earnedAt).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  // Randomize rotation slightly for a more natural stamp look
  // Using hash of string to ensure consistent rotation per stamp
  const hash = stamp.attractionSlug ? stamp.attractionSlug.length % 5 : 0;
  const rotations = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "-rotate-2"];
  const rotationClass = rotations[hash];

  const content = (
    <article className="relative rounded-[1.5rem] bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group border-2 border-dashed border-ink/10 overflow-hidden">
      {/* Decorative watermark / stamp effect */}
      <div className={`absolute -right-6 -bottom-6 opacity-[0.03] text-[#E18868] pointer-events-none transform ${rotationClass}`}>
        <SealCheck size={140} weight="fill" />
      </div>
      
      <div className="absolute top-4 right-4 rotate-[15deg] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className="border-2 border-[#E18868] text-[#E18868] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm bg-white/80 backdrop-blur-sm">
          VISITED
        </span>
      </div>

      <div className="relative z-10 flex items-start gap-4">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FAF3EE] text-[#E18868] ring-4 ring-white shadow-inner transform ${rotationClass} group-hover:scale-110 group-hover:rotate-0 transition-all duration-500`}>
          <SealCheck size={36} weight="fill" />
        </div>
        <div className="min-w-0 pt-1">
          <h3 className="line-clamp-2 text-base font-black text-ink group-hover:text-[#E18868] transition-colors">{stamp.stampName}</h3>
          <p className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-muted uppercase tracking-wider">
            <MapPin weight="fill" size={12} className="text-[#E18868]" /> {stamp.provinceName}
          </p>
          <p className="mt-1 text-sm text-ink/80 line-clamp-1">{stamp.attractionName}</p>
          
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1 text-[10px] font-bold text-ink/70">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E18868]"></span>
            {earnedDate}
          </div>
        </div>
      </div>
    </article>
  );

  if (!stamp.attractionSlug) return content;
  return <Link href={`/attractions/${stamp.attractionSlug}`}>{content}</Link>;
}
