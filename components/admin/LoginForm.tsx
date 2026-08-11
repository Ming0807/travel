"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAdminAction } from "@/app/actions/admin-auth-actions";
import { SignIn, Spinner } from "@phosphor-icons/react";

export function LoginForm({ redirectTo = "/admin" }: { redirectTo?: string }) {
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
      setErrorMsg(result.error || "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง");
      setIsLoading(false);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" aria-label="แบบฟอร์มเข้าสู่ระบบหลังบ้าน">
      {errorMsg && (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      <div>
        <label htmlFor="admin-username" className="mb-1.5 block text-sm font-bold text-slate-700">ชื่อผู้ใช้หรืออีเมล</label>
        <input
          id="admin-username"
          type="text"
          name="email"
          required
          autoComplete="username"
          className="min-h-12 w-full rounded-[var(--public-radius-control)] border border-slate-300 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-[var(--public-teal)] focus:ring-2 focus:ring-[var(--public-teal)]/20"
          placeholder="เช่น amornthep หรือ admin@example.com"
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-sm font-bold text-slate-700">รหัสผ่าน</label>
        <input
          id="admin-password"
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="min-h-12 w-full rounded-[var(--public-radius-control)] border border-slate-300 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-[var(--public-teal)] focus:ring-2 focus:ring-[var(--public-teal)]/20"
          placeholder="••••••••"
        />
      </div>

      <div className="-mt-2 flex justify-end">
        <Link
          href="/admin/forgot-password"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--public-teal)] hover:underline"
        >
          ลืมรหัสผ่าน?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-[var(--public-radius-control)] bg-[var(--public-coral)] px-6 py-3.5 font-semibold text-[var(--public-ink)] transition-colors hover:bg-[#d86548] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <Spinner size={20} className="animate-spin" />
        ) : (
          <SignIn size={20} weight="bold" />
        )}
        {isLoading ? "กำลังตรวจสอบบัญชี" : "เข้าสู่ระบบหลังบ้าน"}
      </button>
    </form>
  );
}
