"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy } from "@phosphor-icons/react";

type CopyCheckinUrlActionProps = {
  code: string;
};

export function CopyCheckinUrlAction({ code }: CopyCheckinUrlActionProps) {
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(
    () => () => undefined,
    () => (typeof window === "undefined" ? "" : window.location.origin),
    () => ""
  );
  const safeCode = code.trim();
  const isReady = !!origin && /^[a-z0-9_-]{3,100}$/i.test(safeCode);

  return (
    <button
      type="button"
      disabled={!isReady}
      onClick={() => {
        if (!isReady) return;
        void navigator.clipboard?.writeText(`${origin}/c/${safeCode}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
      title={copied ? "Copied" : "Copy public QR URL"}
      aria-label={`Copy public QR URL for ${safeCode}`}
      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-500 transition hover:bg-slate-50 hover:text-[#0A6B62] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
    >
      {copied ? <Check size={18} weight="bold" /> : <Copy size={18} weight="bold" />}
    </button>
  );
}
