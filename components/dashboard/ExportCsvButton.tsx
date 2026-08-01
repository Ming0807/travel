"use client";

import { useSearchParams } from "next/navigation";
import { ExportPrivacyDialog } from "@/components/dashboard/ExportPrivacyDialog";

const exports = [
  ["summary", "สรุปภาพรวม"],
  ["tourists", "โปรไฟล์นักท่องเที่ยว"],
  ["visits", "รายการเข้าชม"],
  ["surveys", "แบบสำรวจ"],
  ["expenses", "ค่าใช้จ่าย"],
] as const;

export function ExportCsvButton() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString() ? `${searchParams.toString()}&` : "";
  return (
    <details className="relative">
      <summary className="inline-flex min-h-10 cursor-pointer list-none items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-[#B94727] hover:text-[#B94727]">ส่งออกข้อมูล</summary>
      <div className="absolute right-0 z-30 mt-2 flex w-60 flex-col gap-1 rounded-md border border-slate-200 bg-white p-2 shadow-[0_12px_32px_rgba(15,23,42,0.12)]">
        {exports.map(([exportType, label]) => <ExportPrivacyDialog key={exportType} endpoint="/api/admin/dashboard/export" exportType={exportType} label={label} searchParams={queryString} />)}
      </div>
    </details>
  );
}
