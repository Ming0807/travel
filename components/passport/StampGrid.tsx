import Link from "next/link";
import type { PassportViewModel } from "@/lib/services/passport.service";
import { StampCard } from "@/components/passport/StampCard";

export function StampGrid({ passport }: { passport: PassportViewModel }) {
  if (passport.totalStampsEarned === 0) {
    return (
      <section className="rounded-[1.5rem] bg-white p-8 text-center shadow-sm border border-ink/5">
        <h2 className="text-2xl font-black text-ink">ยังไม่มีตราประทับ</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          ลองสแกน QR Code ที่สถานที่ท่องเที่ยวที่เข้าร่วม เพื่อเริ่มสะสมพาสปอร์ตของคุณ
        </p>
        <Link href="/attractions" className="mt-6 inline-flex rounded-full bg-[#E18868] px-6 py-4 font-bold text-white shadow-sm transition-colors hover:bg-[#D07757]">
          สำรวจสถานที่ท่องเที่ยว
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {passport.stampsByProvince.map((group) =>
        group.stamps.length > 0 ? (
          <div key={group.provinceName}>
            <h2 className="mb-3 text-xl font-black text-ink">{group.provinceName}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.stamps.map((stamp) => (
                <StampCard key={`${stamp.attractionName}-${stamp.earnedAt}`} stamp={stamp} />
              ))}
            </div>
          </div>
        ) : null
      )}
    </section>
  );
}
