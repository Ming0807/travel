"use client";

import Link from "next/link";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="tourism-container grid min-h-[70vh] place-items-center py-20 text-center">
      <div className="max-w-lg rounded-2xl bg-white p-8 shadow-card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <WarningCircle size={24} aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-3xl font-black text-[#073F37]">
          เกิดข้อผิดพลาด
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          ระบบเกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองอีกครั้ง หากปัญหายังคงอยู่กรุณาติดต่อผู้ดูแลระบบ
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-slate-400">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex rounded-full bg-[#0F766E] px-5 py-3 text-sm font-bold text-white hover:bg-[#0d6157] transition-colors"
          >
            ลองอีกครั้ง
          </button>
          <Link
            href="/"
            className="inline-flex rounded-full border-2 border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </section>
  );
}
