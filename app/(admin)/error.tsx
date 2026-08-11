"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import Link from "next/link";
import { ArrowLeft, ShieldWarning } from "@phosphor-icons/react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string; code?: string };
  reset: () => void;
}) {
  const isUnauthorized =
    error.message?.includes("UNAUTHORIZED") ||
    error.message?.includes("sign in") ||
    error.code === "UNAUTHORIZED";

  const isForbidden =
    error.message?.includes("FORBIDDEN") ||
    error.message?.includes("permission") ||
    error.code === "FORBIDDEN";

  let title = "เปิดหน้าจัดการไม่สำเร็จ";
  let description = "ระบบไม่สามารถโหลดหน้านี้ได้ในขณะนี้ กรุณาลองอีกครั้ง";

  if (isUnauthorized) {
    title = "กรุณาเข้าสู่ระบบอีกครั้ง";
    description = "เซสชันผู้ดูแลอาจหมดอายุ กรุณาเข้าสู่ระบบก่อนกลับมาทำรายการต่อ";
  } else if (isForbidden) {
    title = "ไม่มีสิทธิ์เข้าถึง";
    description = "บัญชีนี้ไม่มีสิทธิ์เปิดหน้าหรือดำเนินการดังกล่าว หากจำเป็นต้องใช้งานโปรดติดต่อผู้ดูแลหลัก";
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader eyebrow="สถานะระบบ" title={title} description={description} />
        <div className="border border-slate-200 bg-white p-8 text-center sm:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-red-50 text-red-700">
            <ShieldWarning size={24} weight="fill" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-slate-900">ยังไม่มีการเปลี่ยนแปลงข้อมูลจากหน้าที่เปิดไม่สำเร็จ</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">ลองเปิดหน้าอีกครั้ง หรือกลับไปหน้าภาพรวมเพื่อเลือกเมนูอื่น</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="min-h-11 rounded-md bg-[#073F37] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#052e2b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E77455]"
            >
              ลองโหลดอีกครั้ง
            </button>
            <Link
              href={isUnauthorized ? "/admin/login" : "/admin"}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#073F37]"
            >
              <ArrowLeft size={17} aria-hidden="true" />
              {isUnauthorized ? "ไปหน้าเข้าสู่ระบบ" : "กลับหน้าภาพรวม"}
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
