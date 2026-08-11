"use client";

import { useId, useState } from "react";
import { ChatCircleDots, Spinner, WarningCircle } from "@phosphor-icons/react";
import { isLineLiffConfigured, recoverLinePassport } from "@/lib/services/line-liff.client";

export function LineRecoveryPanel({ className = "" }: { className?: string }) {
  const consentId = useId();
  const [hasConsented, setHasConsented] = useState(false);
  const [uiState, setUiState] = useState<
    { kind: "idle" } | { kind: "redirecting" } | { kind: "error"; message: string }
  >({ kind: "idle" });
  const isConfigured = isLineLiffConfigured();
  const isBusy = uiState.kind === "redirecting";

  const handleRecover = async () => {
    if (!isConfigured) return;

    if (!hasConsented) {
      setUiState({ kind: "error", message: "กรุณายืนยันความยินยอมก่อนกู้คืนพาสปอร์ต" });
      return;
    }

    setUiState({ kind: "redirecting" });
    const result = await recoverLinePassport({ hasConsented: true, language: "th" });
    if (result.status === "recovered") {
      window.location.reload();
      return;
    }
    if (result.status === "login_redirected") return;
    if (result.status === "not_configured") {
      setUiState({ kind: "error", message: "LINE ยังไม่พร้อมใช้งานในตอนนี้" });
      return;
    }
    setUiState({ kind: "error", message: result.message });
  };

  if (!isConfigured) return null;

  return (
    <div className={`mt-7 border-t border-ink/10 pt-6 ${className}`}>
      <p className="text-sm font-bold text-ink">เคยใช้งานแล้ว? กู้คืนพาสปอร์ตเดิม</p>
      <p className="mt-1 text-xs leading-5 text-muted">LINE ใช้เพื่อค้นคืนพาสปอร์ตเท่านั้น ไม่ใช่การสมัครรับข่าวสาร</p>
      {uiState.kind === "error" && (
        <div className="mt-4 flex gap-3 rounded-md border border-red-500/20 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-600">
          <WarningCircle className="mt-0.5 shrink-0" size={20} weight="fill" />
          <span>{uiState.message}</span>
        </div>
      )}
      <label htmlFor={consentId} className="mt-4 flex cursor-pointer gap-3 rounded-md border border-ink/10 bg-background p-4 text-sm leading-6 text-ink">
        <input
          id={consentId}
          type="checkbox"
          checked={hasConsented}
          onChange={(event) => {
            setHasConsented(event.target.checked);
            if (uiState.kind === "error") setUiState({ kind: "idle" });
          }}
          className="mt-1 h-5 w-5 shrink-0 accent-teal"
        />
        <span>ฉันยินยอมให้ระบบเชื่อมบัญชี LINE เพื่อค้นคืนพาสปอร์ตเดิม</span>
      </label>
      <button
        type="button"
        onClick={handleRecover}
        disabled={isBusy}
        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#06C755] px-5 py-3 text-sm font-black text-white transition hover:bg-[#05B34C] disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {isBusy ? <Spinner size={20} className="animate-spin" /> : <ChatCircleDots size={20} weight="bold" />}
        กู้คืนพาสปอร์ตด้วย LINE
      </button>
    </div>
  );
}
