import { UserFocus, IdentificationCard, SignIn, ChartPieSlice } from "@phosphor-icons/react/dist/ssr";

export function HomepagePrivacy() {
  return (
    <section id="privacy" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-6 lg:py-14">
      <div className="overflow-hidden rounded-[2.4rem] border border-ink/5 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="relative bg-teal p-7 text-white lg:p-10 woven-pattern">
            <p className="inline-flex rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-cream">
              Privacy by Design
            </p>
            <h2 className="mt-5 text-3xl font-bold leading-tight lg:text-4xl">
              กรอกน้อย ปลอดภัย<br />และเป็นทางเลือก
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              ระบบใช้ชื่อที่ต้องการแสดงบนใบประกาศ ไม่บังคับชื่อจริง ไม่บังคับ LINE/Gmail
              และแบบสอบถามเป็น optional หลังได้รับรางวัลแล้ว
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:p-8 bg-cream">
            <div className="rounded-3xl bg-white p-5 border border-ink/5">
              <UserFocus size={32} className="text-teal" />
              <h3 className="mt-3 font-bold text-ink">Display Name</h3>
              <p className="mt-1 text-sm text-muted">ใช้ชื่อเล่น นามแฝง หรือชื่อจริงก็ได้</p>
            </div>
            <div className="rounded-3xl bg-white p-5 border border-ink/5">
              <IdentificationCard size={32} className="text-coral" />
              <h3 className="mt-3 font-bold text-ink">No Sensitive ID</h3>
              <p className="mt-1 text-sm text-muted">ไม่ขอเลขบัตรประชาชน พาสปอร์ต หรือที่อยู่เต็ม</p>
            </div>
            <div className="rounded-3xl bg-white p-5 border border-ink/5">
              <SignIn size={32} className="text-gold" />
              <h3 className="mt-3 font-bold text-ink">Login Optional</h3>
              <p className="mt-1 text-sm text-muted">
                Guest ใช้งานได้ทันที Google/LINE ใช้เพื่อบันทึกพาสปอร์ต
              </p>
            </div>
            <div className="rounded-3xl bg-white p-5 border border-ink/5">
              <ChartPieSlice size={32} className="text-leaf" />
              <h3 className="mt-3 font-bold text-ink">Aggregated Dashboard</h3>
              <p className="mt-1 text-sm text-muted">
                Dashboard ใช้ข้อมูลแบบรวม ไม่เปิดเผยข้อมูลส่วนตัว
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
