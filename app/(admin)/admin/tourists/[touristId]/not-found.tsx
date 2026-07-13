import Link from "next/link";
import { ArrowLeft, UserCircle } from "@phosphor-icons/react/dist/ssr";

export default function TouristNotFound() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <UserCircle aria-hidden="true" size={30} weight="fill" />
      </span>
      <h2 className="mt-4 text-xl font-bold text-slate-900">ไม่พบข้อมูลนักท่องเที่ยว</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
        รายการนี้อาจไม่มีอยู่ หรือรหัสอ้างอิงไม่ถูกต้อง
      </p>
      <Link
        href="/admin/tourists"
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0A6B62] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#075049] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
      >
        <ArrowLeft aria-hidden="true" size={17} weight="bold" />
        กลับไปข้อมูลนักท่องเที่ยว
      </Link>
    </div>
  );
}
