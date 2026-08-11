import { BookBookmark, Compass, DeviceMobile, LinkSimple } from "@phosphor-icons/react/dist/ssr";
import type { PassportViewModel } from "@/lib/services/passport.service";

function completionPercent(earned: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((earned / total) * 100)));
}

export function PassportSummary({ passport }: { passport: PassportViewModel }) {
  const percent = completionPercent(passport.totalStampsEarned, passport.totalStampTargets);

  return (
    <section className="overflow-hidden rounded-lg border border-ink/15 bg-ink text-white shadow-[0_18px_45px_rgba(16,24,32,0.12)]">
      <div className="border-b border-white/15 px-5 py-4 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md border border-white/15 bg-white/10 text-coral">
              <Compass size={21} weight="fill" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold text-white/70">พาสปอร์ตท่องเที่ยวดิจิทัล</p>
              <p className="text-sm font-black">ชายแดนใต้</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white/85">
            {passport.isGuest ? <DeviceMobile size={16} aria-hidden="true" /> : <LinkSimple size={16} aria-hidden="true" />}
            {passport.isGuest ? "บันทึกบนอุปกรณ์นี้" : "เชื่อมบัญชีแล้ว"}
          </span>
        </div>
      </div>

      <div className="grid gap-7 px-5 py-6 sm:grid-cols-[1fr_15rem] sm:px-7 sm:py-8">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-coral">เจ้าของพาสปอร์ต</p>
          <h2 className="mt-1 break-words text-3xl font-black leading-tight sm:text-4xl">
            {passport.displayName || "นักเดินทาง"}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
            {passport.isGuest
              ? "ตราประทับยังใช้งานได้ตามปกติบนเบราว์เซอร์นี้ และคุณเลือกเชื่อมบัญชีภายหลังได้"
              : "พาสปอร์ตนี้พร้อมเรียกคืนเมื่อเข้าสู่ระบบด้วยบัญชีที่เชื่อมไว้"}
          </p>
        </div>

        <div className="rounded-lg border border-white/15 bg-white/[0.07] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-white/65">ตราที่สะสมแล้ว</p>
              <p className="mt-1 text-3xl font-black text-coral">
                {passport.totalStampsEarned}
                {passport.totalStampTargets > 0 && (
                  <span className="text-base font-bold text-white/55"> / {passport.totalStampTargets}</span>
                )}
              </p>
            </div>
            <BookBookmark size={25} className="text-coral" weight="fill" aria-hidden="true" />
          </div>
          {passport.totalStampTargets > 0 ? (
            <>
              <div
                className="mt-4 h-2 overflow-hidden rounded-sm bg-white/15"
                role="progressbar"
                aria-label="ความคืบหน้าการสะสมตราทั้งหมด"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <div className="h-full bg-coral" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-2 text-right text-xs font-bold text-white/75">{percent}% ของเป้าหมาย</p>
            </>
          ) : (
            <p className="mt-3 text-xs leading-5 text-white/70">ยังไม่มีเป้าหมายการสะสมที่เปิดใช้งาน</p>
          )}
        </div>
      </div>
    </section>
  );
}
