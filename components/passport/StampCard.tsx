import Link from "next/link";
import { ArrowUpRight, CheckCircle, MapPin, SealCheck } from "@phosphor-icons/react/dist/ssr";
import type { SafePassportStampTarget } from "@/lib/services/passport.service";

export function StampCard({ target }: { target: SafePassportStampTarget }) {
  const earnedDate = target.earnedAt ? new Date(target.earnedAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" }) : null;
  const content = (
    <article className="passport-stamp" data-earned={target.isEarned}>
      <div className="passport-stamp-top">
        <span className="passport-stamp-seal"><SealCheck size={34} weight={target.isEarned ? "fill" : "regular"} aria-hidden="true" /></span>
        <span className="passport-stamp-status">{target.isEarned && <CheckCircle size={14} weight="fill" aria-hidden="true" />}{target.isEarned ? "ได้รับแล้ว" : "ยังไม่ได้รับ"}</span>
      </div>
      <h3>{target.stampName}</h3>
      <p className="passport-stamp-place">{target.attractionName}</p>
      <p className="passport-stamp-province"><MapPin size={14} weight="fill" aria-hidden="true" />{target.provinceName}</p>
      <div className="passport-stamp-bottom">
        <p>{earnedDate ? `ได้รับเมื่อ ${earnedDate}` : target.isEarned ? "เก็บไว้ในพาสปอร์ตแล้ว" : "จุดหมายถัดไปของคุณ"}</p>
        {target.attractionSlug && <ArrowUpRight size={19} aria-hidden="true" />}
      </div>
    </article>
  );
  if (!target.attractionSlug) return content;
  return <Link href={`/attractions/${target.attractionSlug}`} aria-label={`${target.attractionName} ${target.isEarned ? "ได้รับตราแล้ว" : "ยังไม่ได้รับตรา"}`} className="passport-stamp-link">{content}</Link>;
}
