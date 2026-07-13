import type { Metadata } from "next";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบแอดมิน | ท่องเที่ยวชายแดนใต้",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F8F6] p-4 font-sans">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-card sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-teal-50 text-[#0A6B62]">
            <ShieldCheck aria-hidden="true" size={28} weight="fill" />
          </div>
          <h1 className="mt-5 text-2xl font-black text-[#073F37]">เข้าสู่ระบบแอดมิน</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            ระบบจัดการข้อมูลและวิเคราะห์การท่องเที่ยวชายแดนใต้
          </p>
        </div>

        <LoginForm />

        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <p className="text-xs text-slate-400">
            สำหรับผู้ดูแลระบบที่ได้รับสิทธิ์เท่านั้น
          </p>
        </div>
      </div>
    </div>
  );
}
