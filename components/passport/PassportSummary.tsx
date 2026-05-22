import type { PassportViewModel } from "@/lib/services/passport.service";

export function PassportSummary({ passport }: { passport: PassportViewModel }) {
  return (
    <section className="rounded-[2rem] bg-ink p-8 text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#E18868]">Digital Passport</p>
        <h1 className="mt-2 text-3xl font-black">{passport.displayName || "นักเดินทาง"}</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/60">
          Guest passport works on this browser/device. Link Google or LINE later to recover across devices.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white/10 border border-white/5 p-5 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-wider text-white/50 font-bold">ตราที่สะสมแล้ว</p>
            <p className="mt-1 text-3xl font-black text-[#E18868]">{passport.totalStampsEarned}</p>
          </div>
          <div className="rounded-3xl bg-white/10 border border-white/5 p-5 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-wider text-white/50 font-bold">สถานะบัญชี</p>
            <p className="mt-2 text-base font-black text-white">{passport.isGuest ? "Guest" : "Linked"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
