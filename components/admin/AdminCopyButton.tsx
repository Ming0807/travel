"use client";

import { useEffect, useState, useCallback } from "react";
import { Copy, Check } from "@phosphor-icons/react/dist/ssr";

type AdminCopyButtonProps = {
  text: string;
  label?: string;
  tooltip?: string;
  variant?: "button" | "icon";
  onCopy?: () => void;
};

export function AdminCopyButton({
  text,
  label = "คัดลอก",
  tooltip = "คัดลอก",
  variant = "button",
  onCopy,
}: AdminCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      onCopy?.();
    }
  }, [text, onCopy]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  if (variant === "icon") {
    return (
      <button
        onClick={handleCopy}
        title={copied ? "คัดลอกแล้ว" : tooltip}
        aria-label={copied ? "คัดลอกแล้ว" : tooltip}
        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-500 transition hover:bg-slate-50 hover:text-[#0A6B62] focus:outline-none focus:ring-2 focus:ring-[#0A6B62]/50"
      >
        {copied ? <Check size={18} weight="bold" className="text-[#0A6B62]" /> : <Copy size={18} weight="bold" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}        title={copied ? "คัดลอกแล้ว" : tooltip}
        aria-label={copied ? "คัดลอกแล้ว" : tooltip}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:border-[#0A6B62]/30 hover:bg-[#E6F4EF] hover:text-[#0A6B62] focus:outline-none focus:ring-2 focus:ring-[#0A6B62]/50"
    >
      {copied ? <Check size={16} weight="bold" className="text-[#0A6B62]" /> : <Copy size={16} weight="bold" />}
      {copied ? "คัดลอกแล้ว" : label}
    </button>
  );
}
