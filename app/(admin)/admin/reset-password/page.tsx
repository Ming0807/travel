import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/admin/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | Admin | Southern Border Tourism",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F8F6] p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl text-[#0A6B62]">
            🔑
          </div>
          <h1 className="mt-5 text-2xl font-black text-[#073F37]">Set New Password</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Enter your new password below.
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
