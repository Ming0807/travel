"use client";

import { useState } from "react";
import Link from "next/link";
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
      setErrorMsg(result.error || "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง");
      setIsLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
          className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/20"
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
          className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0A6B62] focus:ring-2 focus:ring-[#0A6B62]/20"
          placeholder="••••••••"
        />
      </div>

      <div className="-mt-2 flex justify-end">
        <Link
          href="/admin/forgot-password"
          className="text-xs font-semibold text-[#0A6B62] transition hover:text-[#085A53] hover:underline"
        >
          ลืมรหัสผ่าน?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#0A6B62] px-6 py-3.5 font-bold text-white transition hover:bg-[#085A53] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? (
          <Spinner size={20} className="animate-spin" />
        ) : (
          <SignIn size={20} weight="bold" />
        )}
        {isLoading ? "กำลังเข้าสู่ระบบ" : "เข้าสู่ระบบหลังบ้าน"}
      </button>
    </form>
  );
}
