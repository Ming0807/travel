"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdminAction } from "@/app/actions/admin-auth-actions";
import { SignIn, Spinner } from "@phosphor-icons/react";

export function LoginForm() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAdminAction(formData);

    if (!result.success) {
      setErrorMsg(result.error || "Login failed");
      setIsLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700">Username or Email</label>
        <input
          type="text"
          name="email"
          required
          autoComplete="username"
          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal focus:bg-white"
          placeholder="amornthep or admin@example.com"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-slate-700">Password</label>
        <input
          type="password"
          name="password"
          required
          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-teal focus:bg-white"
          placeholder="••••••••"
        />
      </div>

      <div className="-mt-2 flex justify-end">
        <a
          href="/admin/forgot-password"
          className="text-xs font-semibold text-[#0A6B62] transition hover:text-[#085A53] hover:underline"
        >
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#0A6B62] px-6 py-3.5 font-bold text-white transition hover:bg-[#085A53] disabled:opacity-70"
      >
        {isLoading ? (
          <Spinner size={20} className="animate-spin" />
        ) : (
          <SignIn size={20} weight="bold" />
        )}
        Sign In to Backoffice
      </button>
    </form>
  );
}
