"use client";

import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { AdminShell } from "@/components/admin/AdminShell";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <AdminShell>
      <section className="mx-auto max-w-xl rounded-lg border border-rose-200 bg-white p-6 text-center">
        <WarningCircle aria-hidden="true" className="mx-auto text-rose-600" size={32} weight="fill" />
        <h1 className="mt-3 text-xl font-bold text-slate-900">ไม่สามารถแสดง Dashboard ได้</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">เกิดข้อผิดพลาดระหว่างโหลดข้อมูล กรุณาลองใหม่ หากยังพบปัญหาให้ตรวจสอบสถานะฐานข้อมูลและงานประมวลผลข้อมูลสรุป</p>
        <button type="button" onClick={reset} className="mt-5 min-h-11 rounded-md bg-[#171717] px-5 text-sm font-bold text-white hover:bg-[#B94727]">ลองโหลดอีกครั้ง</button>
      </section>
    </AdminShell>
  );
}
