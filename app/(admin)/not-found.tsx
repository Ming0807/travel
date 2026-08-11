import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import Link from "next/link";
import { ArrowLeft, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

export default function AdminNotFound() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <AdminPageHeader eyebrow="ไม่พบหน้า" title="ไม่พบหน้าจัดการนี้" description="ลิงก์อาจถูกย้ายหรือคุณอาจยังไม่มีสิทธิ์เข้าถึงเมนูดังกล่าว" />
        <div className="border border-slate-200 bg-white p-8 text-center sm:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-slate-100 text-slate-700">
            <MagnifyingGlass size={22} aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-slate-900">ตรวจสอบที่อยู่หรือกลับไปเลือกเมนูจากหน้าภาพรวม</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            ระบบไม่พบหน้าหรือรายการที่ร้องขอ หากเปิดจากบุ๊กมาร์กเดิม โปรดกลับไปยังหน้าภาพรวมเพื่อเลือกเมนูอีกครั้ง
          </p>
          <div className="mt-6">
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#073F37] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#052e2b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E77455]"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              กลับหน้าภาพรวม
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
