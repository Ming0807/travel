"use client";

import Link from "next/link";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";

export default function StoryDetailError({ reset }: { reset: () => void }) {
  return (
    <PublicPageFrame variant="detail" className="pb-24 pt-14">
      <section className="mx-auto max-w-2xl border-y border-rose-200 bg-rose-50 px-5 py-14 text-center" role="alert">
        <h1 className="text-2xl font-black text-rose-950">ยังเปิดบทความนี้ไม่ได้</h1>
        <p className="mt-3 text-sm leading-6 text-rose-800">ระบบพบปัญหาระหว่างอ่านข้อมูล นี่ไม่ใช่กรณีไม่พบเรื่องราว คุณสามารถลองใหม่ได้</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="min-h-11 rounded-[var(--public-radius-control)] bg-rose-900 px-5 text-sm font-black text-white">ลองอีกครั้ง</button>
          <Link href="/stories" className="inline-flex min-h-11 items-center rounded-[var(--public-radius-control)] border border-rose-300 bg-white px-5 text-sm font-black text-rose-950">กลับหน้ารวมเรื่องราว</Link>
        </div>
      </section>
    </PublicPageFrame>
  );
}
