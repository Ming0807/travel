"use client";

import { WarningCircle } from "@phosphor-icons/react";

export default function AdminError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div role="alert" className="flex min-h-[400px] flex-col items-center justify-center border border-red-200 bg-red-50/50 p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-red-100 text-red-700">
        <WarningCircle size={26} weight="fill" aria-hidden="true" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-slate-900">เปิดส่วนจัดการนี้ไม่สำเร็จ</h2>
      <p className="mb-6 max-w-md text-sm leading-6 text-slate-600">
        ระบบยังโหลดข้อมูลส่วนนี้ไม่ได้ กรุณาลองอีกครั้ง โดยรายละเอียดภายในระบบจะไม่แสดงบนหน้าจอเพื่อความปลอดภัย
      </p>
      <button
        onClick={() => reset()}
        className="min-h-11 rounded-md bg-[#073F37] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#052e2b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E77455]"
      >
        ลองโหลดอีกครั้ง
      </button>
    </div>
  );
}
