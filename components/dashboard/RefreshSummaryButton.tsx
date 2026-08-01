"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowClockwise, CheckCircle, Spinner } from "@phosphor-icons/react/dist/ssr";

export function RefreshSummaryButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "refreshing" | "done" | "error">("idle");

  async function refresh() {
    setState("refreshing");
    try {
      const response = await fetch("/api/admin/dashboard/refresh-summary", { method: "POST" });
      if (!response.ok) throw new Error("REFRESH_FAILED");
      setState("done");
      router.refresh();
    } catch {
      setState("error");
    } finally {
      window.setTimeout(() => setState("idle"), 3000);
    }
  }

  const label = state === "refreshing" ? "กำลังประมวลผล..." : state === "done" ? "อัปเดตแล้ว" : state === "error" ? "ไม่สำเร็จ ลองอีกครั้ง" : "ประมวลผลข้อมูลสรุปใหม่";

  return (
    <button type="button" onClick={refresh} disabled={state === "refreshing"} className={`inline-flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-bold transition-colors disabled:cursor-wait ${state === "error" ? "bg-rose-50 text-rose-700" : state === "done" ? "bg-emerald-50 text-emerald-700" : "bg-[#171717] text-white hover:bg-[#B94727]"}`}>
      {state === "refreshing" ? <Spinner aria-hidden="true" className="animate-spin" size={18} /> : state === "done" ? <CheckCircle aria-hidden="true" size={18} weight="fill" /> : <ArrowClockwise aria-hidden="true" size={18} weight="bold" />}
      {label}
    </button>
  );
}
