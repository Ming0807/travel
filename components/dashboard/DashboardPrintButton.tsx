"use client";

import { Printer } from "@phosphor-icons/react";

export function DashboardPrintButton({ reportLabel }: { reportLabel: string }) {
  return (
    <button
      aria-label={`พิมพ์หรือบันทึก PDF ${reportLabel}`}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] border border-slate-300 bg-white px-3 text-sm font-bold text-slate-800 transition-colors hover:border-[#D94717] hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D94717]"
      onClick={() => window.print()}
      type="button"
    >
      <Printer aria-hidden="true" size={18} />
      พิมพ์ / PDF
    </button>
  );
}
