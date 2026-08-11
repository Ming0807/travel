import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

import { LineLinkPanel } from "@/components/account/LineLinkPanel";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";

export default function LinkLinePage() {
  return (
    <main className="min-h-screen bg-[var(--public-canvas)] py-8 sm:py-12">
      <PublicPageFrame variant="detail" className="max-w-2xl">
        <Link
          href="/passport"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal hover:underline"
        >
          <ArrowLeft aria-hidden="true" size={18} weight="bold" />
          กลับไปพาสปอร์ต
        </Link>

        <header className="mt-3 border-b border-slate-300 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-teal/10 text-teal">
            <ShieldCheck aria-hidden="true" size={27} weight="fill" />
          </div>
          <h1 className="mt-5 text-3xl font-black text-ink">เชื่อม LINE เพื่อค้นคืนพาสปอร์ต</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
            เป็นทางเลือกสำหรับเปิดพาสปอร์ตบนอุปกรณ์อื่น คุณยังใช้ระบบแบบผู้เยี่ยมชมได้ และระบบจะไม่ใช้การเชื่อมนี้เป็นความยินยอมรับข่าวสาร
          </p>
        </header>

        <LineLinkPanel context="account" showContinueLink continueHref="/passport" className="mt-6" />
      </PublicPageFrame>
    </main>
  );
}
