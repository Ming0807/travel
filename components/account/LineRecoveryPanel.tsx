"use client";

import { useState } from "react";
import { ChatCircleDots, Spinner, WarningCircle } from "@phosphor-icons/react";
import { isLineLiffConfigured } from "@/lib/services/line-liff.client";

export function LineRecoveryPanel({ className = "" }: { className?: string }) {
  const [uiState, setUiState] = useState<
    { kind: "idle" } | { kind: "redirecting" } | { kind: "error"; message: string }
  >({ kind: "idle" });
  const isConfigured = isLineLiffConfigured();
  const isBusy = uiState.kind === "redirecting";

  const handleRecover = async () => {
    if (!isConfigured) return;

    setUiState({ kind: "redirecting" });
    try {
      const liff = (await import("@line/liff")).default;
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID || "";
      await liff.init({ liffId });

      if (!liff.isLoggedIn()) {
        liff.login({ redirectUri: window.location.href });
        return; // Will redirect
      }

      const idToken = liff.getIDToken();
      if (!idToken) {
        setUiState({ kind: "error", message: "ไม่สามารถเชื่อมต่อ LINE ได้ กรุณาลองใหม่" });
        return;
      }

      const response = await fetch("/api/line/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, hasConsented: true, language: "th" }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.recovered) {
        window.location.reload();
      } else {
        setUiState({
          kind: "error",
          message: data?.error?.message || "เกิดข้อผิดพลาดในการกู้คืนบัญชี กรุณาลองใหม่",
        });
      }
    } catch (err) {
      setUiState({ kind: "error", message: "LINE ชั่วคราวไม่สามารถใช้งานได้" });
    }
  };

  if (!isConfigured) return null;

  return (
    <div className={`mt-6 pt-6 border-t border-ink/10 ${className}`}>
      <p className="text-sm text-ink mb-4 font-semibold">เคยใช้งานแล้ว? กู้คืนพาสปอร์ตเดิมของคุณ</p>
      {uiState.kind === "error" && (
        <div className="mb-4 flex gap-3 rounded-[1rem] border border-red-500/20 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-500">
          <WarningCircle className="mt-0.5 shrink-0" size={20} weight="fill" />
          <span>{uiState.message}</span>
        </div>
      )}
      <button
        type="button"
        onClick={handleRecover}
        disabled={isBusy}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#06C755] px-6 py-4 text-sm font-black text-white shadow-sm transition hover:bg-[#05B34C] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
      >
        {isBusy ? <Spinner size={20} className="animate-spin" /> : <ChatCircleDots size={20} weight="bold" />}
        เข้าสู่ระบบด้วย LINE เพื่อกู้คืนข้อมูล
      </button>
    </div>
  );
}
