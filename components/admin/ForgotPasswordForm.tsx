"use client";

import { useState } from "react";
import { forgotPasswordAction } from "@/app/actions/admin-password-actions";
import { Spinner, EnvelopeSimple } from "@phosphor-icons/react";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setErrorMsg("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await forgotPasswordAction(formData);

    if (result.error) {
      setErrorMsg(result.error);
      setIsLoading(false);
    } else {
      setIsSent(true);
      setMessage(result.message || "If an account with that email exists, a password reset link has been sent.");
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600">
          <EnvelopeSimple size={24} weight="bold" />
        </div>
        <p className="font-semibold text-teal-800">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700">Email Address</label>
        <input
          type="email"
          name="email"
          required
          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal focus:bg-white"
          placeholder="admin@example.com"
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
          <EnvelopeSimple size={20} weight="bold" />
        )}
        Send Reset Link
      </button>
    </form>
  );
}
