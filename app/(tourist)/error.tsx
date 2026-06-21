"use client";

import { useEffect } from "react";
import Link from "next/link";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";

export default function TouristError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Tourist Route Error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md w-full rounded-2xl bg-white p-8 md:p-10 text-center border border-ink/5">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
          <WarningCircle size={32} weight="fill" />
        </div>
        <h1 className="text-2xl font-black text-ink">เกิดข้อผิดพลาด</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          ไม่สามารถโหลดข้อมูลในส่วนนี้ได้ กรุณาลองใหม่อีกครั้ง
          <br />
          <span className="mt-1 block text-xs text-slate-400">
            Something went wrong. Please try again.
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
            className="inline-flex rounded-full bg-teal px-5 py-3 text-sm font-bold text-white hover:bg-teal/90 transition-colors"
          >
            ลองอีกครั้ง
          </button>
          <Link
            href="/"
            className="inline-flex rounded-full border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </main>
  );
}
