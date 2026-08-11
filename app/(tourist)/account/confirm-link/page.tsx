import Link from "next/link";
import { ArrowsLeftRight, DeviceMobile, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

import {
  confirmGuestPassportLinkAction,
  createSeparateTouristAccountAction,
} from "@/app/actions/tourist-account-actions";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import { resolveSafeAuthDestination } from "@/lib/auth/oauth";

type ConfirmLinkPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

const errorMessages: Record<string, string> = {
  confirmation_required: "กรุณายืนยันก่อนรวมพาสปอร์ตกับบัญชีนี้",
  link_failed: "ยังรวมพาสปอร์ตกับบัญชีไม่ได้ ข้อมูลเดิมบนอุปกรณ์นี้ยังอยู่ครบ",
  create_failed: "ยังสร้างโปรไฟล์แยกไม่ได้ กรุณาลองใหม่อีกครั้ง",
};

export default async function ConfirmAccountLinkPage({ searchParams }: ConfirmLinkPageProps) {
  const params = await searchParams;
  const next = resolveSafeAuthDestination(params.next);
  const error = params.error ? errorMessages[params.error] : null;

  return (
    <main className="min-h-screen bg-[var(--public-canvas)] py-8 sm:py-12">
      <PublicPageFrame variant="detail" className="max-w-3xl">
        <Link
          href="/profile"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--public-teal)] hover:underline"
        >
          กลับไปหน้าโปรไฟล์
        </Link>

        <section className="mt-3 overflow-hidden rounded-[var(--public-radius-panel)] border border-slate-200 bg-white">
          <header className="border-b border-slate-200 p-6 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-teal/10 text-teal">
              <ArrowsLeftRight aria-hidden="true" size={26} weight="bold" />
            </div>
            <h1 className="mt-5 text-2xl font-black text-ink sm:text-3xl">
              เลือกวิธีจัดการพาสปอร์ตเดิม
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              พบบันทึกการเดินทางแบบผู้เยี่ยมชมบนอุปกรณ์นี้ คุณเลือกได้ว่าจะรวมกับบัญชีที่เพิ่งเข้าสู่ระบบ หรือเก็บแยกไว้บนอุปกรณ์นี้
            </p>
          </header>

          {error ? (
            <p role="alert" className="mx-6 mt-6 border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 sm:mx-8">
              {error}
            </p>
          ) : null}

          <div className="grid gap-0 sm:grid-cols-2">
            <form action={confirmGuestPassportLinkAction} className="border-b border-slate-200 p-6 sm:border-b-0 sm:border-r sm:p-8">
              <input type="hidden" name="next" value={next} />
              <ShieldCheck aria-hidden="true" size={24} className="text-teal" weight="fill" />
              <h2 className="mt-4 text-xl font-black text-ink">รวมพาสปอร์ตเดิม</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                ตราประทับ ใบประกาศ และประวัติบนอุปกรณ์นี้จะค้นคืนได้เมื่อเข้าสู่ระบบด้วยบัญชีนี้
              </p>
              <label className="mt-5 flex cursor-pointer gap-3 border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-ink">
                <input
                  type="checkbox"
                  name="confirm"
                  value="yes"
                  required
                  className="mt-1 h-5 w-5 shrink-0 accent-teal"
                />
                <span>ฉันยืนยันให้เชื่อมบัญชีนี้กับพาสปอร์ตบนอุปกรณ์นี้ เพื่อค้นคืนข้อมูลการเดินทางในภายหลัง</span>
              </label>
              <PublicButton type="submit" className="mt-5 w-full">
                รวมพาสปอร์ตกับบัญชี
              </PublicButton>
            </form>

            <form action={createSeparateTouristAccountAction} className="p-6 sm:p-8">
              <input type="hidden" name="next" value={next} />
              <DeviceMobile aria-hidden="true" size={24} className="text-coral" weight="fill" />
              <h2 className="mt-4 text-xl font-black text-ink">เก็บแยกจากกัน</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                สร้างโปรไฟล์ใหม่สำหรับบัญชีนี้ ส่วนพาสปอร์ตแบบผู้เยี่ยมชมเดิมจะยังอยู่บนเบราว์เซอร์นี้
              </p>
              <PublicButton type="submit" variant="secondary" className="mt-5 w-full">
                สร้างโปรไฟล์แยก
              </PublicButton>
            </form>
          </div>
        </section>

        <p className="mt-5 text-sm leading-6 text-slate-600">
          การรวมพาสปอร์ตไม่ใช่ความยินยอมรับข่าวสาร คุณเปลี่ยนการแสดงชื่อบนอันดับได้ภายหลังในหน้าโปรไฟล์
        </p>
      </PublicPageFrame>
    </main>
  );
}
