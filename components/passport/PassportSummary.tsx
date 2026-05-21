import type { PassportViewModel } from "@/lib/services/passport.service";

export function PassportSummary({ passport }: { passport: PassportViewModel }) {
  return (
    <section className="rounded-[2rem] bg-gradient-to-br from-teal to-ink p-6 text-white shadow-glow">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-gold">Digital Passport</p>
      <h1 className="mt-3 text-3xl font-black">{passport.displayName || "นักเดินทาง"}</h1>
      <p className="mt-2 text-sm leading-6 text-white/75">
        Guest passport works on this browser/device. Link Google or LINE later to recover across devices.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white/12 p-4">
          <p className="text-xs text-white/70">ตราที่สะสมแล้ว</p>
          <p className="mt-1 text-3xl font-black text-gold">{passport.totalStampsEarned}</p>
        </div>
        <div className="rounded-3xl bg-white/12 p-4">
          <p className="text-xs text-white/70">สถานะบัญชี</p>
          <p className="mt-2 text-sm font-black">{passport.isGuest ? "Guest" : "Linked"}</p>
        </div>
      </div>
    </section>
  );
}
