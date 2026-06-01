"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowClockwise, Spinner, CheckCircle } from "@phosphor-icons/react/dist/ssr";

export function RefreshSummaryButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "refreshing" | "done" | "error">("idle");

  const handleRefresh = async () => {
    setState("refreshing");
    try {
      const res = await fetch("/api/admin/dashboard/refresh-summary", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Refresh failed");
      }
      setState("done");
      // Refresh the page to show new data
      router.refresh();
      setTimeout(() => setState("idle"), 3000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={state === "refreshing"}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
        state === "error"
          ? "bg-red-50 text-red-600"
          : state === "done"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-[#0A6B62] text-white hover:bg-[#08564E] active:scale-[0.97]"
      }`}
    >
      {state === "refreshing" ? (
        <Spinner className="animate-spin" size={18} weight="bold" />
      ) : state === "done" ? (
        <CheckCircle size={18} weight="fill" />
      ) : (
        <ArrowClockwise size={18} weight="bold" />
      )}
      {state === "refreshing"
        ? "Refreshing..."
        : state === "done"
        ? "Refreshed!"
        : state === "error"
        ? "Error — try again"
        : "Refresh summary"}
    </button>
  );
}
