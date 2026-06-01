"use client";

import { WarningOctagon, ArrowClockwise } from "@phosphor-icons/react/dist/ssr";

type ErrorStateProps = {
  title?: string;
  description?: string;
  error?: string | null;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({
  title = "เกิดข้อผิดพลาด",
  description = "กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ",
  error,
  onRetry,
  retryLabel = "ลองอีกครั้ง",
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" role="alert">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
        <WarningOctagon className="text-rose-500" size={26} weight="fill" />
      </div>
      <h3 className="mt-4 text-sm font-black text-rose-700">{title}</h3>
      <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">{description}</p>
      {error ? (
        <details className="mt-3 max-w-md text-left">
          <summary className="cursor-pointer text-xs font-bold text-slate-400 hover:text-slate-600">
            รายละเอียดทางเทคนิค
          </summary>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            {error}
          </pre>
        </details>
      ) : null}
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0A6B62]/50"
        >
          <ArrowClockwise size={16} weight="bold" />
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
