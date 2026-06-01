"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetPasswordAction } from "@/app/actions/admin-password-actions";
import { Spinner, Key } from "@phosphor-icons/react";

export function ResetPasswordForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setErrorMsg("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await resetPasswordAction(formData);

    if (result.error) {
      setErrorMsg(result.error);
      setIsLoading(false);
    } else {
      setMessage(result.message || "Password reset successfully.");
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {errorMsg}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-700">
          {message} Redirecting to login...
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700">New Password</label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal focus:bg-white"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700">Confirm New Password</label>
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal focus:bg-white"
          placeholder="Re-enter new password"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#0A6B62] px-6 py-3.5 font-bold text-white transition hover:bg-[#085A53] disabled:opacity-70"
      >
        {isLoading ? (
          <Spinner size={20} className="animate-spin" />
        ) : (
          <Key size={20} weight="bold" />
        )}
        Reset Password
      </button>
    </form>
  );
}
