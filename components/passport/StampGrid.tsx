import Link from "next/link";
import { ArrowRight, MapPin } from "@phosphor-icons/react/dist/ssr";
import type { PassportViewModel } from "@/lib/services/passport.service";
import { StampCard } from "@/components/passport/StampCard";

export function StampGrid({ passport }: { passport: PassportViewModel }) {
  const groups = passport.stampTargetsByProvince.filter((group) => group.targets.length > 0);
  return (
    <section aria-labelledby="stamp-collection-title">
      <header className="passport-section-header">
        <p className="passport-eyebrow">คอลเลกชันของคุณ</p>
        <h2 id="stamp-collection-title">ตราประทับทั้งหมด</h2>
        <p>เลือกสถานที่เพื่อดูรายละเอียดและวางแผนเก็บตราถัดไป</p>
      </header>
      {passport.totalStampTargets === 0 && <div className="passport-state mb-6">
        <MapPin size={28} weight="fill" aria-hidden="true" />
        <h3 className="text-lg font-bold">ยังไม่มีจุดสะสมตราที่เปิดใช้งาน</h3>
        <p>คุณยังดูข้อมูลสถานที่และวางแผนเที่ยวได้ตามปกติ ตราที่เคยได้รับยังอยู่ในพาสปอร์ต</p>
        <Link href="/attractions" className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#9b4e38]">ดูสถานที่ท่องเที่ยว <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>}
      {groups.map((group) => (
        <div className="passport-stamp-group" key={group.provinceName}>
          <h3>{group.provinceName}</h3>
          <div className="passport-stamp-grid">
            {group.targets.map((target) => <StampCard key={`${target.attractionSlug ?? target.attractionName}-${target.stampName}`} target={target} />)}
          </div>
        </div>
      ))}
    </section>
  );
}
