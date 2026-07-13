"use client";

import { WarningCircle } from "@phosphor-icons/react";

export default function AdminTouristsError({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-700">
        <WarningCircle aria-hidden="true" size={28} weight="fill" />
      </span>
      <h2 className="mt-4 text-xl font-bold text-slate-900">ไม่สามารถโหลดข้อมูลนักท่องเที่ยวได้</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">โปรดลองอีกครั้ง หากปัญหายังคงอยู่ให้ตรวจสอบการเชื่อมต่อฐานข้อมูลและสิทธิ์ของบัญชีผู้ดูแล</p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 min-h-11 rounded-lg bg-[#0A6B62] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#075049] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
      >
        ลองอีกครั้ง
      </button>
    </div>
  );
}
