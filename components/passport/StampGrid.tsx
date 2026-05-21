import Link from "next/link";
import type { PassportViewModel } from "@/lib/services/passport.service";
import { StampCard } from "@/components/passport/StampCard";

export function StampGrid({ passport }: { passport: PassportViewModel }) {
  if (passport.totalStampsEarned === 0) {
    return (
      <section className="rounded-[1.75rem] bg-white p-6 text-center shadow-card">
        <h2 className="text-xl font-black text-ink">ยังไม่มีตราประทับ</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          ลองสแกน QR Code ที่สถานที่ท่องเที่ยวที่เข้าร่วม เพื่อเริ่มสะสมพาสปอร์ตของคุณ
        </p>
        <Link href="/attractions" className="mt-5 inline-flex rounded-full bg-teal px-5 py-3 font-bold text-white">
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
