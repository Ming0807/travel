import Link from "next/link";
import { ArrowRight, MapPin } from "@phosphor-icons/react/dist/ssr";
import type { PassportViewModel } from "@/lib/services/passport.service";
import { StampCard } from "@/components/passport/StampCard";

export function StampGrid({ passport }: { passport: PassportViewModel }) {
  if (passport.totalStampTargets === 0) {
    return (
      <section className="rounded-lg border border-ink/10 bg-white p-6 sm:p-8">
        <MapPin size={28} className="text-coral" weight="fill" aria-hidden="true" />
        <h2 className="mt-4 text-xl font-black text-ink">ยังไม่มีจุดสะสมตราที่เปิดใช้งาน</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          คุณยังดูข้อมูลสถานที่และวางแผนเที่ยวได้ตามปกติ เมื่อมีจุดสะสมใหม่ ระบบจะแสดงที่นี่โดยอัตโนมัติ
        </p>
        <Link
          href="/attractions"
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-coral px-4 py-3 text-sm font-bold text-white hover:bg-coral/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2"
        >
          ดูสถานที่ท่องเที่ยว <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="stamp-collection-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-coral">คอลเลกชันของคุณ</p>
          <h2 id="stamp-collection-title" className="mt-1 text-2xl font-black text-ink">
            ตราประทับทั้งหมด
          </h2>
        </div>
        <p className="text-sm text-muted">เลือกสถานที่เพื่อดูรายละเอียดและวางแผนเก็บตราถัดไป</p>
      </div>
      <div className="space-y-7">
        {passport.stampTargetsByProvince.map((group) => (
          <div key={group.provinceName}>
            <h3 className="mb-3 text-base font-black text-ink">{group.provinceName}</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.targets.map((target) => (
                <StampCard key={`${target.attractionSlug ?? target.attractionName}-${target.stampName}`} target={target} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
