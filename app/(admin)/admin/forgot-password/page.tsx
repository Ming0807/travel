import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/admin/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | Admin | Southern Border Tourism",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F8F6] p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl text-[#0A6B62]">
            🔐
          </div>
          <h1 className="mt-5 text-2xl font-black text-[#073F37]">Forgot Password</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your email address and we&apos;ll send you a reset link.
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="mt-8 text-center">
          <a
            href="/admin/login"
            className="text-sm font-bold text-[#0A6B62] transition hover:text-[#085A53]"
          >
            ← Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
