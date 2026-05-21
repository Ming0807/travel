import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { LineLinkPanel } from "@/components/account/LineLinkPanel";

export default function LinkLinePage() {
  return (
    <main className="min-h-screen bg-cream px-4 pb-28 pt-8">
      <div className="mx-auto max-w-lg space-y-5">
        <Link
          href="/passport"
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-teal shadow-sm"
        >
          <ArrowLeft size={18} weight="bold" />
          กลับไปพาสปอร์ต
        </Link>

        <section className="rounded-[2rem] bg-gradient-to-br from-teal to-ink p-6 text-white shadow-glow">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/12 text-gold">
            <ShieldCheck size={28} weight="fill" />
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-gold">
            Optional LINE
          </p>
          <h1 className="mt-2 text-3xl font-black leading-tight">เชื่อม LINE เมื่อคุณพร้อม</h1>
          <p className="mt-3 text-sm leading-6 text-white/75">
            ใช้ LINE เพื่อบันทึกพาสปอร์ตและตราประทับสำหรับการกลับมาใช้งานครั้งถัดไป โดยยังใช้งานแบบ Guest ได้เสมอ
          </p>
        </section>

        <LineLinkPanel context="account" showContinueLink continueHref="/passport" />
      </div>
    </main>
  );
}
