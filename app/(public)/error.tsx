"use client";

import { useEffect } from "react";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public Route Error:", error);
  }, [error]);

  return (
    <section className="tourism-container grid min-h-[70vh] place-items-center py-20 text-center">
      <div className="max-w-lg rounded-2xl bg-white p-8 shadow-card">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <WarningCircle size={24} aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-[#073F37]">
          ไม่สามารถแสดงเนื้อหาได้
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          เกิดข้อผิดพลาดในการโหลดหน้านี้ กรุณาลองอีกครั้งในภายหลัง
          <br />
          <span className="mt-1 block text-xs text-slate-400">
            This page is temporarily unavailable. Please try again later.
          </span>
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
          <a
            href="/"
            className="inline-flex rounded-full border-2 border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            กลับหน้าแรก
          </a>
        </div>
      </div>
    </section>
  );
}
