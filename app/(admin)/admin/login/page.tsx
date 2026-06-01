import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login | Southern Border Tourism",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F8F6] p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl text-[#0A6B62]">
            🇹🇭
          </div>
          <h1 className="mt-5 text-2xl font-black text-[#073F37]">Admin Portal</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Southern Border Tourism Data & Intelligence Platform
          </p>
        </div>

        <LoginForm />

        <div className="mt-8 border-t border-slate-100 pt-6 text-center">
          <p className="text-xs text-slate-400">
            This area is restricted to authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
