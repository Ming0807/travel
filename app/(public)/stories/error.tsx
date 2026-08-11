"use client";

import { WarningCircle } from "@phosphor-icons/react";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";

export default function StoriesError({ reset }: { reset: () => void }) {
  return (
    <PublicPageFrame variant="listing" className="pb-24 pt-14">
      <section className="mx-auto max-w-2xl border-y border-rose-200 bg-rose-50 px-5 py-14 text-center" role="alert">
        <WarningCircle size={42} weight="duotone" className="mx-auto text-rose-700" aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-black text-rose-950">เปิดเรื่องราวไม่ได้ในขณะนี้</h1>
        <p className="mt-3 text-sm leading-6 text-rose-800">การเชื่อมต่อข้อมูลขัดข้องชั่วคราว กรุณาลองใหม่โดยไม่ต้องเริ่มค้นหาตั้งแต่ต้น</p>
        <button type="button" onClick={reset} className="mt-7 min-h-11 rounded-[var(--public-radius-control)] bg-rose-900 px-5 text-sm font-black text-white hover:bg-rose-800">
          ลองโหลดอีกครั้ง
        </button>
      </section>
    </PublicPageFrame>
  );
}
